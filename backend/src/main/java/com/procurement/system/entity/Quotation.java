package com.procurement.system.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "quotations")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quotation_id")
    private Long quotationId;

    @Column(name = "quotation_number", nullable = false, unique = true, length = 50)
    private String quotationNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requisition_id", nullable = false)
    private PurchaseRequisition purchaseRequisition;

    @Column(name = "quotation_date", nullable = false)
    private LocalDate quotationDate;

    @Column(name = "validity_date", nullable = false)
    private LocalDate validityDate;

    @Column(name = "quoted_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal quotedAmount = BigDecimal.ZERO;

    @Column(name = "delivery_days", nullable = false)
    private Integer deliveryDays;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "Pending Review";

    public Quotation() {
    }

    public Quotation(String quotationNumber, Supplier supplier, PurchaseRequisition purchaseRequisition,
                     LocalDate quotationDate, LocalDate validityDate, BigDecimal quotedAmount,
                     Integer deliveryDays, String status) {
        this.quotationNumber = quotationNumber;
        this.supplier = supplier;
        this.purchaseRequisition = purchaseRequisition;
        this.quotationDate = quotationDate;
        this.validityDate = validityDate;
        this.quotedAmount = quotedAmount != null ? quotedAmount : BigDecimal.ZERO;
        this.deliveryDays = deliveryDays;
        this.status = status != null ? status : "Pending Review";
    }

    public Long getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(Long quotationId) {
        this.quotationId = quotationId;
    }

    public String getQuotationNumber() {
        return quotationNumber;
    }

    public void setQuotationNumber(String quotationNumber) {
        this.quotationNumber = quotationNumber;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public PurchaseRequisition getPurchaseRequisition() {
        return purchaseRequisition;
    }

    public void setPurchaseRequisition(PurchaseRequisition purchaseRequisition) {
        this.purchaseRequisition = purchaseRequisition;
    }

    public LocalDate getQuotationDate() {
        return quotationDate;
    }

    public void setQuotationDate(LocalDate quotationDate) {
        this.quotationDate = quotationDate;
    }

    public LocalDate getValidityDate() {
        return validityDate;
    }

    public void setValidityDate(LocalDate validityDate) {
        this.validityDate = validityDate;
    }

    public BigDecimal getQuotedAmount() {
        return quotedAmount;
    }

    public void setQuotedAmount(BigDecimal quotedAmount) {
        this.quotedAmount = quotedAmount;
    }

    public Integer getDeliveryDays() {
        return deliveryDays;
    }

    public void setDeliveryDays(Integer deliveryDays) {
        this.deliveryDays = deliveryDays;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Quotation quotation = (Quotation) o;
        return Objects.equals(quotationId, quotation.quotationId) &&
               Objects.equals(quotationNumber, quotation.quotationNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(quotationId, quotationNumber);
    }

    @Override
    public String toString() {
        return "Quotation{" +
                "quotationId=" + quotationId +
                ", quotationNumber='" + quotationNumber + '\'' +
                ", supplier=" + (supplier != null ? supplier.getSupplierCode() : null) +
                ", requisition=" + (purchaseRequisition != null ? purchaseRequisition.getRequestNumber() : null) +
                ", quotationDate=" + quotationDate +
                ", validityDate=" + validityDate +
                ", quotedAmount=" + quotedAmount +
                ", deliveryDays=" + deliveryDays +
                ", status='" + status + '\'' +
                '}';
    }
}
