import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SupplierListComponent } from './features/suppliers/supplier-list.component';
import { ProductListComponent } from './features/products/product-list.component';
import { RequisitionListComponent } from './features/requisitions/requisition-list.component';
import { QuotationListComponent } from './features/quotations/quotation-list.component';
import { PurchaseOrderListComponent } from './features/purchase-orders/purchase-order-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'suppliers', component: SupplierListComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'requisitions', component: RequisitionListComponent },
  { path: 'quotations', component: QuotationListComponent },
  { path: 'purchase-orders', component: PurchaseOrderListComponent },
  { path: '**', redirectTo: 'dashboard' }
];
