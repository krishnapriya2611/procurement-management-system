# Product Requirements Document (PRD)

## Procurement and Purchase Order Management System

**Domain:** Manufacturing / Procurement\
**Project type:** Academic web application

## 1. Problem statement

Growing organizations often manage purchase requests, supplier details,
quotations and purchase orders through spreadsheets and email. This can
cause duplicate requests, weak traceability, delayed approvals, and
difficulty identifying outstanding orders or supplier performance.
Procurement officers and department requesters need one consistent
application to track the purchasing lifecycle.

## 2. Product objective

Digitise the basic procure-to-order workflow and maintain traceable
master and transaction records through a central application.

## 3. Proposed solution

Build a central procurement application in which business users can: -
Maintain supplier and product master data. - Create, edit, list and
close purchase requisitions. - Record supplier quotations and compare
them. - Generate purchase orders. - Track requisition status, ordered
quantities, expected delivery dates and outstanding order value.

For this academic scope, approval is represented as a business status. A
login/security module is not required.

## 4. Target users

-   **Department requesters:** raise and track purchase requisitions.
-   **Procurement executives:** maintain procurement records, capture
    quotations and create purchase orders.
-   **Procurement managers:** review procurement status and monitor open
    work.
-   **Application administrators:** maintain supplier and product master
    data.

## 5. Scope

### In scope

1.  Supplier master maintenance.
2.  Product master maintenance.
3.  Purchase requisition creation, editing, listing and closure.
4.  Supplier quotation capture and comparison.
5.  Purchase order generation, listing and status tracking.
6.  Dashboard summaries for open requisitions, quotations awaiting
    review and open purchase orders.
7.  Validated forms, searchable lists, detail views and CRUD operations.
8.  Persistence in MySQL through Spring Boot REST APIs.
9.  API testing using Postman and UI testing in the browser.

### Out of scope

-   Payment processing.
-   Inventory accounting.
-   External ERP integration.
-   Authentication and security module.
-   A React UI or JSON Server backend; the frontend must be Angular and
    call the Spring Boot backend.

## 6. Functional requirements

### FR-01: Supplier management

-   Create, view, edit and delete permitted supplier records.
-   Store supplier code, company name, contact person, email, phone,
    address, city and status.
-   Prevent deletion of a supplier referenced by quotations or purchase
    orders.
-   Enforce uniqueness of supplier code.

### FR-02: Product management

-   Create, view, edit and delete permitted product records.
-   Store SKU, product name, description, unit, standard price and
    active status.
-   Enforce uniqueness of SKU.
-   Use the same product reference in requisition lines.

### FR-03: Purchase requisitions

-   Create, view, edit, search and close requisitions.
-   Store request number, request date, department, requested-by,
    required date, status and remarks.
-   A requisition contains requested products, quantities and estimated
    prices.
-   Show requisition status on list and detail pages.

### FR-04: Quotations

-   Record supplier quotations against a supplier and requisition.
-   Store quotation number, quotation date, validity date, quoted
    amount, delivery days and status.
-   Support multiple quotations for one requisition.
-   Provide a comparison view to help procurement users review supplier
    offers.

### FR-05: Purchase orders

-   Generate and view purchase orders referencing a supplier and
    requisition.
-   Store PO number, order date, expected delivery date, total amount
    and status.
-   Track open orders and expected delivery dates.
-   Show outstanding order value on the dashboard.

### FR-06: Dashboard

Display relevant counts and summary values from backend APIs: - Open
requisitions. - Quotations awaiting review. - Open purchase orders. -
Upcoming or delayed work, where supported by stored dates and
statuses. - Outstanding order value.

### FR-07: Validation and feedback

-   Validate required fields, lengths, formats, numeric ranges and
    dates.
-   Reject negative quantities or monetary amounts.
-   Display field-level validation messages.
-   Return meaningful HTTP status codes and JSON error responses.
-   Confirm permitted deletions and status-based cancellation/closure
    actions.

## 7. Data model

