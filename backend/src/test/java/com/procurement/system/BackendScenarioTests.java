package com.procurement.system;

import com.procurement.system.dto.DashboardSummaryDTO;
import com.procurement.system.dto.QuotationComparisonDTO;
import com.procurement.system.entity.*;
import com.procurement.system.exception.BusinessRuleException;
import com.procurement.system.exception.DuplicateResourceException;
import com.procurement.system.repository.SupplierRepository;
import com.procurement.system.service.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class BackendScenarioTests {

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

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private EntityManager entityManager;

    private static Long createdSupplierId;
    private static Long createdProductId;
    private static Long createdRequisitionId;
    private static Long createdQuotationId;
    private static Long createdPoId;

    private static String uniqueId;

    @BeforeAll
    static void init() {
        uniqueId = String.valueOf(System.currentTimeMillis());
    }

    @Test
    @Order(1)
    @DisplayName("Scenario 1: Create supplier")
    void test01_createSupplier() {
        Supplier supplier = new Supplier(
                "SUP-" + uniqueId,
                "Apex Industrial Supplies",
                "Anita Rao",
                "anita@apex.com",
                "9876543210",
                "Plot 42, Electronic City",
                "Bengaluru",
                "Active"
        );
        Supplier saved = supplierService.createSupplier(supplier);
        assertNotNull(saved.getSupplierId());
        assertEquals("SUP-" + uniqueId, saved.getSupplierCode());
        createdSupplierId = saved.getSupplierId();
    }

    @Test
    @Order(2)
    @DisplayName("Scenario 2: Retrieve supplier")
    void test02_retrieveSupplier() {
        assertNotNull(createdSupplierId);
        Supplier retrieved = supplierService.getSupplierById(createdSupplierId);
        assertNotNull(retrieved);
        assertEquals("Apex Industrial Supplies", retrieved.getCompanyName());
    }

    @Test
    @Order(3)
    @DisplayName("Scenario 3: Update supplier")
    void test03_updateSupplier() {
        assertNotNull(createdSupplierId);
        Supplier supplier = supplierService.getSupplierById(createdSupplierId);
        supplier.setContactPerson("Anita Sharma");
        supplier.setCity("Mysuru");
        Supplier updated = supplierService.updateSupplier(createdSupplierId, supplier);
        assertEquals("Anita Sharma", updated.getContactPerson());
        assertEquals("Mysuru", updated.getCity());
    }

    @Test
    @Order(4)
    @DisplayName("Scenario 4: Delete permitted supplier")
    void test04_deletePermittedSupplier() {
        Supplier temp = supplierService.createSupplier(new Supplier(
                "SUP-TEMP-" + uniqueId,
                "Temporary Supplier",
                "Temp Person",
                "temp@temp.com",
                "0000000000",
                "Temp Address",
                "Pune",
                "Active"
        ));
        Long tempId = temp.getSupplierId();
        supplierService.deleteSupplier(tempId);
        assertFalse(supplierRepository.findById(tempId).isPresent());
    }

    @Test
    @Order(5)
    @DisplayName("Scenario 5: Create product")
    void test05_createProduct() {
        Product product = new Product(
                "SKU-" + uniqueId,
                "Hydraulic Valve 20mm",
                "Precision hydraulic valve for industrial presses",
                "PCS",
                new BigDecimal("4500.00"),
                true
        );
        Product saved = productService.createProduct(product);
        assertNotNull(saved.getProductId());
        assertEquals("SKU-" + uniqueId, saved.getSku());
        createdProductId = saved.getProductId();
    }

    @Test
    @Order(6)
    @DisplayName("Scenario 6: Create purchase requisition")
    void test06_createPurchaseRequisition() {
        assertNotNull(createdProductId);
        Product product = productService.getProductById(createdProductId);

        PurchaseRequisition req = new PurchaseRequisition(
                "REQ-" + uniqueId,
                LocalDate.now(),
                "Operations",
                "Vikram Patel",
                LocalDate.now().plusDays(14),
                "Open",
                "Quarterly maintenance stock"
        );
        req.addItem(new RequisitionItem(
                product.getProductId(),
                product.getSku(),
                product.getProductName(),
                10,
                product.getStandardPrice()
        ));
        PurchaseRequisition saved = requisitionService.createRequisition(req);
        assertNotNull(saved.getRequisitionId());
        assertEquals(1, saved.getItems().size());
        createdRequisitionId = saved.getRequisitionId();
    }

    @Test
    @Order(7)
    @DisplayName("Scenario 7: Create quotation")
    void test07_createQuotation() {
        assertNotNull(createdSupplierId);
        assertNotNull(createdRequisitionId);

        Quotation quotation = new Quotation(
                "QUOT-" + uniqueId,
                null,
                null,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                new BigDecimal("42000.00"),
                7,
                "Pending Review"
        );
        Quotation saved = quotationService.createQuotation(quotation, createdSupplierId, createdRequisitionId);
        assertNotNull(saved.getQuotationId());
        assertEquals("QUOT-" + uniqueId, saved.getQuotationNumber());
        assertEquals(new BigDecimal("42000.00"), saved.getQuotedAmount());
        createdQuotationId = saved.getQuotationId();
    }

    @Test
    @Order(8)
    @DisplayName("Scenario 8: Compare quotations")
    void test08_compareQuotations() {
        assertNotNull(createdRequisitionId);

        // Add a second quote from another supplier
        Supplier supplier2 = supplierService.createSupplier(new Supplier(
                "SUP2-" + uniqueId,
                "Beta Engineering Works",
                "Karan Gupta",
                "karan@beta.com",
                "9876543211",
                "Industrial Area",
                "Bengaluru",
                "Active"
        ));

        Quotation quote2 = new Quotation(
                "QUOT2-" + uniqueId,
                null,
                null,
                LocalDate.now(),
                LocalDate.now().plusDays(25),
                new BigDecimal("41500.00"),
                5,
                "Pending Review"
        );
        quotationService.createQuotation(quote2, supplier2.getSupplierId(), createdRequisitionId);

        QuotationComparisonDTO comparison = quotationService.compareQuotations(createdRequisitionId);
        assertNotNull(comparison);
        assertEquals(createdRequisitionId, comparison.getRequisitionId());
        assertTrue(comparison.getQuotations().size() >= 2);
    }

    @Test
    @Order(9)
    @DisplayName("Scenario 9: Create purchase order")
    void test09_createPurchaseOrder() {
        assertNotNull(createdSupplierId);
        assertNotNull(createdRequisitionId);

        PurchaseOrder po = new PurchaseOrder(
                "PO-" + uniqueId,
                null,
                null,
                LocalDate.now(),
                LocalDate.now().plusDays(10),
                new BigDecimal("42000.00"),
                "Open"
        );
        PurchaseOrder saved = purchaseOrderService.createPurchaseOrder(po, createdSupplierId, createdRequisitionId);
        assertNotNull(saved.getPurchaseOrderId());
        assertEquals("PO-" + uniqueId, saved.getPoNumber());
        createdPoId = saved.getPurchaseOrderId();
    }

    @Test
    @Order(10)
    @DisplayName("Scenario 10: Update purchase order status")
    void test10_updatePurchaseOrderStatus() {
        assertNotNull(createdPoId);
        PurchaseOrder updated = purchaseOrderService.updatePurchaseOrderStatus(createdPoId, "Delivered");
        assertEquals("Delivered", updated.getStatus());
    }

    @Test
    @Order(11)
    @DisplayName("Scenario 11: Reject duplicate supplier code")
    void test11_rejectDuplicateSupplierCode() {
        Supplier duplicate = new Supplier(
                "SUP-" + uniqueId,
                "Duplicate Supplier Attempt",
                "Person",
                "dup@test.com",
                "1234567890",
                "Address",
                "City",
                "Active"
        );
        assertThrows(DuplicateResourceException.class, () -> supplierService.createSupplier(duplicate));
    }

    @Test
    @Order(12)
    @DisplayName("Scenario 12: Reject negative amounts")
    void test12_rejectNegativeAmounts() {
        // Negative product price
        Product negativeProduct = new Product(
                "SKU-NEG-" + uniqueId,
                "Invalid Price Item",
                "Desc",
                "PCS",
                new BigDecimal("-100.00"),
                true
        );
        assertThrows(BusinessRuleException.class, () -> productService.createProduct(negativeProduct));

        // Negative quotation amount
        Quotation negativeQuote = new Quotation(
                "QUOT-NEG-" + uniqueId,
                null,
                null,
                LocalDate.now(),
                LocalDate.now().plusDays(10),
                new BigDecimal("-50.00"),
                5,
                "Pending Review"
        );
        assertThrows(BusinessRuleException.class, () ->
                quotationService.createQuotation(negativeQuote, createdSupplierId, createdRequisitionId));

        // Negative purchase order amount
        PurchaseOrder negativePo = new PurchaseOrder(
                "PO-NEG-" + uniqueId,
                null,
                null,
                LocalDate.now(),
                LocalDate.now().plusDays(10),
                new BigDecimal("-500.00"),
                "Open"
        );
        assertThrows(BusinessRuleException.class, () ->
                purchaseOrderService.createPurchaseOrder(negativePo, createdSupplierId, createdRequisitionId));
    }

    @Test
    @Order(13)
    @DisplayName("Scenario 13: Prevent deletion of referenced supplier")
    void test13_preventDeletionOfReferencedSupplier() {
        assertNotNull(createdSupplierId);
        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                supplierService.deleteSupplier(createdSupplierId));
        assertTrue(ex.getMessage().contains("Cannot delete supplier"));
    }

    @Test
    @Order(14)
    @Transactional
    @DisplayName("Scenario 14: Verify database persistence after application session clear")
    void test14_verifyDatabasePersistence() {
        assertNotNull(createdSupplierId);
        assertNotNull(createdProductId);
        assertNotNull(createdRequisitionId);
        assertNotNull(createdQuotationId);
        assertNotNull(createdPoId);

        // Flush and clear EntityManager to wipe in-memory cache and force live SQL SELECT
        entityManager.flush();
        entityManager.clear();

        Supplier supplier = supplierService.getSupplierById(createdSupplierId);
        Product product = productService.getProductById(createdProductId);
        PurchaseRequisition req = requisitionService.getRequisitionById(createdRequisitionId);
        Quotation quotation = quotationService.getQuotationById(createdQuotationId);
        PurchaseOrder po = purchaseOrderService.getPurchaseOrderById(createdPoId);

        assertNotNull(supplier, "Supplier must persist in MySQL database");
        assertNotNull(product, "Product must persist in MySQL database");
        assertNotNull(req, "PurchaseRequisition must persist in MySQL database");
        assertNotNull(quotation, "Quotation must persist in MySQL database");
        assertNotNull(po, "PurchaseOrder must persist in MySQL database");

        assertEquals("SUP-" + uniqueId, supplier.getSupplierCode());
        assertEquals("SKU-" + uniqueId, product.getSku());
        assertEquals("REQ-" + uniqueId, req.getRequestNumber());
        assertEquals("QUOT-" + uniqueId, quotation.getQuotationNumber());
        assertEquals("PO-" + uniqueId, po.getPoNumber());
    }
}
