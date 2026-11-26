package com.procurement.system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * Embeddable line-item for PurchaseRequisition.
 * Not an independent Entity, preserving the strict 5 main persistent entities rule.
 */
@Embeddable
public class RequisitionItem {

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_sku", length = 50)
    private String productSku;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "estimated_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedPrice = BigDecimal.ZERO;

    public RequisitionItem() {
    }

    public RequisitionItem(Long productId, String productSku, String productName,
                           Integer quantity, BigDecimal estimatedPrice) {
        this.productId = productId;
        this.productSku = productSku;
        this.productName = productName;
        this.quantity = quantity;
        this.estimatedPrice = estimatedPrice != null ? estimatedPrice : BigDecimal.ZERO;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductSku() {
        return productSku;
    }

    public void setProductSku(String productSku) {
        this.productSku = productSku;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getEstimatedPrice() {
        return estimatedPrice;
    }

    public void setEstimatedPrice(BigDecimal estimatedPrice) {
        this.estimatedPrice = estimatedPrice;
    }

    public BigDecimal getSubtotal() {
        if (estimatedPrice != null && quantity != null) {
            return estimatedPrice.multiply(BigDecimal.valueOf(quantity));
        }
        return BigDecimal.ZERO;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RequisitionItem that = (RequisitionItem) o;
        return Objects.equals(productId, that.productId) &&
               Objects.equals(productName, that.productName) &&
               Objects.equals(quantity, that.quantity);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, productName, quantity);
    }

    @Override
    public String toString() {
        return "RequisitionItem{" +
                "productId=" + productId +
                ", productSku='" + productSku + '\'' +
                ", productName='" + productName + '\'' +
                ", quantity=" + quantity +
                ", estimatedPrice=" + estimatedPrice +
                '}';
    }
}
