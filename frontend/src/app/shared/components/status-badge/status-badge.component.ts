import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <i class="bi me-1" [ngClass]="iconClass"></i>{{ status || 'N/A' }}
    </span>
  `,
  styles: [`
    .badge {
      font-weight: 500;
      padding: 0.4em 0.7em;
      font-size: 0.82rem;
      letter-spacing: 0.3px;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get badgeClass(): string {
    const s = (this.status || '').toLowerCase();
    switch (s) {
      case 'active':
      case 'accepted':
      case 'delivered':
        return 'bg-success text-white';
      case 'open':
      case 'pending review':
        return 'bg-primary text-white';
      case 'closed':
        return 'bg-secondary text-white';
      case 'inactive':
      case 'cancelled':
      case 'rejected':
        return 'bg-danger text-white';
      case 'delayed':
        return 'bg-warning text-dark';
      case 'draft':
        return 'bg-info text-dark';
      default:
        return 'bg-light text-dark border';
    }
  }

  get iconClass(): string {
    const s = (this.status || '').toLowerCase();
    switch (s) {
      case 'active':
      case 'accepted':
      case 'delivered':
        return 'bi-check-circle-fill';
      case 'open':
      case 'pending review':
        return 'bi-hourglass-split';
      case 'closed':
        return 'bi-lock-fill';
      case 'inactive':
      case 'cancelled':
      case 'rejected':
        return 'bi-x-circle-fill';
      case 'delayed':
        return 'bi-exclamation-triangle-fill';
      default:
        return 'bi-tag';
    }
  }
}
