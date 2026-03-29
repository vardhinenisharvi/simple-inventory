package com.example.myapp.controller;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.myapp.dto.order.PurchaseOrderRequest;
import com.example.myapp.model.PurchaseOrder;
import com.example.myapp.model.enums.PurchaseOrderStatus;
import com.example.myapp.service.PurchaseOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public List<PurchaseOrder> getAll() {
        return purchaseOrderService.getAll();
    }

    @PostMapping
    public PurchaseOrder create(@Valid @RequestBody PurchaseOrderRequest request) {
        return purchaseOrderService.create(request);
    }

    @PatchMapping("/{id}/status")
    public PurchaseOrder updateStatus(@PathVariable @NonNull Long id, @RequestParam PurchaseOrderStatus status) {
        return purchaseOrderService.updateStatus(id, status);
    }
}
