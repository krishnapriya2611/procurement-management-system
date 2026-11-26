import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuotationService } from '../../core/services/quotation.service';
import { SupplierService } from '../../core/services/supplier.service';
import { RequisitionService } from '../../core/services/requisition.service';
import { Quotation, QuotationComparison, QuotationItemDTO, QuotationRequest } from '../../core/models/quotation.model';
import { Supplier } from '../../core/models/supplier.model';
import { PurchaseRequisition } from '../../core/models/requisition.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AlertBannerComponent } from '../../shared/components/alert-banner/alert-banner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, AlertBannerComponent, ConfirmDialogComponent],
  template: `
    <div class="quotations-container">
      <!-- Title & Action Bar -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h2 class="h3 fw-bold text-dark mb-1">
            <i class="bi bi-receipt text-primary me-2"></i>Supplier Quotations
          </h2>
          <p class="text-muted small mb-0">Record vendor bids, evaluate pricing and lead times, and compare multi-supplier tenders.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm" (click)="openCompareModal()">
            <i class="bi bi-bar-chart-steps"></i> Compare Quotations
          </button>
          <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" (click)="openAddModal()">
            <i class="bi bi-plus-circle-fill"></i> Add Quotation
          </button>
        </div>
      </div>

      <!-- Alerts -->
      <app-alert-banner [message]="successMessage" type="success" (dismiss)="successMessage = null"></app-alert-banner>
      <app-alert-banner [message]="errorMessage" type="error" (dismiss)="errorMessage = null"></app-alert-banner>

      <!-- Filters -->
      <div class="card mb-4 shadow-sm border-0 bg-light">
        <div class="card-body py-3">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-4">
              <label class="form-label small text-muted mb-1">Filter by Status</label>
              <select class="form-select" [(ngModel)]="statusFilter" (change)="loadQuotations()">
                <option value="">All Quotation Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div class="col-12 col-md-5">
              <label class="form-label small text-muted mb-1">Filter by Requisition</label>
              <select class="form-select" [(ngModel)]="requisitionFilterId" (change)="loadQuotations()">
                <option value="">All Requisitions</option>
                <option *ngFor="let req of requisitions" [value]="req.requisitionId">
                  {{ req.requestNumber }} ({{ req.department }})
                </option>
              </select>
            </div>
            <div class="col-12 col-md-3 d-flex align-items-end gap-2">
              <button class="btn btn-secondary flex-grow-1" (click)="loadQuotations()">Apply</button>
              <button class="btn btn-outline-secondary" (click)="resetFilters()" title="Reset Filters">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted small mt-2">Loading quotations...</p>
      </div>

      <!-- Quotations Table -->
      <div *ngIf="!isLoading" class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" style="width: 140px;">Quote #</th>
                <th scope="col">Supplier</th>
                <th scope="col">Requisition</th>
                <th scope="col" class="text-end">Quoted Amount</th>
                <th scope="col" class="text-center">Delivery Days</th>
                <th scope="col">Valid Until</th>
                <th scope="col" class="text-center">Status</th>
                <th scope="col" class="text-end" style="width: 180px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let q of quotations">
                <td>
                  <span class="badge bg-secondary-subtle text-dark border font-monospace fw-bold">{{ q.quotationNumber }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ q.supplier?.companyName }}</div>
                  <small class="text-muted font-monospace">{{ q.supplier?.supplierCode }}</small>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ q.purchaseRequisition?.requestNumber }}</div>
                  <small class="text-muted">{{ q.purchaseRequisition?.department }}</small>
                </td>
                <td class="text-end font-monospace fw-bold text-dark fs-6">
                  ₹{{ q.quotedAmount | number:'1.2-2' }}
                </td>
                <td class="text-center">
                  <span class="badge bg-light text-dark border">
                    <i class="bi bi-truck me-1"></i>{{ q.deliveryDays }} days
                  </span>
                </td>
                <td>
                  <span [ngClass]="isValidityExpired(q.validityDate) ? 'text-danger fw-semibold' : 'text-dark'">
                    {{ q.validityDate | date:'mediumDate' }}
                  </span>
                </td>
                <td class="text-center">
                  <app-status-badge [status]="q.status"></app-status-badge>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" (click)="openEditModal(q)" title="Edit Quote">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <!-- Status Actions -->
                    <button *ngIf="q.status !== 'Accepted'" class="btn btn-outline-success" (click)="updateStatus(q, 'Accepted')" title="Accept Quote">
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button *ngIf="q.status !== 'Rejected'" class="btn btn-outline-warning" (click)="updateStatus(q, 'Rejected')" title="Reject Quote">
                      <i class="bi bi-x-lg"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="promptDelete(q)" title="Delete Quote">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="quotations.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  No supplier quotations found matching your criteria.
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
                {{ isEditing ? 'Edit Quotation: ' + currentQuoteNumber : 'Add Supplier Quotation' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeFormModal()"></button>
            </div>
            <form [formGroup]="quotationForm" (ngSubmit)="saveQuotation()">
              <div class="modal-body py-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Quotation Number <span class="text-danger">*</span></label>
                    <input type="text" class="form-control font-monospace" formControlName="quotationNumber"
                           [class.is-invalid]="f['quotationNumber'].touched && f['quotationNumber'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['quotationNumber'].errors?.['required']">Quotation number is required.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Status <span class="text-danger">*</span></label>
                    <select class="form-select" formControlName="status">
                      <option value="Pending Review">Pending Review</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Select Supplier <span class="text-danger">*</span></label>
                    <select class="form-select" formControlName="supplierId"
                            [class.is-invalid]="f['supplierId'].touched && f['supplierId'].invalid">
                      <option value="">-- Choose Supplier --</option>
                      <option *ngFor="let s of suppliers" [value]="s.supplierId">
                        {{ s.supplierCode }} - {{ s.companyName }}
                      </option>
                    </select>
                    <div class="invalid-feedback" *ngIf="f['supplierId'].errors?.['required']">Supplier is required.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Target Purchase Requisition <span class="text-danger">*</span></label>
                    <select class="form-select" formControlName="requisitionId"
                            [class.is-invalid]="f['requisitionId'].touched && f['requisitionId'].invalid">
                      <option value="">-- Choose Requisition --</option>
                      <option *ngFor="let req of requisitions" [value]="req.requisitionId">
                        {{ req.requestNumber }} ({{ req.department }})
                      </option>
                    </select>
                    <div class="invalid-feedback" *ngIf="f['requisitionId'].errors?.['required']">Requisition is required.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Quotation Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" formControlName="quotationDate"
                           [class.is-invalid]="f['quotationDate'].touched && f['quotationDate'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['quotationDate'].errors?.['required']">Quotation date is required.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Validity Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" formControlName="validityDate"
                           [class.is-invalid]="f['validityDate'].touched && f['validityDate'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['validityDate'].errors?.['required']">Validity date is required.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Total Quoted Amount (₹) <span class="text-danger">*</span></label>
                    <input type="number" step="0.01" min="0.01" class="form-control font-monospace" formControlName="quotedAmount" placeholder="0.00"
                           [class.is-invalid]="f['quotedAmount'].touched && f['quotedAmount'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['quotedAmount'].errors?.['required']">Quoted amount is required.</div>
                    <div class="invalid-feedback" *ngIf="f['quotedAmount'].errors?.['min']">Quoted amount must be greater than zero.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Committed Delivery (Days) <span class="text-danger">*</span></label>
                    <input type="number" min="1" class="form-control" formControlName="deliveryDays" placeholder="e.g. 7"
                           [class.is-invalid]="f['deliveryDays'].touched && f['deliveryDays'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['deliveryDays'].errors?.['required']">Delivery days is required.</div>
                    <div class="invalid-feedback" *ngIf="f['deliveryDays'].errors?.['min']">Delivery days must be at least 1 day.</div>
                  </div>
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary" (click)="closeFormModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="quotationForm.invalid || isSaving">
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEditing ? 'Save Changes' : 'Create Quotation' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Compare Quotations Modal -->
      <div *ngIf="isCompareModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65);" role="dialog">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark-navy text-white">
              <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="bi bi-bar-chart-steps"></i> Compare Supplier Quotations
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="isCompareModalOpen = false"></button>
            </div>
            <div class="modal-body py-4">
              <!-- Requisition Selector -->
              <div class="row g-3 align-items-center mb-4 p-3 bg-light rounded border">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-dark">Select Purchase Requisition to Compare Bids:</label>
                  <select class="form-select" [(ngModel)]="compareRequisitionId" (change)="onCompareRequisitionChange()">
                    <option value="">-- Choose Requisition --</option>
                    <option *ngFor="let req of requisitions" [value]="req.requisitionId">
                      {{ req.requestNumber }} - {{ req.department }} (Required by: {{ req.requiredDate | date:'mediumDate' }})
                    </option>
                  </select>
                </div>
                <div class="col-md-6" *ngIf="comparisonData">
                  <div class="d-flex justify-content-between p-2 bg-white rounded border">
                    <div>
                      <div class="text-muted small">Department</div>
                      <div class="fw-semibold text-dark">{{ comparisonData.department }}</div>
                    </div>
                    <div>
                      <div class="text-muted small">Required By</div>
                      <div class="fw-semibold text-dark">{{ comparisonData.requiredDate | date:'mediumDate' }}</div>
                    </div>
                    <div>
                      <div class="text-muted small">Quotations Received</div>
                      <div class="fw-bold text-primary">{{ comparisonData.quotations ? comparisonData.quotations.length : 0 }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comparison Loading -->
              <div *ngIf="isComparing" class="text-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted small mt-2">Fetching comparative quotation data...</p>
              </div>

              <!-- Comparison Matrix -->
              <div *ngIf="!isComparing && comparisonData">
                <div *ngIf="comparisonData.quotations.length === 0" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  No supplier quotations have been submitted for requisition {{ comparisonData.requestNumber }} yet.
                </div>

                <div *ngIf="comparisonData.quotations.length > 0">
                  <div class="table-responsive border rounded">
                    <table class="table table-hover align-middle mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Rank / Highlights</th>
                          <th>Supplier</th>
                          <th>Quote #</th>
                          <th class="text-end">Quoted Price</th>
                          <th class="text-center">Delivery Time</th>
                          <th>Validity Date</th>
                          <th class="text-center">Status</th>
                          <th class="text-end">Decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let q of comparisonData.quotations; let i = index"
                            [class.table-success-subtle]="isLowestPrice(q.quotedAmount) && q.status !== 'Rejected'">
                          <td>
                            <div class="d-flex flex-wrap gap-1">
                              <span *ngIf="isLowestPrice(q.quotedAmount)" class="badge bg-success text-white">
                                <i class="bi bi-award-fill me-1"></i>Lowest Price
                              </span>
                              <span *ngIf="isFastestDelivery(q.deliveryDays)" class="badge bg-info text-dark">
                                <i class="bi bi-lightning-fill me-1"></i>Fastest
                              </span>
                              <span *ngIf="!isLowestPrice(q.quotedAmount) && !isFastestDelivery(q.deliveryDays)" class="badge bg-light text-muted border">
                                Option #{{ i + 1 }}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div class="fw-semibold text-dark">{{ q.supplierCompanyName }}</div>
                            <small class="text-muted font-monospace">{{ q.supplierCode }}</small>
                          </td>
                          <td>
                            <span class="font-monospace text-muted">{{ q.quotationNumber }}</span>
                          </td>
                          <td class="text-end font-monospace fw-bold fs-6"
                              [ngClass]="isLowestPrice(q.quotedAmount) ? 'text-success' : 'text-dark'">
                            ₹{{ q.quotedAmount | number:'1.2-2' }}
                          </td>
                          <td class="text-center">
                            <span class="badge" [ngClass]="isFastestDelivery(q.deliveryDays) ? 'bg-primary-subtle text-primary border' : 'bg-light text-dark border'">
                              <i class="bi bi-clock-history me-1"></i>{{ q.deliveryDays }} days
                            </span>
                          </td>
                          <td>
                            <small class="text-muted">{{ q.validityDate | date:'mediumDate' }}</small>
                          </td>
                          <td class="text-center">
                            <app-status-badge [status]="q.status"></app-status-badge>
                          </td>
                          <td class="text-end">
                            <button *ngIf="q.status !== 'Accepted'" class="btn btn-sm btn-success d-inline-flex align-items-center gap-1 shadow-sm"
                                    (click)="acceptFromComparison(q)">
                              <i class="bi bi-check-circle"></i> Accept
                            </button>
                            <span *ngIf="q.status === 'Accepted'" class="text-success small fw-bold">
                              <i class="bi bi-check-circle-fill me-1"></i>Selected
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" (click)="isCompareModalOpen = false">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen"
        [title]="'Delete Quotation'"
        [message]="deleteConfirmMessage"
        [confirmText]="'Delete Quotation'"
        [isDanger]="true"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteDialogOpen = false">
      </app-confirm-dialog>
    </div>
  `
})
export class QuotationListComponent implements OnInit {
  quotations: Quotation[] = [];
  suppliers: Supplier[] = [];
  requisitions: PurchaseRequisition[] = [];

