import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequisitionService } from '../../core/services/requisition.service';
import { ProductService } from '../../core/services/product.service';
import { PurchaseRequisition, RequisitionItem } from '../../core/models/requisition.model';
import { Product } from '../../core/models/product.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AlertBannerComponent } from '../../shared/components/alert-banner/alert-banner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-requisition-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, AlertBannerComponent, ConfirmDialogComponent],
  template: `
    <div class="requisitions-container">
      <!-- Title & Action Bar -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h2 class="h3 fw-bold text-dark mb-1">
            <i class="bi bi-file-earmark-text text-primary me-2"></i>Purchase Requisitions
          </h2>
          <p class="text-muted small mb-0">Create, review, and track departmental purchase requests and line items.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" (click)="openAddModal()">
          <i class="bi bi-plus-circle-fill"></i> New Requisition
        </button>
      </div>

      <!-- Alerts -->
      <app-alert-banner [message]="successMessage" type="success" (dismiss)="successMessage = null"></app-alert-banner>
      <app-alert-banner [message]="errorMessage" type="error" (dismiss)="errorMessage = null"></app-alert-banner>

      <!-- Search & Filters -->
      <div class="card mb-4 shadow-sm border-0 bg-light">
        <div class="card-body py-3">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-5">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0" placeholder="Search by request #, department, requester..."
                       [(ngModel)]="searchKeyword" (keyup.enter)="loadRequisitions()" />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <select class="form-select" [(ngModel)]="statusFilter" (change)="loadRequisitions()">
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Closed">Closed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div class="col-12 col-sm-6 col-md-4 d-flex gap-2">
              <button class="btn btn-secondary flex-grow-1" (click)="loadRequisitions()">Apply Filter</button>
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
        <p class="text-muted small mt-2">Loading requisitions...</p>
      </div>

      <!-- Requisitions Table -->
      <div *ngIf="!isLoading" class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" style="width: 140px;">Request #</th>
                <th scope="col">Department & Requester</th>
                <th scope="col">Request Date</th>
                <th scope="col">Required Date</th>
                <th scope="col" class="text-center">Items</th>
                <th scope="col" class="text-end">Est. Total</th>
                <th scope="col" class="text-center">Status</th>
                <th scope="col" class="text-end" style="width: 180px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of requisitions">
                <td>
                  <span class="badge bg-primary-subtle text-primary border font-monospace fw-bold">{{ r.requestNumber }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ r.department }}</div>
                  <small class="text-muted"><i class="bi bi-person me-1"></i>{{ r.requestedBy }}</small>
                </td>
                <td>{{ r.requestDate | date:'mediumDate' }}</td>
                <td>
                  <span [ngClass]="isDueSoon(r.requiredDate) ? 'text-danger fw-semibold' : 'text-dark'">
                    {{ r.requiredDate | date:'mediumDate' }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge bg-secondary-subtle text-dark border">
                    {{ r.items ? r.items.length : 0 }} items
                  </span>
                </td>
                <td class="text-end font-monospace fw-bold text-dark">
                  ₹{{ calculateTotal(r) | number:'1.2-2' }}
                </td>
                <td class="text-center">
                  <app-status-badge [status]="r.status"></app-status-badge>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" (click)="openViewModal(r)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary" (click)="openEditModal(r)" title="Edit Requisition" [disabled]="r.status === 'Closed'">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <!-- Quick Status Change dropdown -->
                    <div class="btn-group btn-group-sm" role="group">
                      <button type="button" class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" title="Change Status">
                        <i class="bi bi-arrow-repeat"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        <li><h6 class="dropdown-header">Update Status</h6></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" (click)="updateStatus(r, 'Open')">Open</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" (click)="updateStatus(r, 'Under Review')">Under Review</a></li>
                        <li><a class="dropdown-item" href="javascript:void(0)" (click)="updateStatus(r, 'Approved')">Approved</a></li>
                        <li><a class="dropdown-item text-danger" href="javascript:void(0)" (click)="updateStatus(r, 'Rejected')">Rejected</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-secondary" href="javascript:void(0)" (click)="updateStatus(r, 'Closed')">Close Requisition</a></li>
                      </ul>
                    </div>
                    <button class="btn btn-outline-danger" (click)="promptDelete(r)" title="Delete" [disabled]="r.status === 'Closed'">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="requisitions.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  No purchase requisitions found matching your filter criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Requisition Modal -->
      <div *ngIf="isFormModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65);" role="dialog">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark-navy text-white">
              <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="bi" [ngClass]="isEditing ? 'bi-pencil-square' : 'bi-file-earmark-plus'"></i>
                {{ isEditing ? 'Edit Requisition: ' + currentRequestNumber : 'Create Purchase Requisition' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeFormModal()"></button>
            </div>
            <form [formGroup]="requisitionForm" (ngSubmit)="saveRequisition()">
              <div class="modal-body py-4">
                <!-- Header Details -->
                <div class="row g-3 mb-4">
                  <div class="col-md-3">
                    <label class="form-label small fw-semibold">Request Number <span class="text-danger">*</span></label>
                    <input type="text" class="form-control font-monospace" formControlName="requestNumber"
                           [class.is-invalid]="f['requestNumber'].touched && f['requestNumber'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['requestNumber'].errors?.['required']">Request number is required.</div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small fw-semibold">Department <span class="text-danger">*</span></label>
                    <select class="form-select" formControlName="department"
                            [class.is-invalid]="f['department'].touched && f['department'].invalid">
                      <option value="">Select Department</option>
                      <option value="Procurement">Procurement</option>
                      <option value="IT & Systems">IT & Systems</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance & Accounts">Finance & Accounts</option>
                      <option value="Facilities & Maintenance">Facilities & Maintenance</option>
                      <option value="Engineering & R&D">Engineering & R&D</option>
                    </select>
                    <div class="invalid-feedback" *ngIf="f['department'].errors?.['required']">Department is required.</div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small fw-semibold">Requested By <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" formControlName="requestedBy" placeholder="Employee Name"
                           [class.is-invalid]="f['requestedBy'].touched && f['requestedBy'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['requestedBy'].errors?.['required']">Requested by is required.</div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small fw-semibold">Status <span class="text-danger">*</span></label>
                    <select class="form-select" formControlName="status">
                      <option value="Open">Open</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div class="col-md-3">
                    <label class="form-label small fw-semibold">Request Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" formControlName="requestDate"
                           [class.is-invalid]="f['requestDate'].touched && f['requestDate'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['requestDate'].errors?.['required']">Request date is required.</div>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small fw-semibold">Required By Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" formControlName="requiredDate"
                           [class.is-invalid]="f['requiredDate'].touched && f['requiredDate'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['requiredDate'].errors?.['required']">Required date is required.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Remarks / Business Justification</label>
                    <input type="text" class="form-control" formControlName="remarks" placeholder="Purpose or context of purchase" />
                  </div>
                </div>

                <!-- Line Items Section -->
                <div class="card border">
                  <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                    <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-list-check me-2"></i>Requisition Line Items</h6>
                    <button type="button" class="btn btn-sm btn-outline-primary" (click)="addItemLine()">
                      <i class="bi bi-plus me-1"></i> Add Item Line
                    </button>
                  </div>
                  <div class="card-body p-0">
                    <div class="table-responsive">
                      <table class="table align-middle mb-0">
                        <thead class="table-light small">
                          <tr>
                            <th style="width: 250px;">Select Catalog Product</th>
                            <th style="width: 140px;">SKU</th>
                            <th>Product / Specification Name <span class="text-danger">*</span></th>
                            <th style="width: 110px;">Qty <span class="text-danger">*</span></th>
                            <th style="width: 140px;">Est. Unit Price (₹) <span class="text-danger">*</span></th>
                            <th style="width: 130px;" class="text-end">Subtotal (₹)</th>
                            <th style="width: 50px;"></th>
                          </tr>
                        </thead>
                        <tbody formArrayName="items">
                          <tr *ngFor="let itemGroup of itemsFormArray.controls; let i = index" [formGroupName]="i">
                            <td>
                              <select class="form-select form-select-sm" (change)="onProductSelect(i, $event)">
                                <option value="">-- Choose Product --</option>
                                <option *ngFor="let prod of activeProducts" [value]="prod.productId">
                                  {{ prod.sku }} - {{ prod.productName }}
                                </option>
                              </select>
                            </td>
                            <td>
                              <input type="text" class="form-control form-control-sm font-monospace" formControlName="productSku" placeholder="SKU" readonly />
                            </td>
                            <td>
                              <input type="text" class="form-control form-control-sm" formControlName="productName" placeholder="Product name"
                                     [class.is-invalid]="itemGroup.get('productName')?.touched && itemGroup.get('productName')?.invalid" />
                            </td>
                            <td>
                              <input type="number" min="1" class="form-control form-control-sm" formControlName="quantity"
                                     [class.is-invalid]="itemGroup.get('quantity')?.touched && itemGroup.get('quantity')?.invalid" />
                            </td>
                            <td>
                              <input type="number" step="0.01" min="0" class="form-control form-control-sm" formControlName="estimatedPrice"
                                     [class.is-invalid]="itemGroup.get('estimatedPrice')?.touched && itemGroup.get('estimatedPrice')?.invalid" />
                            </td>
                            <td class="text-end font-monospace fw-semibold">
                              ₹{{ getItemSubtotal(itemGroup) | number:'1.2-2' }}
                            </td>
                            <td class="text-center">
                              <button type="button" class="btn btn-sm btn-link text-danger p-0" (click)="removeItemLine(i)" [disabled]="itemsFormArray.length <= 1">
                                <i class="bi bi-x-circle fs-5"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot class="table-light">
                          <tr>
                            <td colspan="5" class="text-end fw-bold">Grand Total Estimated:</td>
                            <td class="text-end font-monospace fw-bold fs-6 text-primary">₹{{ formGrandTotal | number:'1.2-2' }}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary" (click)="closeFormModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="requisitionForm.invalid || isSaving">
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEditing ? 'Save Changes' : 'Create Requisition' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- View Details Modal -->
      <div *ngIf="isViewModalOpen && selectedRequisition" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65);" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark-navy text-white">
              <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="bi bi-file-earmark-text"></i> Requisition Details: {{ selectedRequisition.requestNumber }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="isViewModalOpen = false"></button>
            </div>
            <div class="modal-body py-4">
              <div class="row g-3 mb-4 p-3 bg-light rounded border">
                <div class="col-sm-6 col-md-3">
                  <div class="text-muted small">Department</div>
                  <div class="fw-bold text-dark">{{ selectedRequisition.department }}</div>
                </div>
                <div class="col-sm-6 col-md-3">
                  <div class="text-muted small">Requested By</div>
                  <div class="fw-bold text-dark">{{ selectedRequisition.requestedBy }}</div>
                </div>
                <div class="col-sm-6 col-md-3">
                  <div class="text-muted small">Request Date</div>
                  <div class="fw-bold text-dark">{{ selectedRequisition.requestDate | date:'mediumDate' }}</div>
                </div>
                <div class="col-sm-6 col-md-3">
                  <div class="text-muted small">Required Date</div>
                  <div class="fw-bold text-dark">{{ selectedRequisition.requiredDate | date:'mediumDate' }}</div>
                </div>
                <div class="col-12" *ngIf="selectedRequisition.remarks">
                  <div class="text-muted small">Remarks</div>
                  <div class="text-dark">{{ selectedRequisition.remarks }}</div>
                </div>
                <div class="col-12 mt-2">
                  <span class="text-muted small me-2">Current Status:</span>
                  <app-status-badge [status]="selectedRequisition.status"></app-status-badge>
                </div>
              </div>

              <h6 class="fw-bold mb-3 text-dark"><i class="bi bi-card-checklist me-2"></i>Requested Line Items</h6>
              <div class="table-responsive border rounded">
                <table class="table table-sm align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th class="text-center">Quantity</th>
                      <th class="text-end">Est. Unit Price</th>
                      <th class="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let it of selectedRequisition.items; let idx = index">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="font-monospace text-muted">{{ it.productSku || '—' }}</span></td>
                      <td class="fw-semibold text-dark">{{ it.productName }}</td>
                      <td class="text-center">{{ it.quantity }}</td>
                      <td class="text-end font-monospace">₹{{ it.estimatedPrice | number:'1.2-2' }}</td>
                      <td class="text-end font-monospace fw-bold">₹{{ (it.quantity * it.estimatedPrice) | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light">
                    <tr>
                      <td colspan="5" class="text-end fw-bold">Total Estimated Value:</td>
                      <td class="text-end font-monospace fw-bold text-primary">₹{{ calculateTotal(selectedRequisition) | number:'1.2-2' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary" (click)="isViewModalOpen = false">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen"
        [title]="'Delete Purchase Requisition'"
        [message]="deleteConfirmMessage"
        [confirmText]="'Delete Requisition'"
        [isDanger]="true"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteDialogOpen = false">
      </app-confirm-dialog>
    </div>
  `
})
export class RequisitionListComponent implements OnInit {
  requisitions: PurchaseRequisition[] = [];
  activeProducts: Product[] = [];
  searchKeyword = '';
  statusFilter = '';
  isLoading = false;
  isSaving = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Form Modal
  isFormModalOpen = false;
  isEditing = false;
  currentRequisitionId: number | null = null;
  currentRequestNumber = '';
  requisitionForm!: FormGroup;

