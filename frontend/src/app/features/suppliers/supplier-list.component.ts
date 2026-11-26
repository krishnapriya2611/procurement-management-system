import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupplierService } from '../../core/services/supplier.service';
import { Supplier } from '../../core/models/supplier.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AlertBannerComponent } from '../../shared/components/alert-banner/alert-banner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, AlertBannerComponent, ConfirmDialogComponent],
  template: `
    <div class="suppliers-container">
      <!-- Title & Action Bar -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h2 class="h3 fw-bold text-dark mb-1">
            <i class="bi bi-building text-primary me-2"></i>Suppliers Master
          </h2>
          <p class="text-muted small mb-0">Manage verified vendor profiles, contact personnel, and operational statuses.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" (click)="openAddModal()">
          <i class="bi bi-plus-circle-fill"></i> Add New Supplier
        </button>
      </div>

      <!-- Notification Alerts -->
      <app-alert-banner [message]="successMessage" type="success" (dismiss)="successMessage = null"></app-alert-banner>
      <app-alert-banner [message]="errorMessage" type="error" (dismiss)="errorMessage = null"></app-alert-banner>

      <!-- Search & Filters -->
      <div class="card mb-4 shadow-sm border-0 bg-light">
        <div class="card-body py-3">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-6 col-lg-5">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0" placeholder="Search by supplier code or company name..."
                       [(ngModel)]="searchKeyword" (keyup.enter)="loadSuppliers()" />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <select class="form-select" [(ngModel)]="statusFilter" (change)="loadSuppliers()">
                <option value="">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
            <div class="col-12 col-sm-6 col-md-3 d-flex gap-2">
              <button class="btn btn-secondary flex-grow-1" (click)="loadSuppliers()">Apply</button>
              <button class="btn btn-outline-secondary" (click)="resetFilters()" title="Reset Filters">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted small mt-2">Loading supplier directory...</p>
      </div>

      <!-- Suppliers Table -->
      <div *ngIf="!isLoading" class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" style="width: 140px;">Code</th>
                <th scope="col">Company Name</th>
                <th scope="col">Contact Person</th>
                <th scope="col">Email & Phone</th>
                <th scope="col">City</th>
                <th scope="col">Status</th>
                <th scope="col" class="text-end" style="width: 200px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of suppliers">
                <td>
                  <span class="badge bg-secondary-subtle text-dark border font-monospace">{{ s.supplierCode }}</span>
                </td>
                <td class="fw-semibold text-dark">{{ s.companyName }}</td>
                <td>{{ s.contactPerson || '—' }}</td>
                <td>
                  <div class="small text-truncate" style="max-width: 200px;">
                    <i class="bi bi-envelope me-1 text-muted"></i>{{ s.email || '—' }}
                  </div>
                  <div class="small text-muted" *ngIf="s.phone">
                    <i class="bi bi-telephone me-1 text-muted"></i>{{ s.phone }}
                  </div>
                </td>
                <td>{{ s.city || '—' }}</td>
                <td>
                  <app-status-badge [status]="s.status"></app-status-badge>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-info" (click)="viewDetails(s)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary" (click)="openEditModal(s)" title="Edit Supplier">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-warning" (click)="toggleStatus(s)"
                            [title]="s.status === 'Active' ? 'Deactivate Supplier' : 'Activate Supplier'">
                      <i class="bi" [ngClass]="s.status === 'Active' ? 'bi-pause-circle' : 'bi-play-circle'"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="promptDelete(s)" title="Delete Supplier">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Empty state -->
              <tr *ngIf="suppliers.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  No suppliers found matching your criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="isFormModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65);" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark-navy text-white">
              <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="bi" [ngClass]="isEditing ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
                {{ isEditing ? 'Edit Supplier' : 'Register New Supplier' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeFormModal()"></button>
            </div>
            <form [formGroup]="supplierForm" (ngSubmit)="saveSupplier()">
              <div class="modal-body py-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Supplier Code <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" formControlName="supplierCode" placeholder="e.g. SUP-1001"
                           [class.is-invalid]="f['supplierCode'].touched && f['supplierCode'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['supplierCode'].errors?.['required']">Supplier code is required.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Company Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" formControlName="companyName" placeholder="e.g. Tata Steel Ltd"
                           [class.is-invalid]="f['companyName'].touched && f['companyName'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['companyName'].errors?.['required']">Company name is required.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Contact Person</label>
                    <input type="text" class="form-control" formControlName="contactPerson" placeholder="Full name" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Email</label>
                    <input type="email" class="form-control" formControlName="email" placeholder="contact@vendor.com"
                           [class.is-invalid]="f['email'].touched && f['email'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['email'].errors?.['email']">Enter a valid email address.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Phone</label>
                    <input type="text" class="form-control" formControlName="phone" placeholder="+91-..." />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">City</label>
                    <input type="text" class="form-control" formControlName="city" placeholder="City name" />
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Office Address</label>
                    <textarea class="form-control" rows="2" formControlName="address" placeholder="Physical street address"></textarea>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Status</label>
                    <select class="form-select" formControlName="status">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary" (click)="closeFormModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="supplierForm.invalid || isSaving">
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEditing ? 'Save Changes' : 'Create Supplier' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <div *ngIf="selectedSupplier" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65);" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light">
              <h5 class="modal-title fw-bold text-dark">Supplier Details</h5>
              <button type="button" class="btn-close" (click)="selectedSupplier = null"></button>
            </div>
            <div class="modal-body py-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-secondary font-monospace fs-6">{{ selectedSupplier.supplierCode }}</span>
                <app-status-badge [status]="selectedSupplier.status"></app-status-badge>
              </div>
              <h4 class="fw-bold mb-3">{{ selectedSupplier.companyName }}</h4>
              <ul class="list-group list-group-flush small">
                <li class="list-group-item d-flex justify-content-between px-0">
                  <span class="text-muted">Contact Person:</span>
                  <span class="fw-semibold">{{ selectedSupplier.contactPerson || '—' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between px-0">
                  <span class="text-muted">Email:</span>
                  <span class="fw-semibold">{{ selectedSupplier.email || '—' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between px-0">
                  <span class="text-muted">Phone:</span>
                  <span class="fw-semibold">{{ selectedSupplier.phone || '—' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between px-0">
                  <span class="text-muted">City:</span>
                  <span class="fw-semibold">{{ selectedSupplier.city || '—' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between px-0">
                  <span class="text-muted">Address:</span>
                  <span class="fw-semibold text-end" style="max-width: 60%;">{{ selectedSupplier.address || '—' }}</span>
                </li>
              </ul>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" (click)="selectedSupplier = null">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen"
        [title]="'Delete Supplier'"
        [message]="deleteConfirmMessage"
        [confirmText]="'Delete Supplier'"
        [isDanger]="true"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteDialogOpen = false">
      </app-confirm-dialog>
    </div>
  `
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  searchKeyword = '';
  statusFilter = '';
  isLoading = false;
  isSaving = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Modals
  isFormModalOpen = false;
  isEditing = false;
  currentSupplierId: number | null = null;
  selectedSupplier: Supplier | null = null;

  // Delete dialog
  isDeleteDialogOpen = false;
  supplierToDelete: Supplier | null = null;

  supplierForm: FormGroup;

  get deleteConfirmMessage(): string {
    const name = this.supplierToDelete?.companyName || '';
    return `Are you sure you want to delete supplier '${name}'? If this supplier is linked to quotations or orders, deletion will be blocked.`;
  }

  constructor(
    private supplierService: SupplierService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.supplierForm = this.fb.group({
      supplierCode: ['', Validators.required],
      companyName: ['', Validators.required],
      contactPerson: [''],
      email: ['', Validators.email],
      phone: [''],
      address: [''],
      city: [''],
      status: ['Active', Validators.required]
    });
  }

  get f() { return this.supplierForm.controls; }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.isLoading = true;
    this.supplierService.getSuppliers(this.searchKeyword, this.statusFilter).subscribe({
      next: (data) => {
        this.suppliers = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load suppliers.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.statusFilter = '';
    this.loadSuppliers();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentSupplierId = null;
    this.supplierForm.reset({ status: 'Active' });
    this.isFormModalOpen = true;
  }

  openEditModal(s: Supplier): void {
    this.isEditing = true;
    this.currentSupplierId = s.supplierId || null;
    this.supplierForm.patchValue({
      supplierCode: s.supplierCode,
      companyName: s.companyName,
      contactPerson: s.contactPerson || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      city: s.city || '',
      status: s.status || 'Active'
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
  }

  saveSupplier(): void {
    if (this.supplierForm.invalid) return;

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: Supplier = this.supplierForm.value;

    if (this.isEditing && this.currentSupplierId) {
      this.supplierService.updateSupplier(this.currentSupplierId, payload).subscribe({
        next: (updated) => {
          this.successMessage = `Supplier '${updated.companyName}' updated successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadSuppliers();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update supplier.';
          this.isSaving = false;
        }
      });
    } else {
      this.supplierService.createSupplier(payload).subscribe({
        next: (created) => {
          this.successMessage = `Supplier '${created.companyName}' registered successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadSuppliers();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to register supplier.';
          this.isSaving = false;
        }
      });
    }
  }

  toggleStatus(s: Supplier): void {
    if (!s.supplierId) return;
    const newStatus = s.status === 'Active' ? 'Inactive' : 'Active';
    this.supplierService.updateStatus(s.supplierId, newStatus).subscribe({
      next: (res) => {
        s.status = res.status;
        this.successMessage = `Supplier status updated to ${res.status}.`;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update status.';
      }
    });
  }

  viewDetails(s: Supplier): void {
    this.selectedSupplier = s;
  }

  promptDelete(s: Supplier): void {
    this.supplierToDelete = s;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.supplierToDelete?.supplierId) return;

    const id = this.supplierToDelete.supplierId;
    const name = this.supplierToDelete.companyName;

    this.isDeleteDialogOpen = false;
    this.supplierService.deleteSupplier(id).subscribe({
      next: () => {
        this.successMessage = `Supplier '${name}' was deleted successfully.`;
        this.loadSuppliers();
      },
      error: (err) => {
        // Displays exact business rule message from backend
        this.errorMessage = err.error?.message || 'Cannot delete supplier.';
      }
    });
  }
}
