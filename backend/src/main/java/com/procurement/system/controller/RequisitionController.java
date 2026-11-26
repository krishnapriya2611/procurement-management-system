package com.procurement.system.controller;

import com.procurement.system.dto.StatusUpdateDTO;
import com.procurement.system.entity.PurchaseRequisition;
import com.procurement.system.service.RequisitionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisitions")
public class RequisitionController {

    private final RequisitionService requisitionService;

    public RequisitionController(RequisitionService requisitionService) {
        this.requisitionService = requisitionService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseRequisition>> getAllRequisitions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        List<PurchaseRequisition> requisitions = requisitionService.getAllRequisitions(search, status);
        return ResponseEntity.ok(requisitions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseRequisition> getRequisitionById(@PathVariable Long id) {
        PurchaseRequisition requisition = requisitionService.getRequisitionById(id);
        return ResponseEntity.ok(requisition);
    }

    @PostMapping
    public ResponseEntity<PurchaseRequisition> createRequisition(@RequestBody PurchaseRequisition requisition) {
        PurchaseRequisition created = requisitionService.createRequisition(requisition);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseRequisition> updateRequisition(@PathVariable Long id, @RequestBody PurchaseRequisition requisition) {
        PurchaseRequisition updated = requisitionService.updateRequisition(id, requisition);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseRequisition> updateRequisitionStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO statusDTO) {
        PurchaseRequisition updated = requisitionService.updateRequisitionStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequisition(@PathVariable Long id) {
        requisitionService.deleteRequisition(id);
        return ResponseEntity.noContent().build();
    }
}
