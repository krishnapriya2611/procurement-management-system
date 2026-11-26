# Procurement and Purchase Order Management System - Backend

Enterprise-grade Spring Boot REST API for managing end-to-end procurement workflows: supplier and product master maintenance, purchase requisitions, supplier quotation capture and comparison, purchase order lifecycle tracking, and operational dashboard summaries.

---

## 1. Technology Stack

- **Language:** Java 21 / 24
- **Framework:** Spring Boot 3.3.5
- **ORM / Persistence:** Spring Data JPA, Hibernate 6.5
- **Database:** MySQL 8.0 (InnoDB)
- **Validation:** Jakarta Bean Validation (Hibernate Validator)
- **Build Tool:** Apache Maven 3.9+
- **Frontend Target:** Angular Single Page Application (communicating via HTTP JSON)

---

## 2. System Architecture

Three-tier layered architecture adhering to separation of concerns:

```
[ Angular Single Page App ]
            |
            | JSON over HTTP (Port 8080)
            v
+-------------------------------------------------------+
|                Spring Boot Backend                     |
|                                                       |
|  Controller Layer   (@RestController / @Valid)        |
|         |                                             |
|         v                                             |
|  Service Layer      (Business Rules & Transactions)   |
|         |                                             |
|         v                                             |
|  Repository Layer   (Spring Data JPA / Queries)       |
|         |                                             |
|         v                                             |
|  Entity Layer       (5 Persistent JPA Entities)       |
+-------------------------------------------------------+
            |
            | JDBC (HikariCP)
            v
[ MySQL Database (procurement_db) ]
  - suppliers
  - products
  - purchase_requisitions
  - requisition_items (embeddable collection)
  - quotations
  - purchase_orders
```

---

## 3. The 5 Main Persistent Entities

1. **`Supplier`**: `supplierId` (PK), `supplierCode` (Unique), `companyName`, `contactPerson`, `email`, `phone`, `address`, `city`, `status`.
2. **`Product`**: `productId` (PK), `sku` (Unique), `productName`, `description`, `unit`, `standardPrice`, `active`.
3. **`PurchaseRequisition`**: `requisitionId` (PK), `requestNumber` (Unique), `requestDate`, `department`, `requestedBy`, `requiredDate`, `status`, `remarks`, plus an embeddable collection of `RequisitionItem` (`productId`, `productSku`, `productName`, `quantity`, `estimatedPrice`).
4. **`Quotation`**: `quotationId` (PK), `quotationNumber` (Unique), `supplier` (FK), `purchaseRequisition` (FK), `quotationDate`, `validityDate`, `quotedAmount`, `deliveryDays`, `status`.
5. **`PurchaseOrder`**: `purchaseOrderId` (PK), `poNumber` (Unique), `supplier` (FK), `purchaseRequisition` (FK), `orderDate`, `expectedDeliveryDate`, `totalAmount`, `status`.

---

## 4. Database Setup Instructions

### Option A: Automatic Table Generation (Recommended)
Spring Boot automatically creates and updates all database tables and constraints upon application startup via Hibernate DDL:
`spring.jpa.hibernate.ddl-auto=update`

### Option B: Manual SQL Setup Script
If you prefer running manual SQL scripts in MySQL Workbench or the MySQL CLI:
```bash
mysql -u root -p < docs/schema_and_sample_data.sql
```

### Configuration (`application.properties`)
Create or verify `backend/src/main/resources/application.properties`:
```properties
spring.application.name=procurement-system
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/procurement_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

---

## 5. Building and Running the Backend

Navigate to the `backend` folder:
```powershell
cd backend
```

### Run Tests:
```powershell
mvn test
```

### Run the Application:
```powershell
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

### Package to Executable JAR:
```powershell
mvn clean package -DskipTests
java -jar target/procurement-system-0.0.1-SNAPSHOT.jar
```

---

## 6. Complete REST API Reference

Base URL: `http://localhost:8080`

