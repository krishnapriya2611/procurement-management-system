import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { AlertBannerComponent } from '../../shared/components/alert-banner/alert-banner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertBannerComponent, ConfirmDialogComponent],
  template: `
    <div class="products-container">
      <!-- Title & Action Bar -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h2 class="h3 fw-bold text-dark mb-1">
            <i class="bi bi-boxes text-primary me-2"></i>Product Catalog
          </h2>
          <p class="text-muted small mb-0">Maintain standard items, specifications, units of measure, and benchmark pricing.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" (click)="openAddModal()">
          <i class="bi bi-plus-circle-fill"></i> Add New Product
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
                <input type="text" class="form-control border-start-0" placeholder="Search by SKU or product name..."
                       [(ngModel)]="searchKeyword" (keyup.enter)="loadProducts()" />
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <select class="form-select" [(ngModel)]="activeFilter" (change)="loadProducts()">
                <option value="">All Catalog</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
            <div class="col-12 col-sm-6 col-md-3 d-flex gap-2">
              <button class="btn btn-secondary flex-grow-1" (click)="loadProducts()">Apply</button>
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
        <p class="text-muted small mt-2">Loading product catalog...</p>
      </div>

      <!-- Products Table -->
      <div *ngIf="!isLoading" class="card shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" style="width: 150px;">SKU</th>
                <th scope="col">Product Name & Description</th>
                <th scope="col">Unit</th>
                <th scope="col" class="text-end">Standard Price</th>
                <th scope="col" class="text-center">Status</th>
                <th scope="col" class="text-end" style="width: 160px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of products">
                <td>
                  <span class="badge bg-secondary-subtle text-dark border font-monospace">{{ p.sku }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ p.productName }}</div>
                  <small class="text-muted text-truncate d-block" style="max-width: 350px;">
                    {{ p.description || 'No description provided' }}
                  </small>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ p.unit || 'PCS' }}</span>
                </td>
                <td class="text-end font-monospace fw-bold text-dark">
                  ₹{{ p.standardPrice | number:'1.2-2' }}
                </td>
                <td class="text-center">
                  <span class="badge" [ngClass]="p.active ? 'bg-success text-white' : 'bg-danger text-white'">
                    <i class="bi me-1" [ngClass]="p.active ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                    {{ p.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" (click)="openEditModal(p)" title="Edit Product">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-warning" (click)="toggleActive(p)"
                            [title]="p.active ? 'Deactivate Product' : 'Activate Product'">
                      <i class="bi" [ngClass]="p.active ? 'bi-pause-circle' : 'bi-play-circle'"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="promptDelete(p)" title="Delete Product">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Empty state -->
              <tr *ngIf="products.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  No products found matching your criteria.
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
                {{ isEditing ? 'Edit Product' : 'Add New Product' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeFormModal()"></button>
            </div>
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
              <div class="modal-body py-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">SKU Code <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" formControlName="sku" placeholder="e.g. PRD-HYD-001"
                           [class.is-invalid]="f['sku'].touched && f['sku'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['sku'].errors?.['required']">Product SKU is required.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Product Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" formControlName="productName" placeholder="e.g. Hydraulic Control Valve"
                           [class.is-invalid]="f['productName'].touched && f['productName'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['productName'].errors?.['required']">Product name is required.</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Unit of Measure</label>
                    <input type="text" class="form-control" formControlName="unit" placeholder="e.g. PCS, SET, KG, TON, BOX" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Standard Benchmark Price (₹) <span class="text-danger">*</span></label>
                    <input type="number" step="0.01" min="0" class="form-control" formControlName="standardPrice" placeholder="0.00"
                           [class.is-invalid]="f['standardPrice'].touched && f['standardPrice'].invalid" />
                    <div class="invalid-feedback" *ngIf="f['standardPrice'].errors?.['required']">Standard price is required.</div>
                    <div class="invalid-feedback" *ngIf="f['standardPrice'].errors?.['min']">Price cannot be negative.</div>
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Product Description</label>
                    <textarea class="form-control" rows="3" formControlName="description" placeholder="Technical specifications or application details"></textarea>
                  </div>
                  <div class="col-12">
                    <div class="form-check form-switch mt-2">
                      <input class="form-check-input" type="checkbox" id="activeSwitch" formControlName="active">
                      <label class="form-check-label small fw-semibold" for="activeSwitch">Mark product as active for requisitions</label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary" (click)="closeFormModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || isSaving">
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEditing ? 'Save Changes' : 'Create Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isDeleteDialogOpen"
        [title]="'Delete Product'"
        [message]="deleteConfirmMessage"
        [confirmText]="'Delete Product'"
        [isDanger]="true"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteDialogOpen = false">
      </app-confirm-dialog>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  searchKeyword = '';
  activeFilter = '';
  isLoading = false;
  isSaving = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Form Modal
  isFormModalOpen = false;
  isEditing = false;
  currentProductId: number | null = null;

  // Delete dialog
  isDeleteDialogOpen = false;
  productToDelete: Product | null = null;

  productForm: FormGroup;

  get deleteConfirmMessage(): string {
    const name = this.productToDelete?.productName || '';
    const sku = this.productToDelete?.sku || '';
    return `Are you sure you want to delete product '${name}' (SKU: ${sku})?`;
  }

  constructor(private productService: ProductService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      sku: ['', Validators.required],
      productName: ['', Validators.required],
      description: [''],
      unit: ['PCS'],
      standardPrice: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  get f() { return this.productForm.controls; }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    let activeBool: boolean | undefined = undefined;
    if (this.activeFilter === 'true') activeBool = true;
    if (this.activeFilter === 'false') activeBool = false;

    this.productService.getProducts(this.searchKeyword, activeBool).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load products.';
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.activeFilter = '';
    this.loadProducts();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentProductId = null;
    this.productForm.reset({ unit: 'PCS', standardPrice: 0, active: true });
    this.isFormModalOpen = true;
  }

  openEditModal(p: Product): void {
    this.isEditing = true;
    this.currentProductId = p.productId || null;
    this.productForm.patchValue({
      sku: p.sku,
      productName: p.productName,
      description: p.description || '',
      unit: p.unit || 'PCS',
      standardPrice: p.standardPrice,
      active: p.active !== undefined ? p.active : true
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: Product = this.productForm.value;

    if (this.isEditing && this.currentProductId) {
      this.productService.updateProduct(this.currentProductId, payload).subscribe({
        next: (updated) => {
          this.successMessage = `Product '${updated.productName}' updated successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadProducts();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update product.';
          this.isSaving = false;
        }
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: (created) => {
          this.successMessage = `Product '${created.productName}' created successfully.`;
          this.isSaving = false;
          this.closeFormModal();
          this.loadProducts();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create product.';
          this.isSaving = false;
        }
      });
    }
  }

  toggleActive(p: Product): void {
    if (!p.productId) return;
    const newActive = !p.active;
    this.productService.updateStatus(p.productId, newActive).subscribe({
      next: (res) => {
        p.active = res.active;
        this.successMessage = `Product status changed to ${res.active ? 'Active' : 'Inactive'}.`;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to toggle status.';
      }
    });
  }

  promptDelete(p: Product): void {
    this.productToDelete = p;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.productToDelete?.productId) return;
    const id = this.productToDelete.productId;
    const name = this.productToDelete.productName;

    this.isDeleteDialogOpen = false;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.successMessage = `Product '${name}' was deleted successfully.`;
        this.loadProducts();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete product.';
      }
    });
  }
}
