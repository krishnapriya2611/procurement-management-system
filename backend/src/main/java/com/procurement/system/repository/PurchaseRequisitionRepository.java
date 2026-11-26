package com.procurement.system.repository;

import com.procurement.system.entity.PurchaseRequisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRequisitionRepository extends JpaRepository<PurchaseRequisition, Long> {

    Optional<PurchaseRequisition> findByRequestNumber(String requestNumber);

    boolean existsByRequestNumber(String requestNumber);

    boolean existsByRequestNumberAndRequisitionIdNot(String requestNumber, Long requisitionId);

    List<PurchaseRequisition> findByStatusIgnoreCase(String status);

    List<PurchaseRequisition> findByDepartmentContainingIgnoreCaseOrRequestNumberContainingIgnoreCase(String department, String requestNumber);

    long countByStatusIgnoreCase(String status);
}
