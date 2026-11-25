# System Architecture

## Procurement and Purchase Order Management System

## 1. Architecture overview

The system uses a three-layer web architecture:

1.  **Frontend:** Angular components, forms, routing and services.
2.  **Backend:** Spring Boot REST controllers, service classes and
    Spring Data JPA repositories.
3.  **Database:** MySQL relational database using InnoDB tables.

The Angular application communicates with the Spring Boot backend using
JSON over HTTP. The backend validates requests, applies procurement
business rules and persists data through JPA.

## 2. High-level component view

``` text
+------------------------------+
|          User                |
| Requester / Procurement     |
| Executive / Manager / Admin |
+---------------+--------------+
                |
                v
+------------------------------+
|       Angular Frontend       |
|                              |
| Pages / Components           |
| - Dashboard                  |
| - Suppliers and Products     |
| - Requisitions               |
| - Quotations                 |
| - Purchase Orders            |
|                              |
| Angular Router               |
| Reactive Forms + Validation  |
| Angular Services (HttpClient)|
+---------------+--------------+
                |
         JSON REST over HTTP
                |
                v
+------------------------------+
|       Spring Boot API        |
|                              |
| REST Controllers             |
|        |                     |
|        v                     |
| Service Layer                |
|        |                     |
|        v                     |
| Spring Data JPA Repositories |
+---------------+--------------+
                |
                v
+------------------------------+
|          MySQL               |
|                              |
| Supplier                     |
| Product                      |
| PurchaseRequisition          |
| Quotation                    |
| PurchaseOrder                |
+------------------------------+
```

## 3. Frontend architecture (Angular)

Suggested feature organisation:

``` text
src/app/
  core/
    services/
    models/
  shared/
    components/
    validators/
  features/
    dashboard/
    suppliers/
    products/
    requisitions/
    quotations/
    purchase-orders/
  app-routing.module.ts
  app.module.ts
```

-   **Pages/components:** render dashboards, forms, tables and detail
    views.
-   **Angular services:** centralise HttpClient calls and expose typed
    methods for GET, POST, PUT and DELETE.
-   **Models/interfaces:** represent supplier, product, requisition,
    quotation and purchase-order data.
-   **Reactive forms:** handle required, length, format, date and
    numeric validation.
-   **Router:** provides navigation between feature pages.
-   **Shared components:** reusable navigation, tables, status
    indicators and confirmation dialogs.

The frontend must call the Spring Boot API. It must not use a React UI
or JSON Server.

## 4. Backend architecture (Spring Boot)

Suggested package organisation:

``` text
src/main/java/.../
  controller/
    SupplierController.java
    ProductController.java
    RequisitionController.java
    QuotationController.java
    PurchaseOrderController.java
  service/
    SupplierService.java
    ProductService.java
    RequisitionService.java
    QuotationService.java
    PurchaseOrderService.java
  repository/
    SupplierRepository.java
    ProductRepository.java
    RequisitionRepository.java
    QuotationRepository.java
    PurchaseOrderRepository.java
  entity/
    Supplier.java
    Product.java
    PurchaseRequisition.java
    Quotation.java
    PurchaseOrder.java
  dto/
  exception/
```

Responsibilities: - **Controller:** maps HTTP endpoints, accepts request
DTOs and returns responses. - **Service:** applies validation and
business rules, coordinates related records and transactions. -
**Repository:** performs database access through Spring Data JPA. -
**Entity:** maps Java objects to MySQL tables. - **DTO:** defines API
request/response shapes and avoids exposing persistence details
unnecessarily. - **Exception handling:** returns consistent JSON errors
and appropriate HTTP status codes.

## 5. REST API design

Implement CRUD endpoints for each resource.

  ------------------------------------------------------------------------------
  Resource                Collection endpoint      Item endpoint
  ----------------------- ------------------------ -----------------------------
  Suppliers               `/api/suppliers`         `/api/suppliers/{id}`

  Products                `/api/products`          `/api/products/{id}`

  Requisitions            `/api/requisitions`      `/api/requisitions/{id}`

  Quotations              `/api/quotations`        `/api/quotations/{id}`

  Purchase orders         `/api/purchase-orders`   `/api/purchase-orders/{id}`
  ------------------------------------------------------------------------------

Expected methods: - `GET /api/{resource}` --- list records. -
`GET /api/{resource}/{id}` --- fetch one record. -
`POST /api/{resource}` --- create a record. - `PUT /api/{resource}/{id}`
--- update a record. - `DELETE /api/{resource}/{id}` --- delete only
where permitted.

Additional business endpoints may be added consistently for dashboard
summaries, quotation comparison and status updates.

## 6. Database architecture

Use MySQL InnoDB tables with: - Auto-generated primary keys where
appropriate. - Foreign keys for the relationships below. - Unique
constraints for business identifiers. - NOT NULL constraints for
mandatory fields. - Suitable DECIMAL, DATE and DATETIME types. - Indexes
on frequently searched identifiers and foreign keys.

### Main entities and relationships

``` text
Supplier (1) -------- (M) Quotation
    |                       |
    |                       |
    +-------- (M) PurchaseOrder

PurchaseRequisition (1) -- (M) Quotation
PurchaseRequisition (1) -- (M) PurchaseOrder

Product
  Product master referenced by requested product information
  in the requisition workflow.
```

Five main persistent entities are specified: Supplier, Product,
PurchaseRequisition, Quotation and PurchaseOrder. The source brief
suggests keeping requested product, quantity and estimated price in
requisition line-item/structured fields to remain within the five-entity
limit. A separate requisition-line entity/table would exceed that limit
unless approved.

## 7. Core workflow and data flow

1.  Procurement administrator creates supplier and product master
    records.
2.  Department requester creates a purchase requisition with requested
    product information, quantity and estimated price.
3.  Procurement executive records one or more supplier quotations
    against the requisition.
4.  Procurement users compare quotations.
5.  A purchase order is generated with supplier, requisition, amount,
    order date and expected delivery date.
6.  Users update and monitor requisition, quotation and purchase-order
    statuses.
7.  Dashboard queries summarise open requisitions, quotations awaiting
    review, open orders and outstanding order value.

## 8. Error handling and validation

-   Validate required fields and numeric/date constraints in Angular for
    user feedback.
-   Repeat all important validation in Spring Boot; frontend validation
    alone is not sufficient.
-   Return suitable HTTP status codes (for example, 400 for invalid
    input, 404 for missing records and 409 for duplicate/conflicting
    business data).
-   Use a consistent JSON error structure with a message and, where
    appropriate, field errors.
-   Prevent deletion when foreign-key references or business rules
    prohibit it.

## 9. Development and testing tools

-   Angular CLI and IDE.
-   Spring Boot and Maven (`pom.xml`).
-   MySQL and MySQL Workbench.
-   Postman for API verification.
-   Browser developer tools for frontend debugging.
-   Git/GitHub for source control.

## 10. Deployment/run configuration

-   Configure the Angular API base URL to point to the Spring Boot
    server.
-   Configure Spring Boot datasource properties for the local MySQL
    database.
-   Keep credentials outside committed source code; use local
    environment/configuration values.
-   Provide schema/sample-data scripts and README setup steps.
-   Verify data persistence after restarting the backend.

## 11. Security and scope note

The academic brief explicitly excludes a login/security module. The
implementation therefore assumes authorised business users for
demonstration and does not claim to provide production-grade
authentication or authorisation.
