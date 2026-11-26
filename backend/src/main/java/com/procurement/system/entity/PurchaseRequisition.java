package com.procurement.system.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "purchase_requisitions")
public class PurchaseRequisition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "requisition_id")
    private Long requisitionId;

    @Column(name = "request_number", nullable = false, unique = true, length = 50)
    private String requestNumber;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "requested_by", nullable = false, length = 100)
    private String requestedBy;

    @Column(name = "required_date", nullable = false)
    private LocalDate requiredDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "Open";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "requisition_items",
            joinColumns = @JoinColumn(name = "requisition_id")
    )
    private List<RequisitionItem> items = new ArrayList<>();

    public PurchaseRequisition() {
    }

    public PurchaseRequisition(String requestNumber, LocalDate requestDate, String department,
                               String requestedBy, LocalDate requiredDate, String status, String remarks) {
        this.requestNumber = requestNumber;
        this.requestDate = requestDate;
        this.department = department;
        this.requestedBy = requestedBy;
        this.requiredDate = requiredDate;
        this.status = status != null ? status : "Open";
        this.remarks = remarks;
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

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }

    public LocalDate getRequiredDate() {
        return requiredDate;
    }

    public void setRequiredDate(LocalDate requiredDate) {
        this.requiredDate = requiredDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public List<RequisitionItem> getItems() {
        return items;
    }

    public void setItems(List<RequisitionItem> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    public void addItem(RequisitionItem item) {
        if (this.items == null) {
            this.items = new ArrayList<>();
        }
        this.items.add(item);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PurchaseRequisition that = (PurchaseRequisition) o;
        return Objects.equals(requisitionId, that.requisitionId) &&
               Objects.equals(requestNumber, that.requestNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(requisitionId, requestNumber);
    }

    @Override
    public String toString() {
        return "PurchaseRequisition{" +
                "requisitionId=" + requisitionId +
                ", requestNumber='" + requestNumber + '\'' +
                ", requestDate=" + requestDate +
                ", department='" + department + '\'' +
                ", requestedBy='" + requestedBy + '\'' +
                ", requiredDate=" + requiredDate +
                ", status='" + status + '\'' +
                ", itemsCount=" + (items != null ? items.size() : 0) +
                '}';
    }
}
