package com.procurement.system.repository;

import com.procurement.system.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    boolean existsByPoNumber(String poNumber);

    boolean existsByPoNumberAndPurchaseOrderIdNot(String poNumber, Long purchaseOrderId);

    List<PurchaseOrder> findByPurchaseRequisition_RequisitionId(Long requisitionId);

    List<PurchaseOrder> findBySupplier_SupplierId(Long supplierId);

    boolean existsBySupplier_SupplierId(Long supplierId);

    boolean existsByPurchaseRequisition_RequisitionId(Long requisitionId);

    List<PurchaseOrder> findByStatusIgnoreCase(String status);

    long countByStatusIgnoreCase(String status);

    @Query("SELECT COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po WHERE LOWER(po.status) = LOWER(:status)")
    BigDecimal sumTotalAmountByStatusIgnoreCase(@Param("status") String status);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE LOWER(po.status) = 'open' AND po.expectedDeliveryDate < :currentDate")
    long countDelayedOpenOrders(@Param("currentDate") LocalDate currentDate);

    List<PurchaseOrder> findByStatusIgnoreCaseAndExpectedDeliveryDateBefore(String status, LocalDate date);
}
