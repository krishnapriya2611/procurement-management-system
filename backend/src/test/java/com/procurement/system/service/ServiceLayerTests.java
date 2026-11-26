package com.procurement.system.service;

import com.procurement.system.dto.DashboardSummaryDTO;
import com.procurement.system.dto.QuotationComparisonDTO;
import com.procurement.system.entity.*;
import com.procurement.system.exception.BusinessRuleException;
import com.procurement.system.exception.DuplicateResourceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ServiceLayerTests {

    @Autowired
    private SupplierService supplierService;

    @Autowired
    private ProductService productService;

    @Autowired
    private RequisitionService requisitionService;

    @Autowired
    private QuotationService quotationService;

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @Autowired
    private DashboardService dashboardService;

    private Supplier testSupplier;
    private Product testProduct;
    private PurchaseRequisition testRequisition;

    @BeforeEach
    void setUp() {
        // Create base master data with unique codes
        String uniqueSuffix = String.valueOf(System.nanoTime());
        testSupplier = supplierService.createSupplier(new Supplier(
                "SUP-" + uniqueSuffix,
                "Acme Supplies Ltd",
                "John Doe",
                "john@acme.com",
                "9876543210",
                "123 Industrial Park",
                "Mumbai",
                "Active"
        ));

        testProduct = productService.createProduct(new Product(
                "SKU-" + uniqueSuffix,
                "Steel Screws M6",
                "High quality steel screws",
                "BOX",
                new BigDecimal("150.00"),
                true
        ));

        PurchaseRequisition req = new PurchaseRequisition(
                "REQ-" + uniqueSuffix,
                LocalDate.now(),
                "Maintenance",
                "Robert Smith",
                LocalDate.now().plusDays(10),
                "Open",
                "Urgent requirement"
        );
        req.addItem(new RequisitionItem(testProduct.getProductId(), testProduct.getSku(), testProduct.getProductName(), 5, new BigDecimal("150.00")));
        testRequisition = requisitionService.createRequisition(req);
    }

    @Test
    @DisplayName("Reject duplicate supplier code")
    void testRejectDuplicateSupplierCode() {
        Supplier duplicate = new Supplier(
                testSupplier.getSupplierCode(),
                "Another Corp",
                "Jane",
                "jane@another.com",
                "1234567890",
                "Delhi",
                "Delhi",
                "Active"
        );

        assertThrows(DuplicateResourceException.class, () -> supplierService.createSupplier(duplicate));
    }

    @Test
    @DisplayName("Reject duplicate product SKU")
    void testRejectDuplicateProductSku() {
        Product duplicate = new Product(
                testProduct.getSku(),
                "Steel Screws M8",
                "Different size",
                "BOX",
                new BigDecimal("180.00"),
                true
        );

        assertThrows(DuplicateResourceException.class, () -> productService.createProduct(duplicate));
    }

    @Test
    @DisplayName("Reject negative price on product")
    void testRejectNegativeProductPrice() {
        Product invalid = new Product(
                "SKU-NEG-" + System.nanoTime(),
                "Negative Price Item",
                "Invalid price",
                "PCS",
                new BigDecimal("-50.00"),
                true
        );

        assertThrows(BusinessRuleException.class, () -> productService.createProduct(invalid));
    }

    @Test
    @DisplayName("Reject negative quoted amount on quotation")
    void testRejectNegativeQuotationAmount() {
        Quotation quotation = new Quotation(
                "QUOT-NEG-" + System.nanoTime(),
                null,
                null,
                LocalDate.now(),
                LocalDate.now().plusDays(15),
                new BigDecimal("-100.00"),
                5,
                "Pending Review"
        );

        assertThrows(BusinessRuleException.class, () ->
                quotationService.createQuotation(quotation, testSupplier.getSupplierId(), testRequisition.getRequisitionId()));
    }

    @Test
    @DisplayName("Prevent deletion of supplier referenced by quotations")
    void testPreventDeletionOfReferencedSupplier() {
        Quotation quotation = new Quotation(
                "QUOT-REF-" + System.nanoTime(),
                null,
                null,
                LocalDate.now(),
                LocalDate.now().plusDays(15),
                new BigDecimal("700.00"),
                3,
                "Pending Review"
        );
        quotationService.createQuotation(quotation, testSupplier.getSupplierId(), testRequisition.getRequisitionId());

        // Attempt to delete referenced supplier should throw BusinessRuleException
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                supplierService.deleteSupplier(testSupplier.getSupplierId()));

        assertTrue(ex.getMessage().contains("Cannot delete supplier"));
        assertTrue(ex.getMessage().contains("referenced by existing"));
    }

    @Test
    @DisplayName("Quotation comparison logic returns grouped supplier quotes")
    void testQuotationComparisonLogic() {
        // Create second supplier
        Supplier supplier2 = supplierService.createSupplier(new Supplier(
                "SUP-COMP-" + System.nanoTime(),
                "FastTrack Logistics",
                "Alice",
                "alice@fasttrack.com",
                "9998887776",
                "Chennai",
                "Chennai",
                "Active"
        ));

        // Create two quotations for testRequisition
        Quotation q1 = quotationService.createQuotation(
                new Quotation("Q1-" + System.nanoTime(), null, null, LocalDate.now(), LocalDate.now().plusDays(30), new BigDecimal("750.00"), 5, "Pending Review"),
                testSupplier.getSupplierId(),
                testRequisition.getRequisitionId()
        );

        Quotation q2 = quotationService.createQuotation(
                new Quotation("Q2-" + System.nanoTime(), null, null, LocalDate.now(), LocalDate.now().plusDays(20), new BigDecimal("720.00"), 3, "Pending Review"),
                supplier2.getSupplierId(),
                testRequisition.getRequisitionId()
        );

        QuotationComparisonDTO comparison = quotationService.compareQuotations(testRequisition.getRequisitionId());

        assertNotNull(comparison);
        assertEquals(testRequisition.getRequisitionId(), comparison.getRequisitionId());
        assertEquals(2, comparison.getQuotations().size());
    }

    @Test
    @DisplayName("Dashboard summary calculations aggregate open requisitions, quotes, POs, and values")
    void testDashboardSummaryCalculations() {
        // Create a Purchase Order
        PurchaseOrder po = new PurchaseOrder(
                "PO-TEST-" + System.nanoTime(),
                null,
                null,
                LocalDate.now(),
                LocalDate.now().plusDays(7),
                new BigDecimal("12500.00"),
                "Open"
        );
        purchaseOrderService.createPurchaseOrder(po, testSupplier.getSupplierId(), testRequisition.getRequisitionId());

        DashboardSummaryDTO summary = dashboardService.getDashboardSummary();

        assertNotNull(summary);
        assertTrue(summary.getOpenRequisitionsCount() >= 1);
        assertTrue(summary.getOpenPurchaseOrdersCount() >= 1);
        assertTrue(summary.getOutstandingOrderValue().compareTo(BigDecimal.ZERO) > 0);
    }
}
