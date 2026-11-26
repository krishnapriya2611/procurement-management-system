import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { AlertBannerComponent } from '../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AlertBannerComponent],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 class="h3 fw-bold text-dark mb-1">
            <i class="bi bi-speedometer2 text-primary me-2"></i>Procurement Dashboard
          </h2>
          <p class="text-muted small mb-0">Overview of operational procurement metrics, vendor orders, and outstanding values.</p>
        </div>
        <div>
          <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 shadow-sm" (click)="loadSummary()" [disabled]="isLoading">
            <i class="bi bi-arrow-clockwise" [class.spin]="isLoading"></i> Refresh Metrics
          </button>
        </div>
      </div>

      <!-- Alert -->
      <app-alert-banner [message]="errorMessage" type="error" (dismiss)="errorMessage = null"></app-alert-banner>

      <!-- Delayed Work Banner (if delayed orders exist) -->
      <div *ngIf="summary && summary.delayedOrdersCount > 0" class="alert alert-warning border-warning shadow-sm mb-4 d-flex align-items-center gap-3">
        <i class="bi bi-exclamation-triangle-fill text-warning fs-3"></i>
        <div>
          <h6 class="fw-bold mb-1">Action Required: Delayed Deliverables</h6>
          <p class="small mb-0">
            There are <strong>{{ summary.delayedOrdersCount }}</strong> purchase order(s) past their expected delivery date still in Open status.
            <a routerLink="/purchase-orders" class="alert-link ms-1">Review Open Purchase Orders &rarr;</a>
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading metrics...</span>
        </div>
        <p class="text-muted small mt-2">Loading live operational data from backend...</p>
      </div>

      <!-- KPI Cards Grid -->
      <div *ngIf="!isLoading && summary" class="row g-4 mb-5">
        <!-- Card 1: Open Requisitions -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 kpi-card border-start-primary">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-uppercase fw-semibold text-muted small">Open Requisitions</span>
                <span class="kpi-icon-circle bg-blue-subtle text-primary">
                  <i class="bi bi-file-earmark-text"></i>
                </span>
              </div>
              <h3 class="display-6 fw-bold mb-1 text-dark">{{ summary.openRequisitionsCount }}</h3>
              <p class="small text-muted mb-0">Requisitions awaiting fulfillment</p>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0">
              <a routerLink="/requisitions" class="card-link-text small fw-semibold text-primary">
                View Requisitions <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Card 2: Quotations Awaiting Review -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 kpi-card border-start-warning">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-uppercase fw-semibold text-muted small">Pending Quotations</span>
                <span class="kpi-icon-circle bg-warning-subtle text-warning-emphasis">
                  <i class="bi bi-receipt"></i>
                </span>
              </div>
              <h3 class="display-6 fw-bold mb-1 text-dark">{{ summary.quotationsAwaitingReviewCount }}</h3>
              <p class="small text-muted mb-0">Quotations under evaluation</p>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0">
              <a routerLink="/quotations" class="card-link-text small fw-semibold text-warning-emphasis">
                Compare Quotations <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Card 3: Open Purchase Orders -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 kpi-card border-start-info">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-uppercase fw-semibold text-muted small">Open Purchase Orders</span>
                <span class="kpi-icon-circle bg-info-subtle text-info-emphasis">
                  <i class="bi bi-cart-check"></i>
                </span>
              </div>
              <h3 class="display-6 fw-bold mb-1 text-dark">{{ summary.openPurchaseOrdersCount }}</h3>
              <p class="small text-muted mb-0">Orders pending delivery</p>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0">
              <a routerLink="/purchase-orders" class="card-link-text small fw-semibold text-info-emphasis">
                Track Orders <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Card 4: Outstanding Order Value -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 kpi-card border-start-success">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="text-uppercase fw-semibold text-muted small">Outstanding Value</span>
                <span class="kpi-icon-circle bg-success-subtle text-success">
                  <i class="bi bi-currency-rupee"></i>
                </span>
              </div>
              <h3 class="display-6 fw-bold mb-1 text-dark">
                ₹{{ summary.outstandingOrderValue | number:'1.2-2' }}
              </h3>
              <p class="small text-muted mb-0">Total open order commitment</p>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0">
              <a routerLink="/purchase-orders" class="card-link-text small fw-semibold text-success">
                View Breakdown <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Shortcuts & Lifecycle Guide -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="fw-bold mb-0 text-dark">
            <i class="bi bi-diagram-3-fill text-primary me-2"></i>Procurement Workflow Navigation
          </h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-12 col-md-4">
              <div class="p-3 border rounded bg-light h-100">
                <h6 class="fw-bold text-primary mb-2">1. Master Catalog Maintenance</h6>
                <p class="small text-muted">Register verified vendors and maintain SKU pricing catalogs.</p>
                <div class="d-flex gap-2">
                  <a routerLink="/suppliers" class="btn btn-sm btn-outline-primary">Suppliers Directory</a>
                  <a routerLink="/products" class="btn btn-sm btn-outline-secondary">Products Catalog</a>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="p-3 border rounded bg-light h-100">
                <h6 class="fw-bold text-primary mb-2">2. Requisition & Quotation</h6>
                <p class="small text-muted">Raise department purchase requests and capture competing supplier quotations.</p>
                <div class="d-flex gap-2">
                  <a routerLink="/requisitions" class="btn btn-sm btn-outline-primary">Requisitions</a>
                  <a routerLink="/quotations" class="btn btn-sm btn-outline-secondary">Quotations</a>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="p-3 border rounded bg-light h-100">
                <h6 class="fw-bold text-primary mb-2">3. Purchase Orders & Delivery</h6>
                <p class="small text-muted">Issue formal purchase orders, track expected dates, and manage lifecycle status.</p>
                <div class="d-flex gap-2">
                  <a routerLink="/purchase-orders" class="btn btn-sm btn-outline-primary">Purchase Orders</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .border-start-primary { border-left: 4px solid #1e3a8a !important; }
    .border-start-warning { border-left: 4px solid #d97706 !important; }
    .border-start-info { border-left: 4px solid #0284c7 !important; }
    .border-start-success { border-left: 4px solid #16a34a !important; }

    .kpi-icon-circle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .kpi-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load dashboard metrics from backend.';
        this.isLoading = false;
      }
    });
  }
}
