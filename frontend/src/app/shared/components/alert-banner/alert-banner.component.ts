import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message" class="alert alert-dismissible fade show d-flex align-items-center shadow-sm"
         [ngClass]="type === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
      <i class="bi me-2 fs-5" [ngClass]="type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-octagon-fill'"></i>
      <div class="flex-grow-1">
        <strong>{{ type === 'success' ? 'Success: ' : 'Error: ' }}</strong>{{ message }}
      </div>
      <button type="button" class="btn-close" (click)="dismiss.emit()" aria-label="Close"></button>
    </div>
  `
})
export class AlertBannerComponent {
  @Input() message: string | null = null;
  @Input() type: 'success' | 'error' = 'success';
  @Output() dismiss = new EventEmitter<void>();
}