  // View Modal
  isViewModalOpen = false;
  selectedRequisition: PurchaseRequisition | null = null;

  // Delete Dialog
  isDeleteDialogOpen = false;
  requisitionToDelete: PurchaseRequisition | null = null;

  constructor(
    private fb: FormBuilder,
    private requisitionService: RequisitionService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRequisitions();
    this.loadActiveProducts();
  }

  get f() {
    return this.requisitionForm.controls;
  }

  get itemsFormArray(): FormArray {
    return this.requisitionForm.get('items') as FormArray;
  }

  get formGrandTotal(): number {
    return this.itemsFormArray.controls.reduce((sum, ctrl) => {
      const q = ctrl.get('quantity')?.value || 0;
      const p = ctrl.get('estimatedPrice')?.value || 0;
      return sum + (q * p);
    }, 0);
  }

  get deleteConfirmMessage(): string {
    const num = this.requisitionToDelete?.requestNumber || '';
    return 'Are you sure you want to delete requisition ' + num + '? This action cannot be undone.';
  }

  initForm(): void {
    this.requisitionForm = this.fb.group({
      requestNumber: ['', [Validators.required]],
      requestDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
      department: ['', [Validators.required]],
      requestedBy: ['', [Validators.required]],
      requiredDate: ['', [Validators.required]],
      status: ['Open', [Validators.required]],
      remarks: [''],
      items: this.fb.array([])
    });
  }