### 6.1 Supplier APIs (`/api/suppliers`)
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/suppliers` | List all suppliers (supports `?search=` and `?status=`) | `200 OK` |
| `GET` | `/api/suppliers/{id}` | Get supplier by ID | `200 OK`, `404 Not Found` |
| `POST` | `/api/suppliers` | Create supplier | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `PUT` | `/api/suppliers/{id}` | Update supplier | `200 OK`, `404 Not Found`, `409 Conflict` |
| `PATCH`| `/api/suppliers/{id}/status` | Update supplier status (`Active`/`Inactive`) | `200 OK`, `404 Not Found` |
| `DELETE`| `/api/suppliers/{id}` | Delete unreferenced supplier | `204 No Content`, `409 Conflict` |

#### Sample Create Supplier Request (`POST /api/suppliers`):
```json
{
  "supplierCode": "SUP-1005",
  "companyName": "Bharat Heavy Electricals Ltd",
  "contactPerson": "Rajan Pillai",
  "email": "rajan@bhel.in",
  "phone": "+91-11-66337000",
  "address": "BHEL House, Siri Fort",
  "city": "New Delhi",
  "status": "Active"
}
```

---

### 6.2 Product APIs (`/api/products`)
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/products` | List all products (supports `?search=` and `?active=`) | `200 OK` |
| `GET` | `/api/products/{id}` | Get product by ID | `200 OK`, `404 Not Found` |
| `POST` | `/api/products` | Create product | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `PUT` | `/api/products/{id}` | Update product | `200 OK`, `404 Not Found`, `409 Conflict` |
| `PATCH`| `/api/products/{id}/status` | Toggle active status | `200 OK`, `404 Not Found` |
| `DELETE`| `/api/products/{id}` | Delete product | `204 No Content`, `404 Not Found` |

#### Sample Create Product Request (`POST /api/products`):
```json
{
  "sku": "PRD-PMP-006",
  "productName": "Centrifugal Coolant Pump 0.75kW",
  "description": "Submersible coolant pump for CNC milling machines",
  "unit": "PCS",
  "standardPrice": 14200.00,
  "active": true
}
```

---

### 6.3 Purchase Requisition APIs (`/api/requisitions`)
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/requisitions` | List all requisitions (`?search=`, `?status=`) | `200 OK` |
| `GET` | `/api/requisitions/{id}` | Get requisition details with line items | `200 OK`, `404 Not Found` |
| `POST` | `/api/requisitions` | Create requisition | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/requisitions/{id}` | Update requisition details & lines | `200 OK`, `400 Bad Request` |
| `PATCH`| `/api/requisitions/{id}/status` | Update status (`Open`, `Closed`, `Cancelled`) | `200 OK`, `404 Not Found` |
| `DELETE`| `/api/requisitions/{id}` | Delete permitted draft requisition | `204 No Content`, `409 Conflict` |

#### Sample Create Requisition Request (`POST /api/requisitions`):
```json
{
  "requestNumber": "REQ-2026-004",
  "requestDate": "2026-11-26",
  "department": "CNC Machining Center",
  "requestedBy": "Kiran Kumar",
  "requiredDate": "2026-12-15",
  "status": "Open",
  "remarks": "Spares for upcoming tooling change",
  "items": [
    {
      "productId": 1,
      "productSku": "PRD-RAW-001",
      "productName": "Structural Steel Angles 50x50x5mm",
      "quantity": 2,
      "estimatedPrice": 54500.00
    }
  ]
}
```

---

