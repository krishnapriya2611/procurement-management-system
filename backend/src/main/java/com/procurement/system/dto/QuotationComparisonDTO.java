package com.procurement.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class QuotationComparisonDTO {

    private Long requisitionId;
    private String requestNumber;
    private String department;
    private LocalDate requiredDate;
    private List<QuotationItemDTO> quotations = new ArrayList<>();

    public QuotationComparisonDTO() {
    }

    public QuotationComparisonDTO(Long requisitionId, String requestNumber, String department, LocalDate requiredDate) {
        this.requisitionId = requisitionId;
        this.requestNumber = requestNumber;
        this.department = department;
        this.requiredDate = requiredDate;
    }

    public Long getRequisitionId() {
        return requisitionId;
    }

    public void setRequisitionId(Long requisitionId) {
        this.requisitionId = requisitionId;
    }

    public String getRequestNumber() {
        return requestNumber;
    }

    public void setRequestNumber(String requestNumber) {
        this.requestNumber = requestNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public LocalDate getRequiredDate() {
        return requiredDate;
    }

    public void setRequiredDate(LocalDate requiredDate) {
        this.requiredDate = requiredDate;
    }

    public List<QuotationItemDTO> getQuotations() {
        return quotations;
    }

    public void setQuotations(List<QuotationItemDTO> quotations) {
        this.quotations = quotations;
    }

    public void addQuotation(QuotationItemDTO item) {
        this.quotations.add(item);
    }

    public static class QuotationItemDTO {
        private Long quotationId;
        private String quotationNumber;
        private Long supplierId;
        private String supplierCode;
        private String supplierCompanyName;
        private LocalDate quotationDate;
        private LocalDate validityDate;
        private BigDecimal quotedAmount;
        private Integer deliveryDays;
        private String status;

        public QuotationItemDTO() {
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

        public Long getSupplierId() {
            return supplierId;
        }

        public void setSupplierId(Long supplierId) {
            this.supplierId = supplierId;
        }

        public String getSupplierCode() {
            return supplierCode;
        }

        public void setSupplierCode(String supplierCode) {
            this.supplierCode = supplierCode;
        }

        public String getSupplierCompanyName() {
            return supplierCompanyName;
        }

        public void setSupplierCompanyName(String supplierCompanyName) {
            this.supplierCompanyName = supplierCompanyName;
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
    }
}