  createItemLineGroup(item?: RequisitionItem): FormGroup {
    return this.fb.group({
      productId: [item?.productId || null],
      productSku: [item?.productSku || ''],
      productName: [item?.productName || '', [Validators.required]],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      estimatedPrice: [item?.estimatedPrice || 0, [Validators.required, Validators.min(0)]]
    });
  }

  addItemLine(item?: RequisitionItem): void {
    this.itemsFormArray.push(this.createItemLineGroup(item));
  }

  removeItemLine(index: number): void {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
  }

  onProductSelect(index: number, event: any): void {
    const productId = Number(event.target.value);
    const prod = this.activeProducts.find(p => p.productId === productId);
    const lineGroup = this.itemsFormArray.at(index);
    if (prod && lineGroup) {
      lineGroup.patchValue({
        productId: prod.productId,
        productSku: prod.sku,
        productName: prod.productName,
        estimatedPrice: prod.standardPrice
      });
    }
  }

  getItemSubtotal(ctrl: any): number {
    const q = ctrl.get('quantity')?.value || 0;
    const p = ctrl.get('estimatedPrice')?.value || 0;
    return q * p;
  }

  loadRequisitions(): void {
    this.isLoading = true;
    this.requisitionService.getRequisitions(this.searchKeyword, this.statusFilter).subscribe({
      next: (data) => {
        this.requisitions = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load requisitions.';
        this.isLoading = false;
      }
    });
  }

