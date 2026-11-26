package com.procurement.system.repository;

import com.procurement.system.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findBySupplierCode(String supplierCode);

    boolean existsBySupplierCode(String supplierCode);

    boolean existsBySupplierCodeAndSupplierIdNot(String supplierCode, Long supplierId);

    List<Supplier> findByCompanyNameContainingIgnoreCaseOrSupplierCodeContainingIgnoreCase(String companyName, String supplierCode);

    List<Supplier> findByStatusIgnoreCase(String status);
}
