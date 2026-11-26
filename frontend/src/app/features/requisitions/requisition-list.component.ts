import { Component } from '@angular/core';

@Component({
  selector: 'app-requisition-list',
  standalone: true,
  template: `
    <div class="card p-4">
      <h3 class="fw-bold text-primary"><i class="bi bi-file-earmark-text me-2"></i>Purchase Requisitions</h3>
      <p class="text-muted">Loading purchase requisitions...</p>
    </div>
  `
})
export class RequisitionListComponent {}
