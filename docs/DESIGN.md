# UI and Application Design

## Procurement and Purchase Order Management System

## 1. Design goals

-   Make the procure-to-order workflow easy to follow.
-   Keep supplier and product master data separate from transaction
    records.
-   Make statuses, due dates and outstanding work visible.
-   Use consistent forms, tables, validation messages and confirmation
    dialogs.
-   Provide a responsive Angular interface.

## 2. Navigation structure

``` text
Procurement Management
|
+-- Dashboard
|
+-- Masters
|   +-- Suppliers
|   +-- Products
|
+-- Procurement
    +-- Requisitions
    +-- Quotations
    +-- Purchase Orders
```

A persistent top bar or side navigation should identify the application
and provide access to the main sections. Highlight the active route.

## 3. Visual design system

Use a clean, professional manufacturing/procurement style.

-   **Layout:** dashboard cards, page headings, clear content sections
    and consistent spacing.
-   **Typography:** one readable sans-serif family with a clear
    heading/body hierarchy.
-   **Colour:** restrained navy/blue for primary navigation and actions;
    neutral backgrounds; semantic status colours used consistently.
-   **Status indicators:** compact labels for Draft, Open, Pending
    Review, Approved, Ordered, Closed, Cancelled or Delayed, as
    applicable to the implemented workflow.
-   **Controls:** consistent button sizes, input heights, table spacing
    and dialog styles.
-   **Responsive behaviour:** tables should remain usable on smaller
    screens; forms should collapse to a single column.

Use Bootstrap or Angular Material with custom CSS. Avoid mixing
component libraries.

## 4. Dashboard design

The dashboard is the landing page and provides a quick operational
overview.

### Suggested layout

``` text
+----------------------------------------------------------+
| Procurement Management                    [User context] |
+----------------------+-----------------------------------+
| Dashboard            | Dashboard                          |
| Suppliers            |                                   |
| Products             | +-------------+ +---------------+ |
| Requisitions         | | Open        | | Quotations    | |
| Quotations           | | requisitions| | awaiting      | |
| Purchase Orders      | +-------------+ | review        | |
|                      |                 +---------------+ |
|                      | +-------------+ +---------------+ |
|                      | | Open        | | Outstanding   | |
|                      | | purchase    | | order value   | |
|                      | | orders      | |               | |
|                      | +-------------+ +---------------+ |
|                      |                                   |
|                      | Upcoming / delayed work           |
+----------------------+-----------------------------------+
```

Dashboard cards must use values returned by backend APIs, not hard-coded
sample counts. Include upcoming/delayed work only when supported by
stored dates and statuses.

## 5. Master-data pages

### 5.1 Supplier list

-   Page title: Suppliers.
-   Primary action: Add Supplier.
-   Search by supplier code or company name.
-   Table columns: Supplier Code, Company Name, Contact Person, Email,
    City, Status, Actions.
-   Actions: View, Edit, Delete (only if permitted).
-   Confirm deletion and show a useful message if a supplier is
    referenced by a quotation or purchase order.

### 5.2 Supplier form/detail

Fields: - Supplier code (required, unique). - Company name (required). -
Contact person. - Email (format validation). - Phone. - Address. -
City. - Status.

Use inline field errors and Save/Cancel actions.

### 5.3 Product list and form

List columns: SKU, Product Name, Unit, Standard Price, Active, Actions.

Form fields: - SKU (required, unique). - Product name (required). -
Description. - Unit. - Standard price (numeric, non-negative). - Active
status.

## 6. Transaction pages

### 6.1 Requisition list

-   Search by request number or department.
-   Optional filters for status and date.
-   Columns: Request Number, Request Date, Department, Requested By,
    Required Date, Status, Actions.
-   Actions: View, Edit, Close.

### 6.2 Requisition create/edit form

Fields: - Request number. - Request date. - Department. - Requested
by. - Required date. - Requested product information, quantity and
estimated price. - Status. - Remarks.

Validate required values, positive requested quantities, non-negative
estimated prices and sensible date values. Show a detail page with
requisition status and related quotation/order information where
available.

### 6.3 Quotation capture

Fields: - Quotation number. - Supplier (select from supplier master). -
Requisition (select from open/eligible requisitions). - Quotation
date. - Validity date. - Quoted amount. - Delivery days. - Status.

The comparison page should group quotations for the selected requisition
and display supplier, quoted amount, delivery days, validity date and
status. Do not imply that the lowest price is automatically selected.

### 6.4 Purchase order list and detail

List columns: PO Number, Supplier, Requisition, Order Date, Expected
Delivery Date, Total Amount, Status, Actions.

The detail page should show the linked supplier and requisition, order
dates, amount and current status. Provide a status update action
consistent with the backend business rules.

## 7. Reusable Angular components

-   Main navigation/header.
-   Page title and breadcrumb.
-   Data table with search and empty state.
-   Form field wrapper and validation message.
-   Status badge/indicator.
-   Confirmation dialog.
-   Loading indicator and error/notification message.
-   Dashboard summary card.

Use Angular services for all API requests; reusable components should
not contain duplicated endpoint logic.

## 8. Form and interaction rules

-   Mark required fields clearly.
-   Validate on submit and, where helpful, after a field has been
    touched.
-   Preserve entered values when a server-side validation error occurs.
-   Disable repeated submission while a request is in progress.
-   Show loading, success, empty and error states.
-   Ask for confirmation before deletion or cancellation.
-   Refresh the relevant list/detail data after a successful create or
    update.
-   Do not show a successful save message until the backend confirms
    success.

## 9. Status and deletion design

Status is a business workflow value, not an authentication/authorisation
mechanism.

Use status-based cancellation, closure or deactivation where records are
part of the procurement history. Hard deletion is restricted to
draft/test records where permitted. If deletion is blocked by a
reference, show a clear explanation rather than a generic failure.

## 10. Accessibility and usability

-   Associate labels with form controls.
-   Ensure keyboard access to navigation, buttons, tables and dialogs.
-   Use sufficient contrast and do not communicate status by colour
    alone.
-   Provide descriptive validation and error text.
-   Keep page titles and action labels predictable.

## 11. Evidence screenshots for submission

Capture the following real application screens: 1. **Project setup:**
Angular and Spring Boot folder structures and configuration. 2.
**Home/dashboard:** dashboard cards and navigation. 3. **Create:** a
valid create form and the saved record. 4. **Read/list:** searchable
records and a detail page. 5. **Update:** an existing record being
edited and the persisted updated value. 6. **Delete/status:** permitted
deletion or status-based cancellation/deactivation and resulting list.
7. **API/backend:** Postman request and response for at least one GET,
POST, PUT and DELETE/status operation. 8. **Database:** MySQL tables,
sample rows and foreign-key relationship evidence.

Screenshots should be captured from the implemented application; do not
use mockups as proof of working functionality.
