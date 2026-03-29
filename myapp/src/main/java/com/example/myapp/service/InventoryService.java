package com.example.myapp.service;

import java.util.Objects;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.example.myapp.dto.inventory.StockMovementRequest;
import com.example.myapp.exception.NotFoundException;
import com.example.myapp.model.Product;
import com.example.myapp.model.StockMovement;
import com.example.myapp.model.enums.MovementType;
import com.example.myapp.repository.ProductRepository;
import com.example.myapp.repository.StockMovementRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    public Product stockIn(StockMovementRequest request) {
        Long productId = Objects.requireNonNull(request.getProductId(), "productId must not be null");
        Product product = getProduct(productId);
        product.setQuantity(product.getQuantity() + request.getQuantity());

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setType(MovementType.STOCK_IN);
        movement.setQuantity(request.getQuantity());
        movement.setNotes(request.getNotes());

        stockMovementRepository.save(movement);
        return productRepository.save(product);
    }

    public Product stockOut(StockMovementRequest request) {
        Long productId = Objects.requireNonNull(request.getProductId(), "productId must not be null");
        Product product = getProduct(productId);
        if (product.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        product.setQuantity(product.getQuantity() - request.getQuantity());

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setType(MovementType.STOCK_OUT);
        movement.setQuantity(request.getQuantity());
        movement.setNotes(request.getNotes());

        stockMovementRepository.save(movement);
        return productRepository.save(product);
    }

    private Product getProduct(@NonNull Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
    }
}
