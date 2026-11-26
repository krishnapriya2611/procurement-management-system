package com.procurement.system.controller;

import com.procurement.system.dto.QuotationComparisonDTO;
import com.procurement.system.dto.QuotationRequestDTO;
import com.procurement.system.dto.StatusUpdateDTO;
import com.procurement.system.entity.Quotation;
import com.procurement.system.service.QuotationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotations")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @GetMapping
    public ResponseEntity<List<Quotation>> getAllQuotations(@RequestParam(required = false) String status) {
        List<Quotation> quotations = quotationService.getAllQuotations(status);
        return ResponseEntity.ok(quotations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quotation> getQuotationById(@PathVariable Long id) {
        Quotation quotation = quotationService.getQuotationById(id);
        return ResponseEntity.ok(quotation);
    }

    @GetMapping("/requisition/{requisitionId}")
    public ResponseEntity<List<Quotation>> getQuotationsByRequisition(@PathVariable Long requisitionId) {
        List<Quotation> quotations = quotationService.getQuotationsByRequisition(requisitionId);
        return ResponseEntity.ok(quotations);
    }

    @GetMapping("/compare/{requisitionId}")
    public ResponseEntity<QuotationComparisonDTO> compareQuotations(@PathVariable Long requisitionId) {
        QuotationComparisonDTO comparison = quotationService.compareQuotations(requisitionId);
        return ResponseEntity.ok(comparison);
    }

    @PostMapping
    public ResponseEntity<Quotation> createQuotation(@RequestBody QuotationRequestDTO dto) {
        Quotation quotation = new Quotation();
        quotation.setQuotationNumber(dto.getQuotationNumber());
        quotation.setQuotationDate(dto.getQuotationDate());
        quotation.setValidityDate(dto.getValidityDate());
        quotation.setQuotedAmount(dto.getQuotedAmount());
        quotation.setDeliveryDays(dto.getDeliveryDays());
        quotation.setStatus(dto.getStatus());

        Quotation created = quotationService.createQuotation(quotation, dto.getSupplierId(), dto.getRequisitionId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quotation> updateQuotation(@PathVariable Long id, @RequestBody QuotationRequestDTO dto) {
        Quotation quotation = new Quotation();
        quotation.setQuotationNumber(dto.getQuotationNumber());
        quotation.setQuotationDate(dto.getQuotationDate());
        quotation.setValidityDate(dto.getValidityDate());
        quotation.setQuotedAmount(dto.getQuotedAmount());
        quotation.setDeliveryDays(dto.getDeliveryDays());
        quotation.setStatus(dto.getStatus());

        Quotation updated = quotationService.updateQuotation(id, quotation, dto.getSupplierId(), dto.getRequisitionId());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Quotation> updateQuotationStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO statusDTO) {
        Quotation updated = quotationService.updateQuotationStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable Long id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.noContent().build();
    }
}
