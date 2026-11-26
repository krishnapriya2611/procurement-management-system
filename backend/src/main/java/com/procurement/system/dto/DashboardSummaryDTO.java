package com.procurement.system.dto;

import java.math.BigDecimal;

public class DashboardSummaryDTO {

    private long openRequisitionsCount;
    private long quotationsAwaitingReviewCount;
    private long openPurchaseOrdersCount;
    private BigDecimal outstandingOrderValue;
    private long delayedOrdersCount;

    public DashboardSummaryDTO() {
    }

    public DashboardSummaryDTO(long openRequisitionsCount, long quotationsAwaitingReviewCount,
                               long openPurchaseOrdersCount, BigDecimal outstandingOrderValue,
                               long delayedOrdersCount) {
        this.openRequisitionsCount = openRequisitionsCount;
        this.quotationsAwaitingReviewCount = quotationsAwaitingReviewCount;
        this.openPurchaseOrdersCount = openPurchaseOrdersCount;
        this.outstandingOrderValue = outstandingOrderValue != null ? outstandingOrderValue : BigDecimal.ZERO;
        this.delayedOrdersCount = delayedOrdersCount;
    }

    public long getOpenRequisitionsCount() {
        return openRequisitionsCount;
    }

    public void setOpenRequisitionsCount(long openRequisitionsCount) {
        this.openRequisitionsCount = openRequisitionsCount;
    }

    public long getQuotationsAwaitingReviewCount() {
        return quotationsAwaitingReviewCount;
    }

    public void setQuotationsAwaitingReviewCount(long quotationsAwaitingReviewCount) {
        this.quotationsAwaitingReviewCount = quotationsAwaitingReviewCount;
    }

    public long getOpenPurchaseOrdersCount() {
        return openPurchaseOrdersCount;
    }

    public void setOpenPurchaseOrdersCount(long openPurchaseOrdersCount) {
        this.openPurchaseOrdersCount = openPurchaseOrdersCount;
    }

    public BigDecimal getOutstandingOrderValue() {
        return outstandingOrderValue;
    }

    public void setOutstandingOrderValue(BigDecimal outstandingOrderValue) {
        this.outstandingOrderValue = outstandingOrderValue;
    }

    public long getDelayedOrdersCount() {
        return delayedOrdersCount;
    }

    public void setDelayedOrdersCount(long delayedOrdersCount) {
        this.delayedOrdersCount = delayedOrdersCount;
    }
}
