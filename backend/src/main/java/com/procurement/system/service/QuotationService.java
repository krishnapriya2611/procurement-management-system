package com.procurement.system.service;

import com.procurement.system.dto.QuotationComparisonDTO;
import com.procurement.system.entity.PurchaseRequisition;
import com.procurement.system.entity.Quotation;
import com.procurement.system.entity.Supplier;
import com.procurement.system.exception.BusinessRuleException;
import com.procurement.system.exception.DuplicateResourceException;
import com.procurement.system.exception.ResourceNotFoundException;
import com.procurement.system.repository.PurchaseRequisitionRepository;
import com.procurement.system.repository.QuotationRepository;
import com.procurement.system.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseRequisitionRepository requisitionRepository;

    public QuotationService(QuotationRepository quotationRepository,
                            SupplierRepository supplierRepository,
                            PurchaseRequisitionRepository requisitionRepository) {
        this.quotationRepository = quotationRepository;
        this.supplierRepository = supplierRepository;
        this.requisitionRepository = requisitionRepository;
    }

    @Transactional(readOnly = true)
    public List<Quotation> getAllQuotations(String status) {
        if (status != null && !status.trim().isEmpty()) {
            return quotationRepository.findByStatusIgnoreCase(status.trim());
        }
        return quotationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Quotation getQuotationById(Long id) {
        return quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Quotation> getQuotationsByRequisition(Long requisitionId) {
        return quotationRepository.findByPurchaseRequisition_RequisitionId(requisitionId);
    }

    @Transactional(readOnly = true)
    public QuotationComparisonDTO compareQuotations(Long requisitionId) {
        PurchaseRequisition requisition = requisitionRepository.findById(requisitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase requisition not found with id: " + requisitionId));

        List<Quotation> quotations = quotationRepository.findByPurchaseRequisition_RequisitionId(requisitionId);

        QuotationComparisonDTO comparison = new QuotationComparisonDTO(
                requisition.getRequisitionId(),
                requisition.getRequestNumber(),
                requisition.getDepartment(),
                requisition.getRequiredDate()
        );

        for (Quotation q : quotations) {
            QuotationComparisonDTO.QuotationItemDTO item = new QuotationComparisonDTO.QuotationItemDTO();
            item.setQuotationId(q.getQuotationId());
            item.setQuotationNumber(q.getQuotationNumber());
            if (q.getSupplier() != null) {
                item.setSupplierId(q.getSupplier().getSupplierId());
                item.setSupplierCode(q.getSupplier().getSupplierCode());
                item.setSupplierCompanyName(q.getSupplier().getCompanyName());
            }
            item.setQuotationDate(q.getQuotationDate());
            item.setValidityDate(q.getValidityDate());
            item.setQuotedAmount(q.getQuotedAmount());
            item.setDeliveryDays(q.getDeliveryDays());
            item.setStatus(q.getStatus());
            comparison.addQuotation(item);
        }

        return comparison;
    }

    public Quotation createQuotation(Quotation quotation, Long supplierId, Long requisitionId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        PurchaseRequisition requisition = requisitionRepository.findById(requisitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase requisition not found with id: " + requisitionId));

        if ("Closed".equalsIgnoreCase(requisition.getStatus()) || "Cancelled".equalsIgnoreCase(requisition.getStatus())) {
            throw new BusinessRuleException("Cannot add quotation to a requisition that is already " + requisition.getStatus());
        }

        validateQuotationData(quotation);

        if (quotation.getQuotationNumber() == null || quotation.getQuotationNumber().trim().isEmpty()) {
            quotation.setQuotationNumber(generateQuotationNumber());
        } else {
            String normalizedNumber = quotation.getQuotationNumber().trim();
            if (quotationRepository.existsByQuotationNumber(normalizedNumber)) {
                throw new DuplicateResourceException("Quotation number '" + normalizedNumber + "' already exists");
            }
            quotation.setQuotationNumber(normalizedNumber);
        }

        quotation.setSupplier(supplier);
        quotation.setPurchaseRequisition(requisition);

        if (quotation.getQuotationDate() == null) {
            quotation.setQuotationDate(LocalDate.now());
        }
        if (quotation.getStatus() == null || quotation.getStatus().trim().isEmpty()) {
            quotation.setStatus("Pending Review");
        }

        return quotationRepository.save(quotation);
    }

    public Quotation updateQuotation(Long id, Quotation updatedQuotation, Long supplierId, Long requisitionId) {
        Quotation existing = getQuotationById(id);

        validateQuotationData(updatedQuotation);

        String normalizedNumber = updatedQuotation.getQuotationNumber().trim();
        if (quotationRepository.existsByQuotationNumberAndQuotationIdNot(normalizedNumber, id)) {
            throw new DuplicateResourceException("Quotation number '" + normalizedNumber + "' is already in use");
        }

        if (supplierId != null && (existing.getSupplier() == null || !supplierId.equals(existing.getSupplier().getSupplierId()))) {
            Supplier supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));
            existing.setSupplier(supplier);
        }

        if (requisitionId != null && (existing.getPurchaseRequisition() == null || !requisitionId.equals(existing.getPurchaseRequisition().getRequisitionId()))) {
            PurchaseRequisition requisition = requisitionRepository.findById(requisitionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Purchase requisition not found with id: " + requisitionId));
            existing.setPurchaseRequisition(requisition);
        }

        existing.setQuotationNumber(normalizedNumber);
        existing.setQuotationDate(updatedQuotation.getQuotationDate());
        existing.setValidityDate(updatedQuotation.getValidityDate());
        existing.setQuotedAmount(updatedQuotation.getQuotedAmount());
        existing.setDeliveryDays(updatedQuotation.getDeliveryDays());
        if (updatedQuotation.getStatus() != null && !updatedQuotation.getStatus().trim().isEmpty()) {
            existing.setStatus(updatedQuotation.getStatus().trim());
        }

        return quotationRepository.save(existing);
    }

    public Quotation updateQuotationStatus(Long id, String status) {
        Quotation existing = getQuotationById(id);
        if (status == null || status.trim().isEmpty()) {
            throw new BusinessRuleException("Status cannot be empty");
        }
        existing.setStatus(status.trim());
        return quotationRepository.save(existing);
    }

    public void deleteQuotation(Long id) {
        Quotation existing = getQuotationById(id);
        quotationRepository.delete(existing);
    }

    private void validateQuotationData(Quotation quotation) {
        if (quotation.getQuotedAmount() == null) {
            throw new BusinessRuleException("Quoted amount is required");
        }
        if (quotation.getQuotedAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Quoted amount cannot be negative");
        }
        if (quotation.getDeliveryDays() == null || quotation.getDeliveryDays() <= 0) {
            throw new BusinessRuleException("Delivery days must be a positive integer");
        }
        if (quotation.getValidityDate() == null) {
            throw new BusinessRuleException("Validity date is required");
        }
    }

    private String generateQuotationNumber() {
        return "QUOT-" + System.currentTimeMillis();
    }
}
