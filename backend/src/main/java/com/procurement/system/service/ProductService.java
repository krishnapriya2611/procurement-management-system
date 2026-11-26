package com.procurement.system.service;

import com.procurement.system.entity.Product;
import com.procurement.system.exception.BusinessRuleException;
import com.procurement.system.exception.DuplicateResourceException;
import com.procurement.system.exception.ResourceNotFoundException;
import com.procurement.system.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts(String search, Boolean active) {
        if (search != null && !search.trim().isEmpty()) {
            return productRepository.findByProductNameContainingIgnoreCaseOrSkuContainingIgnoreCase(
                    search.trim(), search.trim());
        }
        if (active != null) {
            return productRepository.findByActive(active);
        }
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
    }

    public Product createProduct(Product product) {
        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            throw new BusinessRuleException("Product SKU is required");
        }
        if (product.getProductName() == null || product.getProductName().trim().isEmpty()) {
            throw new BusinessRuleException("Product name is required");
        }
        if (product.getStandardPrice() == null) {
            throw new BusinessRuleException("Standard price is required");
        }
        if (product.getStandardPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Standard price cannot be negative");
        }

        String normalizedSku = product.getSku().trim();
        if (productRepository.existsBySku(normalizedSku)) {
            throw new DuplicateResourceException("Product with SKU '" + normalizedSku + "' already exists");
        }

        product.setSku(normalizedSku);
        if (product.getActive() == null) {
            product.setActive(true);
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = getProductById(id);

        if (updatedProduct.getSku() == null || updatedProduct.getSku().trim().isEmpty()) {
            throw new BusinessRuleException("Product SKU is required");
        }
        if (updatedProduct.getProductName() == null || updatedProduct.getProductName().trim().isEmpty()) {
            throw new BusinessRuleException("Product name is required");
        }
        if (updatedProduct.getStandardPrice() == null) {
            throw new BusinessRuleException("Standard price is required");
        }
        if (updatedProduct.getStandardPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Standard price cannot be negative");
        }

        String normalizedSku = updatedProduct.getSku().trim();
        if (productRepository.existsBySkuAndProductIdNot(normalizedSku, id)) {
            throw new DuplicateResourceException("Product SKU '" + normalizedSku + "' is already in use by another product");
        }

        existing.setSku(normalizedSku);
        existing.setProductName(updatedProduct.getProductName().trim());
        existing.setDescription(updatedProduct.getDescription());
        existing.setUnit(updatedProduct.getUnit());
        existing.setStandardPrice(updatedProduct.getStandardPrice());
        if (updatedProduct.getActive() != null) {
            existing.setActive(updatedProduct.getActive());
        }

        return productRepository.save(existing);
    }

    public Product updateProductStatus(Long id, Boolean active) {
        Product existing = getProductById(id);
        if (active == null) {
            throw new BusinessRuleException("Active status cannot be null");
        }
        existing.setActive(active);
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        Product existing = getProductById(id);
        productRepository.delete(existing);
    }
}
