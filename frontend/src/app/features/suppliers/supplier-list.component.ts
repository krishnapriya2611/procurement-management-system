import { Component } from '@angular/core';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  template: `
    <div class="card p-4">
      <h3 class="fw-bold text-primary"><i class="bi bi-building me-2"></i>Suppliers Management</h3>
      <p class="text-muted">Loading suppliers directory...</p>
    </div>
  `
})
export class SupplierListComponent {}
