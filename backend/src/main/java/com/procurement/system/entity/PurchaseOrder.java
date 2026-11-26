package com.procurement.system.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchase_order_id")
    private Long purchaseOrderId;

    @Column(name = "po_number", nullable = false, unique = true, length = 50)
    private String poNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requisition_id", nullable = false)
    private PurchaseRequisition purchaseRequisition;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "expected_delivery_date", nullable = false)
    private LocalDate expectedDeliveryDate;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "Open";

    public PurchaseOrder() {
    }

    public PurchaseOrder(String poNumber, Supplier supplier, PurchaseRequisition purchaseRequisition,
                         LocalDate orderDate, LocalDate expectedDeliveryDate, BigDecimal totalAmount, String status) {
        this.poNumber = poNumber;
        this.supplier = supplier;
        this.purchaseRequisition = purchaseRequisition;
        this.orderDate = orderDate;
        this.expectedDeliveryDate = expectedDeliveryDate;
        this.totalAmount = totalAmount != null ? totalAmount : BigDecimal.ZERO;
        this.status = status != null ? status : "Open";
    }

    public Long getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public void setPurchaseOrderId(Long purchaseOrderId) {
        this.purchaseOrderId = purchaseOrderId;
    }

    public String getPoNumber() {
        return poNumber;
    }

    public void setPoNumber(String poNumber) {
        this.poNumber = poNumber;
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

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDate orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
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
        PurchaseOrder that = (PurchaseOrder) o;
        return Objects.equals(purchaseOrderId, that.purchaseOrderId) &&
               Objects.equals(poNumber, that.poNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(purchaseOrderId, poNumber);
    }

    @Override
    public String toString() {
        return "PurchaseOrder{" +
                "purchaseOrderId=" + purchaseOrderId +
                ", poNumber='" + poNumber + '\'' +
                ", supplier=" + (supplier != null ? supplier.getSupplierCode() : null) +
                ", requisition=" + (purchaseRequisition != null ? purchaseRequisition.getRequestNumber() : null) +
                ", orderDate=" + orderDate +
                ", expectedDeliveryDate=" + expectedDeliveryDate +
                ", totalAmount=" + totalAmount +
                ", status='" + status + '\'' +
                '}';
    }
}
