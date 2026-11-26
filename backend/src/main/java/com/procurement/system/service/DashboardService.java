package com.procurement.system.service;

import com.procurement.system.dto.DashboardSummaryDTO;
import com.procurement.system.repository.PurchaseOrderRepository;
import com.procurement.system.repository.PurchaseRequisitionRepository;
import com.procurement.system.repository.QuotationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final PurchaseRequisitionRepository requisitionRepository;
    private final QuotationRepository quotationRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public DashboardService(PurchaseRequisitionRepository requisitionRepository,
                            QuotationRepository quotationRepository,
                            PurchaseOrderRepository purchaseOrderRepository) {
        this.requisitionRepository = requisitionRepository;
        this.quotationRepository = quotationRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public DashboardSummaryDTO getDashboardSummary() {
        long openRequisitions = requisitionRepository.countByStatusIgnoreCase("Open");
        long quotationsAwaitingReview = quotationRepository.countByStatusIgnoreCase("Pending Review");
        long openPurchaseOrders = purchaseOrderRepository.countByStatusIgnoreCase("Open");
        BigDecimal outstandingOrderValue = purchaseOrderRepository.sumTotalAmountByStatusIgnoreCase("Open");
        long delayedOrders = purchaseOrderRepository.countDelayedOpenOrders(LocalDate.now());

        return new DashboardSummaryDTO(
                openRequisitions,
                quotationsAwaitingReview,
                openPurchaseOrders,
                outstandingOrderValue,
                delayedOrders
        );
    }
}
