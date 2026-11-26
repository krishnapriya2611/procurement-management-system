package com.procurement.system.service;

import com.procurement.system.entity.PurchaseOrder;
import com.procurement.system.entity.PurchaseRequisition;
import com.procurement.system.entity.Supplier;
import com.procurement.system.exception.BusinessRuleException;
import com.procurement.system.exception.DuplicateResourceException;
import com.procurement.system.exception.ResourceNotFoundException;
import com.procurement.system.repository.PurchaseOrderRepository;
import com.procurement.system.repository.PurchaseRequisitionRepository;
import com.procurement.system.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseRequisitionRepository requisitionRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                SupplierRepository supplierRepository,
                                PurchaseRequisitionRepository requisitionRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.requisitionRepository = requisitionRepository;
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> getAllPurchaseOrders(String status) {
        if (status != null && !status.trim().isEmpty()) {
            return purchaseOrderRepository.findByStatusIgnoreCase(status.trim());
        }
        return purchaseOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public PurchaseOrder getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> getPurchaseOrdersByRequisition(Long requisitionId) {
        return purchaseOrderRepository.findByPurchaseRequisition_RequisitionId(requisitionId);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> getPurchaseOrdersBySupplier(Long supplierId) {
        return purchaseOrderRepository.findBySupplier_SupplierId(supplierId);
    }

    public PurchaseOrder createPurchaseOrder(PurchaseOrder purchaseOrder, Long supplierId, Long requisitionId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        PurchaseRequisition requisition = requisitionRepository.findById(requisitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase requisition not found with id: " + requisitionId));

        validatePurchaseOrderData(purchaseOrder);

        if (purchaseOrder.getPoNumber() == null || purchaseOrder.getPoNumber().trim().isEmpty()) {
            purchaseOrder.setPoNumber(generatePoNumber());
        } else {
            String normalizedNumber = purchaseOrder.getPoNumber().trim();
            if (purchaseOrderRepository.existsByPoNumber(normalizedNumber)) {
                throw new DuplicateResourceException("PO number '" + normalizedNumber + "' already exists");
            }
            purchaseOrder.setPoNumber(normalizedNumber);
        }

        purchaseOrder.setSupplier(supplier);
        purchaseOrder.setPurchaseRequisition(requisition);

        if (purchaseOrder.getOrderDate() == null) {
            purchaseOrder.setOrderDate(LocalDate.now());
        }

        if (purchaseOrder.getExpectedDeliveryDate().isBefore(purchaseOrder.getOrderDate())) {
            throw new BusinessRuleException("Expected delivery date cannot be before order date");
        }

        if (purchaseOrder.getStatus() == null || purchaseOrder.getStatus().trim().isEmpty()) {
            purchaseOrder.setStatus("Open");
        }

        return purchaseOrderRepository.save(purchaseOrder);
    }

    public PurchaseOrder updatePurchaseOrder(Long id, PurchaseOrder updatedPo, Long supplierId, Long requisitionId) {
        PurchaseOrder existing = getPurchaseOrderById(id);

        validatePurchaseOrderData(updatedPo);

        String normalizedNumber = updatedPo.getPoNumber().trim();
        if (purchaseOrderRepository.existsByPoNumberAndPurchaseOrderIdNot(normalizedNumber, id)) {
            throw new DuplicateResourceException("PO number '" + normalizedNumber + "' is already in use");
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

        existing.setPoNumber(normalizedNumber);
        existing.setOrderDate(updatedPo.getOrderDate());
        existing.setExpectedDeliveryDate(updatedPo.getExpectedDeliveryDate());
        existing.setTotalAmount(updatedPo.getTotalAmount());

        if (updatedPo.getStatus() != null && !updatedPo.getStatus().trim().isEmpty()) {
            existing.setStatus(updatedPo.getStatus().trim());
        }

        return purchaseOrderRepository.save(existing);
    }

    public PurchaseOrder updatePurchaseOrderStatus(Long id, String status) {
        PurchaseOrder existing = getPurchaseOrderById(id);
        if (status == null || status.trim().isEmpty()) {
            throw new BusinessRuleException("Status cannot be empty");
        }
        existing.setStatus(status.trim());
        return purchaseOrderRepository.save(existing);
    }

    public void deletePurchaseOrder(Long id) {
        PurchaseOrder existing = getPurchaseOrderById(id);
        if ("Delivered".equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessRuleException("Cannot delete a delivered purchase order. Please cancel it instead.");
        }
        purchaseOrderRepository.delete(existing);
    }

    private void validatePurchaseOrderData(PurchaseOrder purchaseOrder) {
        if (purchaseOrder.getTotalAmount() == null) {
            throw new BusinessRuleException("Total amount is required");
        }
        if (purchaseOrder.getTotalAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Total amount cannot be negative");
        }
        if (purchaseOrder.getExpectedDeliveryDate() == null) {
            throw new BusinessRuleException("Expected delivery date is required");
        }
    }

    private String generatePoNumber() {
        return "PO-" + System.currentTimeMillis();
    }
}
