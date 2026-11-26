package com.procurement.system.service;

import com.procurement.system.entity.PurchaseRequisition;
import com.procurement.system.entity.RequisitionItem;
import com.procurement.system.exception.BusinessRuleException;
import com.procurement.system.exception.DuplicateResourceException;
import com.procurement.system.exception.ResourceNotFoundException;
import com.procurement.system.repository.PurchaseOrderRepository;
import com.procurement.system.repository.PurchaseRequisitionRepository;
import com.procurement.system.repository.QuotationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class RequisitionService {

    private final PurchaseRequisitionRepository requisitionRepository;
    private final QuotationRepository quotationRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public RequisitionService(PurchaseRequisitionRepository requisitionRepository,
                              QuotationRepository quotationRepository,
                              PurchaseOrderRepository purchaseOrderRepository) {
        this.requisitionRepository = requisitionRepository;
        this.quotationRepository = quotationRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<PurchaseRequisition> getAllRequisitions(String search, String status) {
        if (search != null && !search.trim().isEmpty()) {
            return requisitionRepository.findByDepartmentContainingIgnoreCaseOrRequestNumberContainingIgnoreCase(
                    search.trim(), search.trim());
        }
        if (status != null && !status.trim().isEmpty()) {
            return requisitionRepository.findByStatusIgnoreCase(status.trim());
        }
        return requisitionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public PurchaseRequisition getRequisitionById(Long id) {
        return requisitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase requisition not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public PurchaseRequisition getRequisitionByRequestNumber(String requestNumber) {
        return requisitionRepository.findByRequestNumber(requestNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase requisition not found with request number: " + requestNumber));
    }

    public PurchaseRequisition createRequisition(PurchaseRequisition requisition) {
        validateRequisitionDetails(requisition);

        // Auto-generate requestNumber if not specified
        if (requisition.getRequestNumber() == null || requisition.getRequestNumber().trim().isEmpty()) {
            requisition.setRequestNumber(generateRequestNumber());
        } else {
            String normalizedNumber = requisition.getRequestNumber().trim();
            if (requisitionRepository.existsByRequestNumber(normalizedNumber)) {
                throw new DuplicateResourceException("Request number '" + normalizedNumber + "' already exists");
            }
            requisition.setRequestNumber(normalizedNumber);
        }

        if (requisition.getRequestDate() == null) {
            requisition.setRequestDate(LocalDate.now());
        }
        if (requisition.getStatus() == null || requisition.getStatus().trim().isEmpty()) {
            requisition.setStatus("Open");
        }

        validateLineItems(requisition.getItems());

        return requisitionRepository.save(requisition);
    }

    public PurchaseRequisition updateRequisition(Long id, PurchaseRequisition updatedRequisition) {
        PurchaseRequisition existing = getRequisitionById(id);

        if ("Closed".equalsIgnoreCase(existing.getStatus()) || "Cancelled".equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessRuleException("Cannot modify a requisition that is already " + existing.getStatus());
        }

        validateRequisitionDetails(updatedRequisition);

        String normalizedNumber = updatedRequisition.getRequestNumber().trim();
        if (requisitionRepository.existsByRequestNumberAndRequisitionIdNot(normalizedNumber, id)) {
            throw new DuplicateResourceException("Request number '" + normalizedNumber + "' is already in use");
        }

        existing.setRequestNumber(normalizedNumber);
        existing.setDepartment(updatedRequisition.getDepartment().trim());
        existing.setRequestedBy(updatedRequisition.getRequestedBy().trim());
        existing.setRequiredDate(updatedRequisition.getRequiredDate());
        existing.setRemarks(updatedRequisition.getRemarks());

        if (updatedRequisition.getStatus() != null && !updatedRequisition.getStatus().trim().isEmpty()) {
            existing.setStatus(updatedRequisition.getStatus().trim());
        }

        validateLineItems(updatedRequisition.getItems());
        existing.setItems(updatedRequisition.getItems());

        return requisitionRepository.save(existing);
    }

    public PurchaseRequisition updateRequisitionStatus(Long id, String status) {
        PurchaseRequisition existing = getRequisitionById(id);
        if (status == null || status.trim().isEmpty()) {
            throw new BusinessRuleException("Status cannot be empty");
        }
        existing.setStatus(status.trim());
        return requisitionRepository.save(existing);
    }

    public void deleteRequisition(Long id) {
        PurchaseRequisition existing = getRequisitionById(id);

        boolean hasQuotations = quotationRepository.existsByPurchaseRequisition_RequisitionId(id);
        boolean hasOrders = purchaseOrderRepository.existsByPurchaseRequisition_RequisitionId(id);

        if (hasQuotations || hasOrders) {
            throw new BusinessRuleException("Cannot delete purchase requisition '" + existing.getRequestNumber() +
                    "' because it is referenced by existing " +
                    (hasQuotations && hasOrders ? "quotations and purchase orders" :
                     hasQuotations ? "quotations" : "purchase orders") +
                    ". Please close or cancel it instead.");
        }

        requisitionRepository.delete(existing);
    }

    private void validateRequisitionDetails(PurchaseRequisition requisition) {
        if (requisition.getDepartment() == null || requisition.getDepartment().trim().isEmpty()) {
            throw new BusinessRuleException("Department is required");
        }
        if (requisition.getRequestedBy() == null || requisition.getRequestedBy().trim().isEmpty()) {
            throw new BusinessRuleException("Requested-by field is required");
        }
        if (requisition.getRequiredDate() == null) {
            throw new BusinessRuleException("Required date is required");
        }
    }

    private void validateLineItems(List<RequisitionItem> items) {
        if (items != null) {
            for (RequisitionItem item : items) {
                if (item.getProductName() == null || item.getProductName().trim().isEmpty()) {
                    throw new BusinessRuleException("Line item product name is required");
                }
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    throw new BusinessRuleException("Line item quantity must be positive and greater than 0");
                }
                if (item.getEstimatedPrice() != null && item.getEstimatedPrice().compareTo(BigDecimal.ZERO) < 0) {
                    throw new BusinessRuleException("Estimated price cannot be negative");
                }
            }
        }
    }

    private String generateRequestNumber() {
        return "REQ-" + System.currentTimeMillis();
    }
}
