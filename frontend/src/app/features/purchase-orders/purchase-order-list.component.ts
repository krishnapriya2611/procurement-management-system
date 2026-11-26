import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { SupplierService } from '../../core/services/supplier.service';
import { RequisitionService } from '../../core/services/requisition.service';
import { QuotationService } from '../../core/services/quotation.service';
import { PurchaseOrder, PurchaseOrderRequest } from '../../core/models/purchase-order.model';
import { Supplier } from '../../core/models/supplier.model';
import { PurchaseRequisition } from '../../core/models/requisition.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AlertBannerComponent } from '../../shared/components/alert-banner/alert-banner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, AlertBannerComponent, ConfirmDialogComponent],
  template: `
    <div class="purchase-orders-container">
      <!-- Title & Action Bar -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h2 class="h3 fw-bold text-dark mb-1">
            <i class="bi bi-cart-check text-primary me-2"></i>Purchase Orders
          </h2>
          <p class="text-muted small mb-0">Generate legally binding orders, track fulfillment lead times, and monitor outstanding liabilities.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" (click)="openGenerateModal()">
          <i class="bi bi-plus-circle-fill"></i> Generate Purchase Order
        </button>
      </div>

      <!-- Alerts -->
      <app-alert-banner [message]="successMessage" type="success" (dismiss)="successMessage = null"></app-alert-banner>
      <app-alert-banner [message]="errorMessage" type="error" (dismiss)="errorMessage = null"></app-alert-banner>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm p-3 bg-white">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle bg-primary-subtle text-primary p-3 fs-4">
                <i class="bi bi-file-earmark-ruled"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold">Total Orders</div>
                <div class="fs-4 fw-bold text-dark">{{ orders.length }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm p-3 bg-white">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle bg-warning-subtle text-warning-emphasis p-3 fs-4">
                <i class="bi bi-clock-history"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold">Open Orders</div>
                <div class="fs-4 fw-bold text-dark">{{ openOrdersCount }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm p-3 bg-white">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle bg-success-subtle text-success p-3 fs-4">
                <i class="bi bi-check2-circle"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold">Delivered Orders</div>
                <div class="fs-4 fw-bold text-dark">{{ deliveredOrdersCount }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm p-3 bg-white">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle bg-info-subtle text-info p-3 fs-4">
                <i class="bi bi-cash-stack"></i>
              </div>
              <div>
                <div class="text-muted small fw-semibold">Outstanding Value</div>
                <div class="fs-5 fw-bold text-dark font-monospace">₹{{ outstandingValue | number:'1.2-2' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4 shadow-sm border-0 bg-light">
        <div class="card-body py-3">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-4">
              <label class="form-label small text-muted mb-1">Filter by Status</label>
              <select class="form-select" [(ngModel)]="statusFilter" (change)="loadPurchaseOrders()">
                <option value="">All PO Statuses</option>
                <option value="Open">Open</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div class="col-12 col-md-5">
              <label class="form-label small text-muted mb-1">Filter by Supplier</label>
              <select class="form-select" [(ngModel)]="supplierFilterId" (change)="loadPurchaseOrders()">
                <option value="">All Suppliers</option>
                <option *ngFor="let s of suppliers" [value]="s.supplierId">
                  {{ s.supplierCode }} - {{ s.companyName }}
                </option>
              </select>
            </div>
            <div class="col-12 col-md-3 d-flex align-items-end gap-2">
              <button class="btn btn-secondary flex-grow-1" (click)="loadPurchaseOrders()">Apply</button>
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
        <p class="text-muted small mt-2">Loading purchase orders...</p>
      </div>

      <!-- Purchase Orders Table -->
      <div *ngIf="!isLoading" class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" style="width: 140px;">PO #</th>
                <th scope="col">Supplier</th>
                <th scope="col">Requisition</th>
                <th scope="col">Order Date</th>
                <th scope="col">Expected Delivery</th>
                <th scope="col" class="text-end">Total Amount</th>
                <th scope="col" class="text-center">Status</th>
                <th scope="col" class="text-end" style="width: 200px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let po of orders">
                <td>
                  <span class="badge bg-primary-subtle text-primary border font-monospace fw-bold">{{ po.poNumber }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ po.supplier?.companyName }}</div>
                  <small class="text-muted font-monospace">{{ po.supplier?.supplierCode }}</small>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ po.purchaseRequisition?.requestNumber }}</div>
                  <small class="text-muted">{{ po.purchaseRequisition?.department }}</small>
                </td>
                <td>{{ po.orderDate | date:'mediumDate' }}</td>
                <td>
                  <div [ngClass]="getDeliveryUrgencyClass(po)">
                    <i class="bi me-1" [ngClass]="getDeliveryUrgencyIcon(po)"></i>
                    {{ po.expectedDeliveryDate | date:'mediumDate' }}
                  </div>
                  <small *ngIf="isOverdue(po)" class="badge bg-danger-subtle text-danger border">Overdue</small>
                </td>
                <td class="text-end font-monospace fw-bold text-dark fs-6">
                  ₹{{ po.totalAmount | number:'1.2-2' }}
                </td>
                <td class="text-center">
                  <app-status-badge [status]="po.status"></app-status-badge>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" (click)="openViewModal(po)" title="View PO Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-primary" (click)="openEditModal(po)" title="Edit Order" [disabled]="po.status === 'Delivered'">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <!-- Quick Status Updates -->
                    <button *ngIf="po.status === 'Open'" class="btn btn-outline-success" (click)="updateStatus(po, 'Delivered')" title="Mark as Delivered">
                      <i class="bi bi-check-circle"></i>
                    </button>
                    <button *ngIf="po.status === 'Open'" class="btn btn-outline-warning" (click)="updateStatus(po, 'Cancelled')" title="Cancel Order">
                      <i class="bi bi-slash-circle"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="promptDelete(po)" title="Delete Order">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="orders.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  No purchase orders found matching your filter criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Generate / Edit PO Modal -->
      <div *ngIf="isFormModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65);" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark-navy text-white">
              <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="bi" [ngClass]="isEditing ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
                {{ isEditing ? 'Edit Purchase Order: ' + currentPoNumber : 'Generate Purchase Order' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeFormModal()"></button>
            </div>
            <form [formGroup]="poForm" (ngSubmit)="savePurchaseOrder()">
              <div class="modal-body py-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">PO Number <span class="text-danger">*</span></label>
                    <input type="text" class="form-control font-monospace" formControlName="poNumber"
                           [class.is-invalid]="f['poNumber'].touched && f['poNumber'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['poNumber'].errors?.['required']">PO number is required.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Status <span class="text-danger">*</span></label>
                    <select class="form-select" formControlName="status">
                      <option value="Open">Open</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
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
                    <select class="form-select" formControlName="requisitionId" (change)="onRequisitionSelect($event)"
                            [class.is-invalid]="f['requisitionId'].touched && f['requisitionId'].invalid">
                      <option value="">-- Choose Requisition --</option>
                      <option *ngFor="let req of requisitions" [value]="req.requisitionId">
                        {{ req.requestNumber }} - {{ req.department }}
                      </option>
                    </select>
                    <div class="invalid-feedback" *ngIf="f['requisitionId'].errors?.['required']">Requisition is required.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Order Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" formControlName="orderDate"
                           [class.is-invalid]="f['orderDate'].touched && f['orderDate'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['orderDate'].errors?.['required']">Order date is required.</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Expected Delivery Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" formControlName="expectedDeliveryDate"
                           [class.is-invalid]="f['expectedDeliveryDate'].touched && f['expectedDeliveryDate'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['expectedDeliveryDate'].errors?.['required']">Expected delivery date is required.</div>
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold">Total Order Amount (₹) <span class="text-danger">*</span></label>
                    <input type="number" step="0.01" min="0" class="form-control font-monospace fs-5" formControlName="totalAmount" placeholder="0.00"
                           [class.is-invalid]="f['totalAmount'].touched && f['totalAmount'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['totalAmount'].errors?.['required']">Total amount is required.</div>
                    <div class="invalid-feedback" *ngIf="f['totalAmount'].errors?.['min']">Amount cannot be negative.</div>
                    <small class="text-muted">Total value agreed with vendor. Auto-calculated if an accepted quote or requisition items exist.</small>
                  </div>
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary" (click)="closeFormModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="poForm.invalid || isSaving">
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEditing ? 'Save Changes' : 'Generate Order' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- View Details Modal -->
      <div *ngIf="isViewModalOpen && selectedPo" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65);" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark-navy text-white">
              <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="bi bi-cart-check"></i> Purchase Order Details: {{ selectedPo.poNumber }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="isViewModalOpen = false"></button>
            </div>
            <div class="modal-body py-4">
              <div class="row g-3 mb-4 p-3 bg-light rounded border">
                <div class="col-sm-6 col-md-4">
                  <div class="text-muted small">Supplier</div>
                  <div class="fw-bold text-dark">{{ selectedPo.supplier?.companyName }}</div>
                  <div class="small text-muted font-monospace">{{ selectedPo.supplier?.supplierCode }}</div>
                </div>
                <div class="col-sm-6 col-md-4">
                  <div class="text-muted small">Requisition</div>
                  <div class="fw-bold text-dark">{{ selectedPo.purchaseRequisition?.requestNumber }}</div>
                  <div class="small text-muted">{{ selectedPo.purchaseRequisition?.department }}</div>
                </div>
                <div class="col-sm-6 col-md-4">
                  <div class="text-muted small">Status</div>
                  <app-status-badge [status]="selectedPo.status"></app-status-badge>
                </div>
                <div class="col-sm-6 col-md-4">
                  <div class="text-muted small">Order Date</div>
                  <div class="fw-bold text-dark">{{ selectedPo.orderDate | date:'mediumDate' }}</div>
                </div>
                <div class="col-sm-6 col-md-4">
                  <div class="text-muted small">Expected Delivery Date</div>
                  <div class="fw-bold" [ngClass]="getDeliveryUrgencyClass(selectedPo)">
                    {{ selectedPo.expectedDeliveryDate | date:'mediumDate' }}
                  </div>
                </div>
                <div class="col-sm-6 col-md-4">
                  <div class="text-muted small">Total Committed Amount</div>
                  <div class="fs-5 fw-bold text-primary font-monospace">₹{{ selectedPo.totalAmount | number:'1.2-2' }}</div>
                </div>
              </div>

              <!-- Supplier Contact Card -->
              <div class="card border mb-3">
                <div class="card-header bg-light py-2">
                  <h6 class="mb-0 fw-semibold text-dark"><i class="bi bi-building me-2"></i>Vendor Fulfillment Details</h6>
                </div>
                <div class="card-body py-2">
                  <div class="row">
                    <div class="col-md-4">
                      <span class="text-muted small">Contact Person:</span>
                      <div class="fw-semibold">{{ selectedPo.supplier?.contactPerson || 'N/A' }}</div>
                    </div>
                    <div class="col-md-4">
                      <span class="text-muted small">Email:</span>
                      <div>{{ selectedPo.supplier?.email || 'N/A' }}</div>
                    </div>
                    <div class="col-md-4">
                      <span class="text-muted small">Phone:</span>
                      <div>{{ selectedPo.supplier?.phone || 'N/A' }}</div>
                    </div>
                  </div>
                </div>
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
        [title]="'Delete Purchase Order'"
        [message]="deleteConfirmMessage"
        [confirmText]="'Delete Order'"
        [isDanger]="true"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteDialogOpen = false">
      </app-confirm-dialog>
    </div>
  `
})
export class PurchaseOrderListComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  suppliers: Supplier[] = [];
  requisitions: PurchaseRequisition[] = [];

  statusFilter = '';
  supplierFilterId: string | number = '';
  isLoading = false;
  isSaving = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Form Modal
  isFormModalOpen = false;
  isEditing = false;
  currentPoId: number | null = null;
  currentPoNumber = '';
  poForm!: FormGroup;

  // View Details Modal
  isViewModalOpen = false;
  selectedPo: PurchaseOrder | null = null;

  // Delete Dialog
  isDeleteDialogOpen = false;
  poToDelete: PurchaseOrder | null = null;

  constructor(
    private fb: FormBuilder,
    private poService: PurchaseOrderService,
    private supplierService: SupplierService,
    private requisitionService: RequisitionService,
    private quotationService: QuotationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPurchaseOrders();
    this.loadSuppliers();
    this.loadRequisitions();
  }

  get f() {
    return this.poForm.controls;
  }

  get openOrdersCount(): number {
    return this.orders.filter(o => o.status === 'Open').length;
  }

  get deliveredOrdersCount(): number {
    return this.orders.filter(o => o.status === 'Delivered').length;
  }

  get outstandingValue(): number {
    return this.orders
      .filter(o => o.status === 'Open')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  get deleteConfirmMessage(): string {
    const num = this.poToDelete?.poNumber || '';
    return 'Are you sure you want to delete purchase order ' + num + '? This action cannot be undone.';
  }

  initForm(): void {
    this.poForm = this.fb.group({
      poNumber: ['', [Validators.required]],
      supplierId: ['', [Validators.required]],
      requisitionId: ['', [Validators.required]],
      orderDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
      expectedDeliveryDate: ['', [Validators.required]],
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      status: ['Open', [Validators.required]]
    });
  }

  loadPurchaseOrders(): void {
    this.isLoading = true;
    if (this.supplierFilterId) {
      this.poService.getPurchaseOrdersBySupplier(Number(this.supplierFilterId)).subscribe({
        next: (data) => {
          if (this.statusFilter) {
            this.orders = data.filter(o => o.status?.toLowerCase() === this.statusFilter.toLowerCase());
          } else {
            this.orders = data;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load purchase orders.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.poService.getPurchaseOrders(this.statusFilter).subscribe({
        next: (data) => {
          this.orders = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load purchase orders.';
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
    this.supplierFilterId = '';
    this.loadPurchaseOrders();
  }

  openGenerateModal(): void {
    this.isEditing = false;
    this.currentPoId = null;
    this.currentPoNumber = '';
    this.poForm.reset({
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: '',
      requisitionId: '',
      orderDate: new Date().toISOString().substring(0, 10),
      expectedDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      totalAmount: '',
      status: 'Open'
    });
    this.isFormModalOpen = true;
  }

  openEditModal(po: PurchaseOrder): void {
    this.isEditing = true;
    this.currentPoId = po.purchaseOrderId || null;
    this.currentPoNumber = po.poNumber;
    this.poForm.reset({
      poNumber: po.poNumber,
      supplierId: po.supplier?.supplierId || '',
      requisitionId: po.purchaseRequisition?.requisitionId || '',
      orderDate: po.orderDate,
      expectedDeliveryDate: po.expectedDeliveryDate,
      totalAmount: po.totalAmount,
      status: po.status
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.poForm.reset();
  }

  onRequisitionSelect(event: any): void {
    const reqId = Number(event.target.value);
    if (!reqId) return;

    // Check if an accepted quotation exists for this requisition to auto-fill supplier & amount
    this.quotationService.getQuotationsByRequisition(reqId).subscribe({
      next: (quotes) => {
        const accepted = quotes.find(q => q.status === 'Accepted');
        if (accepted) {
          this.poForm.patchValue({
            supplierId: accepted.supplier?.supplierId,
            totalAmount: accepted.quotedAmount
          });
          if (accepted.deliveryDays) {
            const deliveryDate = new Date(Date.now() + accepted.deliveryDays * 86400000).toISOString().substring(0, 10);
            this.poForm.patchValue({ expectedDeliveryDate: deliveryDate });
          }
        } else {
          // If no accepted quote, compute estimated total from requisition items
          const req = this.requisitions.find(r => r.requisitionId === reqId);
          if (req && req.items && req.items.length > 0) {
            const estimatedTotal = req.items.reduce((sum, it) => sum + (it.quantity * it.estimatedPrice), 0);
            this.poForm.patchValue({ totalAmount: estimatedTotal });
          }
        }
      },
      error: () => {}
    });
  }

  savePurchaseOrder(): void {
    if (this.poForm.invalid) {
      this.poForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: PurchaseOrderRequest = {
      poNumber: this.poForm.value.poNumber,
      supplierId: Number(this.poForm.value.supplierId),
      requisitionId: Number(this.poForm.value.requisitionId),
      orderDate: this.poForm.value.orderDate,
      expectedDeliveryDate: this.poForm.value.expectedDeliveryDate,
      totalAmount: Number(this.poForm.value.totalAmount),
      status: this.poForm.value.status
    };

    if (this.isEditing && this.currentPoId) {
      this.poService.updatePurchaseOrder(this.currentPoId, payload).subscribe({
        next: (updated) => {
          this.successMessage = `Purchase order '${updated.poNumber}' updated successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadPurchaseOrders();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update purchase order.';
          this.isSaving = false;
        }
      });
    } else {
      this.poService.createPurchaseOrder(payload).subscribe({
        next: (created) => {
          this.successMessage = `Purchase order '${created.poNumber}' generated successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadPurchaseOrders();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to generate purchase order.';
          this.isSaving = false;
        }
      });
    }
  }

  openViewModal(po: PurchaseOrder): void {
    this.selectedPo = po;
    this.isViewModalOpen = true;
  }

  updateStatus(po: PurchaseOrder, newStatus: string): void {
    if (!po.purchaseOrderId) return;
    this.poService.updateStatus(po.purchaseOrderId, newStatus).subscribe({
      next: (res) => {
        po.status = res.status;
        this.successMessage = `Purchase order '${po.poNumber}' marked as ${res.status}.`;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update order status.';
        this.cdr.detectChanges();
      }
    });
  }

  promptDelete(po: PurchaseOrder): void {
    this.poToDelete = po;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.poToDelete?.purchaseOrderId) return;
    const id = this.poToDelete.purchaseOrderId;
    const num = this.poToDelete.poNumber;
    this.isDeleteDialogOpen = false;

    this.poService.deletePurchaseOrder(id).subscribe({
      next: () => {
        this.successMessage = `Purchase order '${num}' deleted successfully.`;
        this.loadPurchaseOrders();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete purchase order.';
        this.cdr.detectChanges();
      }
    });
  }

  isOverdue(po: PurchaseOrder): boolean {
    if (!po.expectedDeliveryDate || po.status === 'Delivered' || po.status === 'Cancelled') return false;
    return new Date(po.expectedDeliveryDate).getTime() < new Date().setHours(0,0,0,0);
  }

  getDeliveryUrgencyClass(po: PurchaseOrder): string {
    if (po.status === 'Delivered') return 'text-success fw-semibold';
    if (this.isOverdue(po)) return 'text-danger fw-bold';
    const due = new Date(po.expectedDeliveryDate).getTime();
    const now = new Date().getTime();
    const diffDays = (due - now) / (1000 * 3600 * 24);
    if (diffDays <= 3) return 'text-warning-emphasis fw-semibold';
    return 'text-dark';
  }

  getDeliveryUrgencyIcon(po: PurchaseOrder): string {
    if (po.status === 'Delivered') return 'bi-check-circle-fill text-success';
    if (this.isOverdue(po)) return 'bi-exclamation-octagon-fill text-danger';
    return 'bi-calendar-event text-secondary';
  }
}
