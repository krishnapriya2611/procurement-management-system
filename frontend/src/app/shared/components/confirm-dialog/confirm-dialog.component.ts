import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65);" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header" [ngClass]="isDanger ? 'bg-danger text-white' : 'bg-primary text-white'">
            <h5 class="modal-title d-flex align-items-center gap-2">
              <i class="bi" [ngClass]="isDanger ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'"></i>
              {{ title }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="cancel.emit()"></button>
          </div>
          <div class="modal-body py-4">
            <p class="mb-0 fs-6">{{ message }}</p>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" (click)="cancel.emit()">Cancel</button>
            <button type="button" class="btn" [ngClass]="isDanger ? 'btn-danger' : 'btn-primary'" (click)="confirm.emit()">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() isDanger = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
