import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="card p-4">
      <h3 class="fw-bold text-primary"><i class="bi bi-speedometer2 me-2"></i>Procurement Dashboard</h3>
      <p class="text-muted">Loading operational summaries and KPI metrics...</p>
    </div>
  `
})
export class DashboardComponent {}