  statusFilter = '';
  requisitionFilterId: string | number = '';
  isLoading = false;
  isSaving = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Form Modal
  isFormModalOpen = false;
  isEditing = false;
  currentQuoteId: number | null = null;
  currentQuoteNumber = '';
  quotationForm!: FormGroup;

  // Comparison Modal
  isCompareModalOpen = false;
  isComparing = false;
  compareRequisitionId: string | number = '';
  comparisonData: QuotationComparison | null = null;

  // Delete Dialog
  isDeleteDialogOpen = false;
  quotationToDelete: Quotation | null = null;

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService,
    private supplierService: SupplierService,
    private requisitionService: RequisitionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadQuotations();
    this.loadSuppliers();
    this.loadRequisitions();
  }

  get f() {
    return this.quotationForm.controls;
  }

  get deleteConfirmMessage(): string {
    const num = this.quotationToDelete?.quotationNumber || '';
    return 'Are you sure you want to delete quotation ' + num + '? This action cannot be undone.';
  }

  initForm(): void {
    this.quotationForm = this.fb.group({
      quotationNumber: ['', [Validators.required]],
      supplierId: ['', [Validators.required]],
      requisitionId: ['', [Validators.required]],
      quotationDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
      validityDate: ['', [Validators.required]],
      quotedAmount: ['', [Validators.required, Validators.min(0.01)]],
      deliveryDays: ['', [Validators.required, Validators.min(1)]],
      status: ['Pending Review', [Validators.required]]
    });
  }

  loadQuotations(): void {
    this.isLoading = true;
    if (this.requisitionFilterId) {
      this.quotationService.getQuotationsByRequisition(Number(this.requisitionFilterId)).subscribe({
        next: (data) => {
          if (this.statusFilter) {
            this.quotations = data.filter(q => q.status?.toLowerCase() === this.statusFilter.toLowerCase());
          } else {
            this.quotations = data;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load quotations.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.quotationService.getQuotations(this.statusFilter).subscribe({
        next: (data) => {
          this.quotations = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load quotations.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers('', 'ACTIVE').subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: () => {}
    });
  }

  loadRequisitions(): void {
    this.requisitionService.getRequisitions().subscribe({
      next: (data) => {
        this.requisitions = data;
      },
      error: () => {}
    });
  }

  resetFilters(): void {
    this.statusFilter = '';
    this.requisitionFilterId = '';
    this.loadQuotations();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentQuoteId = null;
    this.currentQuoteNumber = '';
    this.quotationForm.reset({
      quotationNumber: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: '',
      requisitionId: '',
      quotationDate: new Date().toISOString().substring(0, 10),
      validityDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      quotedAmount: '',
      deliveryDays: 7,
      status: 'Pending Review'
    });
    this.isFormModalOpen = true;
  }

  openEditModal(q: Quotation): void {
    this.isEditing = true;
    this.currentQuoteId = q.quotationId || null;
    this.currentQuoteNumber = q.quotationNumber;
    this.quotationForm.reset({
      quotationNumber: q.quotationNumber,
      supplierId: q.supplier?.supplierId || '',
      requisitionId: q.purchaseRequisition?.requisitionId || '',
      quotationDate: q.quotationDate,
      validityDate: q.validityDate,
      quotedAmount: q.quotedAmount,
      deliveryDays: q.deliveryDays,
      status: q.status
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.quotationForm.reset();
  }

  saveQuotation(): void {
    if (this.quotationForm.invalid) {
      this.quotationForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: QuotationRequest = {
      quotationNumber: this.quotationForm.value.quotationNumber,
      supplierId: Number(this.quotationForm.value.supplierId),
      requisitionId: Number(this.quotationForm.value.requisitionId),
      quotationDate: this.quotationForm.value.quotationDate,
      validityDate: this.quotationForm.value.validityDate,
      quotedAmount: Number(this.quotationForm.value.quotedAmount),
      deliveryDays: Number(this.quotationForm.value.deliveryDays),
      status: this.quotationForm.value.status
    };

    if (this.isEditing && this.currentQuoteId) {
      this.quotationService.updateQuotation(this.currentQuoteId, payload).subscribe({
        next: (updated) => {
          this.successMessage = `Quotation '${updated.quotationNumber}' updated successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadQuotations();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update quotation.';
          this.isSaving = false;
        }
      });
    } else {
      this.quotationService.createQuotation(payload).subscribe({
        next: (created) => {
          this.successMessage = `Quotation '${created.quotationNumber}' created successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadQuotations();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create quotation.';
          this.isSaving = false;
        }
      });
    }
  }

  updateStatus(q: Quotation, newStatus: string): void {
    if (!q.quotationId) return;
    this.quotationService.updateStatus(q.quotationId, newStatus).subscribe({
      next: (res) => {
        q.status = res.status;
        this.successMessage = `Quotation '${q.quotationNumber}' status updated to ${res.status}.`;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update quotation status.';
        this.cdr.detectChanges();
      }
    });
  }

  promptDelete(q: Quotation): void {
    this.quotationToDelete = q;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.quotationToDelete?.quotationId) return;
    const id = this.quotationToDelete.quotationId;
    const num = this.quotationToDelete.quotationNumber;
    this.isDeleteDialogOpen = false;

    this.quotationService.deleteQuotation(id).subscribe({
      next: () => {
        this.successMessage = `Quotation '${num}' deleted successfully.`;
        this.loadQuotations();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete quotation.';
        this.cdr.detectChanges();
      }
    });
  }

  // Quotation Comparison Modal Logic
  openCompareModal(): void {
    this.isCompareModalOpen = true;
    if (this.requisitions.length > 0 && !this.compareRequisitionId) {
      this.compareRequisitionId = this.requisitions[0].requisitionId || '';
      this.fetchComparisonData();
    }
  }

  onCompareRequisitionChange(): void {
    if (this.compareRequisitionId) {
      this.fetchComparisonData();
    } else {
      this.comparisonData = null;
    }
  }

  fetchComparisonData(): void {
    if (!this.compareRequisitionId) return;
    this.isComparing = true;
    this.quotationService.compareQuotations(Number(this.compareRequisitionId)).subscribe({
      next: (data) => {
        this.comparisonData = data;
        this.isComparing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to compare quotations.';
        this.isComparing = false;
        this.cdr.detectChanges();
      }
    });
  }

  isLowestPrice(amount: number): boolean {
    if (!this.comparisonData || !this.comparisonData.quotations.length) return false;
    const min = Math.min(...this.comparisonData.quotations.map(q => q.quotedAmount));
    return amount === min;
  }

  isFastestDelivery(days: number): boolean {
    if (!this.comparisonData || !this.comparisonData.quotations.length) return false;
    const minDays = Math.min(...this.comparisonData.quotations.map(q => q.deliveryDays));
    return days === minDays;
  }

  acceptFromComparison(q: QuotationItemDTO): void {
    this.quotationService.updateStatus(q.quotationId, 'Accepted').subscribe({
      next: () => {
        this.successMessage = `Quotation '${q.quotationNumber}' by ${q.supplierCompanyName} accepted.`;
        this.fetchComparisonData();
        this.loadQuotations();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to accept quotation.';
        this.cdr.detectChanges();
      }
    });
  }

  isValidityExpired(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < new Date().getTime();
  }
}
