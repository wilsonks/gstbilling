package com.wilsonks.gstbilling.product;

import com.wilsonks.gstbilling.context.TenantContext;
import com.wilsonks.gstbilling.master.gst.GstSlabMaster;
import com.wilsonks.gstbilling.master.gst.GstSlabMasterRepository;
import com.wilsonks.gstbilling.master.hsn.HsnSacMaster;
import com.wilsonks.gstbilling.master.hsn.HsnSacMasterRepository;
import com.wilsonks.gstbilling.master.unit.UnitMaster;
import com.wilsonks.gstbilling.master.unit.UnitMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final ProductValidator validator;
    private final HsnSacMasterRepository hsnSacRepository;
    private final UnitMasterRepository unitRepository;
    private final GstSlabMasterRepository gstSlabRepository;

    public ProductDto create(ProductDto dto) {
        Long tenantId = getTenantIdOrThrow();

        normalize(dto);
        validator.validateForCreateOrUpdate(dto);

        if (repo.existsByTenantIdAndCodeIgnoreCase(tenantId, dto.getCode())) {
            throw new IllegalArgumentException("Product with the same code already exists for this tenant");
        }

        HsnSacMaster hsnSac = getActiveHsnSac(dto.getHsnSacId());
        UnitMaster unit = getActiveUnit(dto.getUnitId());
        GstSlabMaster gstSlab = getActiveGstSlab(dto.getGstSlabId());

        Product product = new Product();
        mapToEntity(dto, product, tenantId);

        try {
            Product saved = repo.save(product);
            return toDto(saved, hsnSac, unit, gstSlab);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Product with the same code already exists for this tenant");
        }
    }

    public ProductDto update(Long id, ProductDto dto) {
        Long tenantId = getTenantIdOrThrow();

        Product product = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        if (!tenantId.equals(product.getTenantId())) {
            throw new IllegalArgumentException("You cannot modify a product from another tenant");
        }

        normalize(dto);
        validator.validateForCreateOrUpdate(dto);

        boolean codeChanged = !product.getCode().equalsIgnoreCase(dto.getCode());
        if (codeChanged && repo.existsByTenantIdAndCodeIgnoreCase(tenantId, dto.getCode())) {
            throw new IllegalArgumentException("Product with the same code already exists for this tenant");
        }

        HsnSacMaster hsnSac = getActiveHsnSac(dto.getHsnSacId());
        UnitMaster unit = getActiveUnit(dto.getUnitId());
        GstSlabMaster gstSlab = getActiveGstSlab(dto.getGstSlabId());

        mapToEntity(dto, product, tenantId);

        try {
            Product saved = repo.save(product);
            return toDto(saved, hsnSac, unit, gstSlab);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Product with the same code already exists for this tenant");
        }
    }

    public ProductDto getById(Long id) {
        Long tenantId = getTenantIdOrThrow();

        Product product = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        if (!tenantId.equals(product.getTenantId())) {
            throw new IllegalArgumentException("You cannot access a product from another tenant");
        }

        return enrich(product);
    }

    public Page<ProductDto> list(String q, Pageable pageable) {
        Long tenantId = getTenantIdOrThrow();

        if (q == null || q.isBlank()) {
            return repo.findByTenantId(tenantId, pageable)
                    .map(this::enrich);
        }

        String query = q.trim();
        return repo.findByTenantIdAndNameContainingIgnoreCaseOrTenantIdAndCodeContainingIgnoreCase(
                        tenantId, query, tenantId, query, pageable
                )
                .map(this::enrich);
    }

    public List<ProductDto> getAllForCurrentTenant() {
        Long tenantId = getTenantIdOrThrow();

        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::enrich)
                .toList();
    }

    public ProductStats stats() {
        Long tenantId = getTenantIdOrThrow();

        long total = repo.countByTenantId(tenantId);
        long active = repo.countByTenantIdAndActiveTrue(tenantId);
        long inactive = total - active;

        List<ProductDto> recentProducts = repo.findTop5ByTenantIdOrderByUpdatedAtDesc(tenantId)
                .stream()
                .map(this::enrich)
                .toList();

        return new ProductStats(total, active, inactive, recentProducts);
    }

    public ProductDto deactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        Product product = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        if (!tenantId.equals(product.getTenantId())) {
            throw new IllegalArgumentException("You cannot modify a product from another tenant");
        }

        if (product.isActive()) {
            product.setActive(false);
            product = repo.save(product);
        }

        return enrich(product);
    }

    public ProductDto reactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        Product product = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        if (!tenantId.equals(product.getTenantId())) {
            throw new IllegalArgumentException("You cannot modify a product from another tenant");
        }

        if (!product.isActive()) {
            product.setActive(true);
            product = repo.save(product);
        }

        return enrich(product);
    }

    private Long getTenantIdOrThrow() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant in request context");
        }
        return tenantId;
    }

    private HsnSacMaster getActiveHsnSac(Long id) {
        return hsnSacRepository.findById(id)
                .filter(HsnSacMaster::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Invalid active HSN/SAC selected"));
    }

    private UnitMaster getActiveUnit(Long id) {
        return unitRepository.findById(id)
                .filter(UnitMaster::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Invalid active unit selected"));
    }

    private GstSlabMaster getActiveGstSlab(Long id) {
        return gstSlabRepository.findById(id)
                .filter(GstSlabMaster::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Invalid active GST slab selected"));
    }

    private void normalize(ProductDto dto) {
        if (dto.getCode() != null) {
            dto.setCode(dto.getCode().trim().toUpperCase(Locale.ROOT));
        }
        if (dto.getName() != null) {
            dto.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            dto.setDescription(dto.getDescription().trim());
        }
    }

    private void mapToEntity(ProductDto dto, Product product, Long tenantId) {
        product.setTenantId(tenantId);
        product.setCode(dto.getCode());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setDefaultPrice(dto.getDefaultPrice());
        product.setHsnSacId(dto.getHsnSacId());
        product.setUnitId(dto.getUnitId());
        product.setGstSlabId(dto.getGstSlabId());
        product.setActive(dto.getActive() != null ? dto.getActive() : true);
    }

    private ProductDto enrich(Product product) {
        HsnSacMaster hsnSac = hsnSacRepository.findById(product.getHsnSacId())
                .orElseThrow(() -> new IllegalStateException("HSN/SAC master missing for product " + product.getId()));

        UnitMaster unit = unitRepository.findById(product.getUnitId())
                .orElseThrow(() -> new IllegalStateException("Unit master missing for product " + product.getId()));

        GstSlabMaster gstSlab = gstSlabRepository.findById(product.getGstSlabId())
                .orElseThrow(() -> new IllegalStateException("GST slab master missing for product " + product.getId()));

        return toDto(product, hsnSac, unit, gstSlab);
    }

    private ProductDto toDto(Product product, HsnSacMaster hsnSac, UnitMaster unit, GstSlabMaster gstSlab) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setTenantId(product.getTenantId());
        dto.setCode(product.getCode());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setDefaultPrice(product.getDefaultPrice());
        dto.setActive(product.isActive());

        dto.setHsnSacId(hsnSac.getId());
        dto.setHsnSacCode(hsnSac.getCode());
        dto.setHsnSacDescription(hsnSac.getDescription());

        dto.setUnitId(unit.getId());
        dto.setUnitCode(unit.getCode());
        dto.setUnitName(unit.getName());

        dto.setGstSlabId(gstSlab.getId());
        dto.setGstSlabCode(gstSlab.getCode());
        dto.setGstSlabName(gstSlab.getName());
        dto.setGstRate(gstSlab.getRate());

        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        dto.setCreatedBy(product.getCreatedBy());
        dto.setUpdatedBy(product.getUpdatedBy());
        dto.setVersion(product.getVersion());

        return dto;
    }
}