  loadActiveProducts(): void {
    this.productService.getProducts('', true).subscribe({
      next: (prods) => {
        this.activeProducts = prods;
      },
      error: () => {}
    });
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.statusFilter = '';
    this.loadRequisitions();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentRequisitionId = null;
    this.currentRequestNumber = '';
    this.requisitionForm.reset({
      requestNumber: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      requestDate: new Date().toISOString().substring(0, 10),
      department: '',
      requestedBy: '',
      requiredDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
      status: 'Open',
      remarks: ''
    });
    this.itemsFormArray.clear();
    this.addItemLine();
    this.isFormModalOpen = true;
  }

  openEditModal(r: PurchaseRequisition): void {
    this.isEditing = true;
    this.currentRequisitionId = r.requisitionId || null;
    this.currentRequestNumber = r.requestNumber;
    this.requisitionForm.reset({
      requestNumber: r.requestNumber,
      requestDate: r.requestDate,
      department: r.department,
      requestedBy: r.requestedBy,
      requiredDate: r.requiredDate,
      status: r.status,
      remarks: r.remarks || ''
    });
    this.itemsFormArray.clear();
    if (r.items && r.items.length > 0) {
      r.items.forEach(it => this.addItemLine(it));
    } else {
      this.addItemLine();
    }
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.requisitionForm.reset();
    this.itemsFormArray.clear();
  }