### 6.4 Quotation APIs (`/api/quotations`)
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/quotations` | List all quotations (`?status=`) | `200 OK` |
| `GET` | `/api/quotations/{id}` | Get quotation by ID | `200 OK`, `404 Not Found` |
| `GET` | `/api/quotations/requisition/{reqId}` | List quotations for a requisition | `200 OK` |
| `GET` | `/api/quotations/compare/{reqId}` | Quotation comparison grouping | `200 OK`, `404 Not Found` |
| `POST` | `/api/quotations` | Record quotation against supplier & requisition | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/quotations/{id}` | Update quotation details | `200 OK`, `400 Bad Request` |
| `PATCH`| `/api/quotations/{id}/status` | Accept/Reject quotation status | `200 OK`, `404 Not Found` |
| `DELETE`| `/api/quotations/{id}` | Delete quotation | `204 No Content`, `404 Not Found` |

#### Sample Quotation Comparison Response (`GET /api/quotations/compare/1`):
```json
{
  "requisitionId": 1,
  "requestNumber": "REQ-2026-001",
  "department": "Production & Press Shop",
  "requiredDate": "2026-12-05",
  "quotations": [
    {
      "quotationId": 1,
      "quotationNumber": "QT-2026-001",
      "supplierId": 3,
      "supplierCode": "SUP-1003",
      "supplierCompanyName": "Bosch Rexroth Hydraulics India",
      "quotationDate": "2026-11-22",
      "validityDate": "2026-12-15",
      "quotedAmount": 78500.00,
      "deliveryDays": 7,
      "status": "Pending Review"
    },
    {
      "quotationId": 2,
      "quotationNumber": "QT-2026-002",
      "supplierId": 4,
      "supplierCode": "SUP-1004",
      "supplierCompanyName": "SKF India Bearings & Seals",
      "quotationDate": "2026-11-23",
      "validityDate": "2026-12-20",
      "quotedAmount": 76200.00,
      "deliveryDays": 10,
      "status": "Pending Review"
    }
  ]
}
```

---

### 6.5 Purchase Order APIs (`/api/purchase-orders`)
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/purchase-orders` | List all purchase orders (`?status=`) | `200 OK` |
| `GET` | `/api/purchase-orders/{id}` | Get purchase order details | `200 OK`, `404 Not Found` |
| `GET` | `/api/purchase-orders/requisition/{id}` | Orders for a requisition | `200 OK` |
| `GET` | `/api/purchase-orders/supplier/{id}` | Orders for a supplier | `200 OK` |
| `POST` | `/api/purchase-orders` | Create purchase order | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/purchase-orders/{id}` | Update purchase order | `200 OK`, `400 Bad Request` |
| `PATCH`| `/api/purchase-orders/{id}/status` | Update PO status (`Open`, `Delivered`, `Delayed`, `Cancelled`) | `200 OK` |
| `DELETE`| `/api/purchase-orders/{id}` | Delete purchase order | `204 No Content`, `400 Bad Request` |

#### Sample Create PO Request (`POST /api/purchase-orders`):
```json
{
  "poNumber": "PO-2026-003",
  "supplierId": 3,
  "requisitionId": 1,
  "orderDate": "2026-11-26",
  "expectedDeliveryDate": "2026-12-03",
  "totalAmount": 78500.00,
  "status": "Open"
}
```

---

### 6.6 Dashboard Summary API (`GET /api/dashboard/summary`)
Returns aggregated business counts and values:
```json
{
  "openRequisitionsCount": 2,
  "quotationsAwaitingReviewCount": 3,
  "openPurchaseOrdersCount": 1,
  "outstandingOrderValue": 78500.00,
  "delayedOrdersCount": 0
}
```

---

## 7. Connecting the Angular Frontend

### 1. CORS Pre-configuration
The Spring Boot backend is pre-configured with CORS in `CorsConfig.java` to allow requests from the default Angular development server:
`http://localhost:4200`

### 2. Angular Environment Configuration
In your Angular application (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### 3. Angular Service Example
In your Angular service (e.g., `supplier.service.ts`):
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private baseUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  getSuppliers(search?: string, status?: string): Observable<any[]> {
    let params: any = {};
    if (search) params.search = search;
    if (status) params.status = status;
    return this.http.get<any[]>(this.baseUrl, { params });
  }

  createSupplier(supplier: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, supplier);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```
