package com.example.myapp.service;

import java.util.List;
import java.util.Objects;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.example.myapp.dto.product.ProductRequest;
import com.example.myapp.exception.NotFoundException;
import com.example.myapp.model.Product;
import com.example.myapp.model.Supplier;
import com.example.myapp.repository.ProductRepository;
import com.example.myapp.repository.SupplierRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(@NonNull Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
    }

    public List<Product> searchByName(String q) {
        return productRepository.findByNameContainingIgnoreCase(q == null ? "" : q);
    }

    public List<Product> lowStockProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getQuantity() <= p.getLowStockThreshold())
                .toList();
    }

    public Product create(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("SKU already exists");
        }
        Product product = new Product();
        map(request, product);
        return productRepository.save(product);
    }

    public Product update(@NonNull Long id, ProductRequest request) {
        Product product = getById(id);
        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("SKU already exists");
        }
        map(request, product);
        return productRepository.save(product);
    }

    public void delete(@NonNull Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }

    private void map(ProductRequest request, Product product) {
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setQuantity(request.getQuantity());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setLowStockThreshold(request.getLowStockThreshold());

        if (request.getSupplierId() != null) {
            Long supplierId = Objects.requireNonNull(request.getSupplierId(), "supplierId must not be null");
            Supplier supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new NotFoundException("Supplier not found: " + request.getSupplierId()));
            product.setSupplier(supplier);
        } else {
            product.setSupplier(null);
        }
    }
}
