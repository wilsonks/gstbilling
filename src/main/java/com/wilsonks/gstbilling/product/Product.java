package com.wilsonks.gstbilling.product;

import com.wilsonks.gstbilling.common.TenantScopedEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "t_products",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_products_tenant_code", columnNames = {"tenant_id", "code"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends TenantScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal defaultPrice;

    @Column(name = "hsn_sac_id", nullable = false)
    private Long hsnSacId;

    @Column(name = "unit_id", nullable = false)
    private Long unitId;

    @Column(name = "gst_slab_id", nullable = false)
    private Long gstSlabId;

    @Column(nullable = false)
    private boolean active;
}