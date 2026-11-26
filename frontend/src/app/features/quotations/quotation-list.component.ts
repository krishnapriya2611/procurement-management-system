import { Component } from '@angular/core';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  template: `
    <div class="card p-4">
      <h3 class="fw-bold text-primary"><i class="bi bi-receipt me-2"></i>Supplier Quotations</h3>
      <p class="text-muted">Loading supplier quotations...</p>
    </div>
  `
})
export class QuotationListComponent {}
