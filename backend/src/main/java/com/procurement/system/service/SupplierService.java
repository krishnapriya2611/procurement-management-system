package com.procurement.system.service;

import com.procurement.system.entity.Supplier;
import com.procurement.system.exception.BusinessRuleException;
import com.procurement.system.exception.DuplicateResourceException;
import com.procurement.system.exception.ResourceNotFoundException;
import com.procurement.system.repository.PurchaseOrderRepository;
import com.procurement.system.repository.QuotationRepository;
import com.procurement.system.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final QuotationRepository quotationRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public SupplierService(SupplierRepository supplierRepository,
                           QuotationRepository quotationRepository,
                           PurchaseOrderRepository purchaseOrderRepository) {
        this.supplierRepository = supplierRepository;
        this.quotationRepository = quotationRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<Supplier> getAllSuppliers(String search, String status) {
        if (search != null && !search.trim().isEmpty()) {
            return supplierRepository.findByCompanyNameContainingIgnoreCaseOrSupplierCodeContainingIgnoreCase(
                    search.trim(), search.trim());
        }
        if (status != null && !status.trim().isEmpty()) {
            return supplierRepository.findByStatusIgnoreCase(status.trim());
        }
        return supplierRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Supplier getSupplierByCode(String code) {
        return supplierRepository.findBySupplierCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with code: " + code));
    }

    public Supplier createSupplier(Supplier supplier) {
        if (supplier.getSupplierCode() == null || supplier.getSupplierCode().trim().isEmpty()) {
            throw new BusinessRuleException("Supplier code is required");
        }
        if (supplier.getCompanyName() == null || supplier.getCompanyName().trim().isEmpty()) {
            throw new BusinessRuleException("Company name is required");
        }
        String normalizedCode = supplier.getSupplierCode().trim();
        if (supplierRepository.existsBySupplierCode(normalizedCode)) {
            throw new DuplicateResourceException("Supplier code '" + normalizedCode + "' already exists");
        }
        supplier.setSupplierCode(normalizedCode);
        if (supplier.getStatus() == null || supplier.getStatus().trim().isEmpty()) {
            supplier.setStatus("Active");
        }
        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(Long id, Supplier updatedSupplier) {
        Supplier existing = getSupplierById(id);

        if (updatedSupplier.getSupplierCode() == null || updatedSupplier.getSupplierCode().trim().isEmpty()) {
            throw new BusinessRuleException("Supplier code is required");
        }
        if (updatedSupplier.getCompanyName() == null || updatedSupplier.getCompanyName().trim().isEmpty()) {
            throw new BusinessRuleException("Company name is required");
        }

        String normalizedCode = updatedSupplier.getSupplierCode().trim();
        if (supplierRepository.existsBySupplierCodeAndSupplierIdNot(normalizedCode, id)) {
            throw new DuplicateResourceException("Supplier code '" + normalizedCode + "' is already in use by another supplier");
        }

        existing.setSupplierCode(normalizedCode);
        existing.setCompanyName(updatedSupplier.getCompanyName().trim());
        existing.setContactPerson(updatedSupplier.getContactPerson());
        existing.setEmail(updatedSupplier.getEmail());
        existing.setPhone(updatedSupplier.getPhone());
        existing.setAddress(updatedSupplier.getAddress());
        existing.setCity(updatedSupplier.getCity());
        if (updatedSupplier.getStatus() != null && !updatedSupplier.getStatus().trim().isEmpty()) {
            existing.setStatus(updatedSupplier.getStatus().trim());
        }

        return supplierRepository.save(existing);
    }

    public Supplier updateSupplierStatus(Long id, String status) {
        Supplier existing = getSupplierById(id);
        if (status == null || status.trim().isEmpty()) {
            throw new BusinessRuleException("Status cannot be empty");
        }
        existing.setStatus(status.trim());
        return supplierRepository.save(existing);
    }

    public void deleteSupplier(Long id) {
        Supplier existing = getSupplierById(id);

        // Business rule check: Prevent deletion of suppliers referenced by quotations or purchase orders
        boolean hasQuotations = quotationRepository.existsBySupplier_SupplierId(id);
        boolean hasOrders = purchaseOrderRepository.existsBySupplier_SupplierId(id);

        if (hasQuotations || hasOrders) {
            throw new BusinessRuleException("Cannot delete supplier '" + existing.getCompanyName() +
                    "' (Code: " + existing.getSupplierCode() + ") because it is referenced by existing " +
                    (hasQuotations && hasOrders ? "quotations and purchase orders" :
                     hasQuotations ? "quotations" : "purchase orders") +
                    ". Please deactivate the supplier instead.");
        }

        supplierRepository.delete(existing);
    }
}