The application is limited to five main persistent entities:

  -----------------------------------------------------------------------
  Entity                              Main fields
  ----------------------------------- -----------------------------------
  Supplier                            supplierId (PK), supplierCode,
                                      companyName, contactPerson, email,
                                      phone, address, city, status

  Product                             productId (PK), SKU, productName,
                                      description, unit, standardPrice,
                                      active

  PurchaseRequisition                 requisitionId (PK), requestNumber,
                                      requestDate, department,
                                      requestedBy, requiredDate, status,
                                      remarks

  Quotation                           quotationId (PK), quotationNumber,
                                      supplierId (FK), requisitionId
                                      (FK), quotationDate, validityDate,
                                      quotedAmount, deliveryDays, status

  PurchaseOrder                       purchaseOrderId (PK), poNumber,
                                      supplierId (FK), requisitionId
                                      (FK), orderDate,
                                      expectedDeliveryDate, totalAmount,
                                      status
  -----------------------------------------------------------------------

To stay within five entities, requested product, quantity and estimated
price can be represented as line-item/structured fields associated with
the requisition in this academic implementation. If a separate
requisition-line table is introduced, it must be approved and the
five-entity limit revisited.

## 8. Business rules

-   Supplier code, SKU, request number, quotation number and PO number
    must be unique where applicable.
-   Mandatory fields cannot be null.
-   Monetary values and quantities must be non-negative; quantities
    should be positive for requested items.
-   A supplier referenced by an order or quotation cannot be deleted.
-   Only draft/test records may be hard-deleted after confirmation;
    otherwise use status-based cancellation/deactivation.
-   A quotation belongs to one supplier and one requisition.
-   A purchase order references one supplier and one requisition.
-   One supplier may have many quotations and purchase orders; one
    requisition may have many quotations and purchase orders.

## 9. User interface requirements

-   Angular single-page application with Angular Router.
-   Responsive layout using CSS plus Bootstrap or Angular Material.
-   Reusable navigation, form, table, status-indicator and
    confirmation-dialog components.
-   Searchable/sortable master and transaction lists.
-   Detail pages and validated create/edit forms.
-   Pages: Dashboard; Supplier list/detail/add/edit; Product
    list/detail/add/edit; Requisition form/list/detail/status; Quotation
    capture/comparison; Purchase order list/detail/status update.

## 10. Non-functional requirements

-   Persist valid data in MySQL across application restarts.
-   Keep frontend, REST API, business logic and persistence
    responsibilities separated.
-   Provide clear validation and error feedback.
-   Use consistent REST conventions and meaningful HTTP status codes.
-   Maintain readable, documented source code and setup instructions.

## 11. Acceptance criteria

-   A supplier and product can be created and appear in their respective
    lists.
-   A requisition can be created and viewed after refresh.
-   Quotations can be recorded and compared for a requisition.
-   A purchase order can be created and tracked.
-   Updates persist after refresh.
-   Duplicate supplier code and invalid negative amounts are rejected.
-   Deletion of a supplier referenced by an order is prevented with a
    meaningful message.
-   Dashboard counts reflect backend records.
-   Angular calls the actual Spring Boot API and data persists in MySQL.

## 12. Testing scenarios

  -----------------------------------------------------------------------
  Test                    Steps                   Expected result
  ----------------------- ----------------------- -----------------------
  Create/read             Create a valid record;  Record persists and is
                          open list/detail        displayed

  Update                  Edit an existing record Updated value persists
                                                  after refresh

  Delete/status           Delete a permitted      Record is removed or
                          record or               status changes as
                          cancel/deactivate       designed

  Invalid input           Submit missing,         Validation error; no
                          malformed or            invalid row saved
                          out-of-range data       

  Business rule           Try duplicate supplier  Operation is rejected
                          code or delete a        correctly
                          referenced supplier     

  Workflow                Create                  Related records can be
                          supplier/product,       traced through the
                          requisition, quotation  workflow
                          and PO                  
  -----------------------------------------------------------------------

## 13. Deliverables

-   Angular frontend source.
-   Spring Boot REST API source.
-   MySQL schema and sample-data script.
-   README with setup/run instructions.
-   API endpoint summary and Postman collection, if available.
-   Evidence screenshots: project setup, dashboard, create, read/list,
    update, delete/status, API requests/responses and database
    tables/relationships.