  saveRequisition(): void {
    if (this.requisitionForm.invalid) {
      this.requisitionForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: PurchaseRequisition = this.requisitionForm.value;

    if (this.isEditing && this.currentRequisitionId) {
      this.requisitionService.updateRequisition(this.currentRequisitionId, payload).subscribe({
        next: (updated) => {
          this.successMessage = `Requisition '${updated.requestNumber}' updated successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadRequisitions();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update requisition.';
          this.isSaving = false;
        }
      });
    } else {
      this.requisitionService.createRequisition(payload).subscribe({
        next: (created) => {
          this.successMessage = `Requisition '${created.requestNumber}' created successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadRequisitions();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create requisition.';
          this.isSaving = false;
        }
      });
    }
  }

  openViewModal(r: PurchaseRequisition): void {
    this.selectedRequisition = r;
    this.isViewModalOpen = true;
  }

  updateStatus(r: PurchaseRequisition, newStatus: string): void {
    if (!r.requisitionId) return;
    this.requisitionService.updateStatus(r.requisitionId, newStatus).subscribe({
      next: (updated) => {
        r.status = updated.status;
        this.successMessage = `Status for '${r.requestNumber}' updated to ${updated.status}.`;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update status.';
      }
    });
  }

  promptDelete(r: PurchaseRequisition): void {
    this.requisitionToDelete = r;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.requisitionToDelete?.requisitionId) return;
    const id = this.requisitionToDelete.requisitionId;
    const num = this.requisitionToDelete.requestNumber;
    this.isDeleteDialogOpen = false;

    this.requisitionService.deleteRequisition(id).subscribe({
      next: () => {
        this.successMessage = `Requisition '${num}' was deleted successfully.`;
        this.loadRequisitions();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete requisition.';
      }
    });
  }

  calculateTotal(r: PurchaseRequisition): number {
    if (!r.items) return 0;
    return r.items.reduce((acc, it) => acc + (it.quantity * it.estimatedPrice), 0);
  }

  isDueSoon(dateStr: string): boolean {
    if (!dateStr) return false;
    const due = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = (due - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 3;
  }
}
