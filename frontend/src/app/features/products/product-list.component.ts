import { Component } from '@angular/core';

@Component({
  selector: 'app-product-list',
  standalone: true,
  template: `
    <div class="card p-4">
      <h3 class="fw-bold text-primary"><i class="bi bi-boxes me-2"></i>Product Catalog</h3>
      <p class="text-muted">Loading product records...</p>
    </div>
  `
})
export class ProductListComponent {}
