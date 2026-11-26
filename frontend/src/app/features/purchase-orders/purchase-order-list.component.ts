import { Component } from '@angular/core';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  template: `
    <div class="card p-4">
      <h3 class="fw-bold text-primary"><i class="bi bi-cart-check me-2"></i>Purchase Orders</h3>
      <p class="text-muted">Loading purchase orders...</p>
    </div>
  `
})
export class PurchaseOrderListComponent {}
