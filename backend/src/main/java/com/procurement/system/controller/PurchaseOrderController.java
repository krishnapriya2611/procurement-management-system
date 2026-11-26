package com.procurement.system.controller;

import com.procurement.system.dto.PurchaseOrderRequestDTO;
import com.procurement.system.dto.StatusUpdateDTO;
import com.procurement.system.entity.PurchaseOrder;
import com.procurement.system.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders(@RequestParam(required = false) String status) {
        List<PurchaseOrder> orders = purchaseOrderService.getAllPurchaseOrders(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable Long id) {
        PurchaseOrder order = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/requisition/{requisitionId}")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrdersByRequisition(@PathVariable Long requisitionId) {
        List<PurchaseOrder> orders = purchaseOrderService.getPurchaseOrdersByRequisition(requisitionId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrdersBySupplier(@PathVariable Long supplierId) {
        List<PurchaseOrder> orders = purchaseOrderService.getPurchaseOrdersBySupplier(supplierId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequestDTO dto) {
        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(dto.getPoNumber());
        po.setOrderDate(dto.getOrderDate());
        po.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        po.setTotalAmount(dto.getTotalAmount());
        po.setStatus(dto.getStatus());

        PurchaseOrder created = purchaseOrderService.createPurchaseOrder(po, dto.getSupplierId(), dto.getRequisitionId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrder(@PathVariable Long id, @Valid @RequestBody PurchaseOrderRequestDTO dto) {
        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(dto.getPoNumber());
        po.setOrderDate(dto.getOrderDate());
        po.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        po.setTotalAmount(dto.getTotalAmount());
        po.setStatus(dto.getStatus());

        PurchaseOrder updated = purchaseOrderService.updatePurchaseOrder(id, po, dto.getSupplierId(), dto.getRequisitionId());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrderStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO statusDTO) {
        PurchaseOrder updated = purchaseOrderService.updatePurchaseOrderStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }
}
