package com.procurement.system.repository;

import com.procurement.system.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    Optional<Quotation> findByQuotationNumber(String quotationNumber);

    boolean existsByQuotationNumber(String quotationNumber);

    boolean existsByQuotationNumberAndQuotationIdNot(String quotationNumber, Long quotationId);

    List<Quotation> findByPurchaseRequisition_RequisitionId(Long requisitionId);

    List<Quotation> findBySupplier_SupplierId(Long supplierId);

    boolean existsBySupplier_SupplierId(Long supplierId);

    boolean existsByPurchaseRequisition_RequisitionId(Long requisitionId);

    List<Quotation> findByStatusIgnoreCase(String status);

    long countByStatusIgnoreCase(String status);
}
