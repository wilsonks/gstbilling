package com.wilsonks.gstbilling.customer;

import com.wilsonks.gstbilling.context.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository repo;
    private final CustomerValidator validator;

    public CustomerDto create(CustomerDto dto) {
        Long tenantId = getTenantIdOrThrow();

        normalize(dto);
        validator.validateForCreateOrUpdate(dto);

        if (repo.existsByTenantIdAndCodeIgnoreCase(tenantId, dto.getCode())) {
            throw new IllegalArgumentException("Customer with the same code already exists for this tenant");
        }

        if (hasGstin(dto) && repo.existsByTenantIdAndGstinIgnoreCase(tenantId, dto.getGstin())) {
            throw new IllegalArgumentException("Customer with the same GSTIN already exists for this tenant");
        }

        Customer customer = new Customer();
        mapToEntity(dto, customer, tenantId);

        try {
            return toDto(repo.save(customer));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Customer code or GSTIN already exists for this tenant");
        }
    }

    public CustomerDto update(Long id, CustomerDto dto) {
        Long tenantId = getTenantIdOrThrow();

        Customer customer = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));

        if (!tenantId.equals(customer.getTenantId())) {
            throw new IllegalArgumentException("You cannot modify a customer from another tenant");
        }

        normalize(dto);
        validator.validateForCreateOrUpdate(dto);

        boolean codeChanged = !customer.getCode().equalsIgnoreCase(dto.getCode());
        if (codeChanged && repo.existsByTenantIdAndCodeIgnoreCase(tenantId, dto.getCode())) {
            throw new IllegalArgumentException("Customer with the same code already exists for this tenant");
        }

        boolean gstinChanged = hasGstin(dto)
                && (customer.getGstin() == null || !customer.getGstin().equalsIgnoreCase(dto.getGstin()));

        if (gstinChanged && repo.existsByTenantIdAndGstinIgnoreCase(tenantId, dto.getGstin())) {
            throw new IllegalArgumentException("Customer with the same GSTIN already exists for this tenant");
        }

        mapToEntity(dto, customer, tenantId);

        try {
            return toDto(repo.save(customer));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Customer code or GSTIN already exists for this tenant");
        }
    }

    public CustomerDto getById(Long id) {
        Long tenantId = getTenantIdOrThrow();

        Customer customer = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));

        if (!tenantId.equals(customer.getTenantId())) {
            throw new IllegalArgumentException("You cannot access a customer from another tenant");
        }

        return toDto(customer);
    }

    public Page<CustomerDto> list(String q, Pageable pageable) {
        Long tenantId = getTenantIdOrThrow();

        if (q == null || q.isBlank()) {
            return repo.findByTenantId(tenantId, pageable)
                    .map(this::toDto);
        }

        String query = q.trim();
        return repo.findByTenantIdAndLegalNameContainingIgnoreCaseOrTenantIdAndCodeContainingIgnoreCase(
                        tenantId, query, tenantId, query, pageable
                )
                .map(this::toDto);
    }

    public List<CustomerDto> getAllForCurrentTenant() {
        Long tenantId = getTenantIdOrThrow();

        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public CustomerStats stats() {
        Long tenantId = getTenantIdOrThrow();

        long total = repo.countByTenantId(tenantId);
        long active = repo.countByTenantIdAndActiveTrue(tenantId);
        long inactive = total - active;

        List<CustomerDto> recentCustomers = repo.findTop5ByTenantIdOrderByUpdatedAtDesc(tenantId)
                .stream()
                .map(this::toDto)
                .toList();

        return new CustomerStats(total, active, inactive, recentCustomers);
    }

    public CustomerDto deactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        Customer customer = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));

        if (!tenantId.equals(customer.getTenantId())) {
            throw new IllegalArgumentException("You cannot modify a customer from another tenant");
        }

        if (customer.isActive()) {
            customer.setActive(false);
            customer = repo.save(customer);
        }

        return toDto(customer);
    }

    public CustomerDto reactivate(Long id) {
        Long tenantId = getTenantIdOrThrow();

        Customer customer = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));

        if (!tenantId.equals(customer.getTenantId())) {
            throw new IllegalArgumentException("You cannot modify a customer from another tenant");
        }

        if (!customer.isActive()) {
            customer.setActive(true);
            customer = repo.save(customer);
        }

        return toDto(customer);
    }

    private Long getTenantIdOrThrow() {
        Long tenantId = TenantContext.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant in request context");
        }
        return tenantId;
    }

    private boolean hasGstin(CustomerDto dto) {
        return dto.getGstin() != null && !dto.getGstin().isBlank();
    }

    private void normalize(CustomerDto dto) {
        if (dto.getCode() != null) {
            dto.setCode(dto.getCode().trim().toUpperCase(Locale.ROOT));
        }
        if (dto.getLegalName() != null) {
            dto.setLegalName(dto.getLegalName().trim());
        }
        if (dto.getTradeName() != null) {
            dto.setTradeName(dto.getTradeName().trim());
        }
        if (dto.getGstin() != null) {
            dto.setGstin(dto.getGstin().trim().toUpperCase(Locale.ROOT));
        }
        if (dto.getPan() != null) {
            dto.setPan(dto.getPan().trim().toUpperCase(Locale.ROOT));
        }
        if (dto.getContactPerson() != null) {
            dto.setContactPerson(dto.getContactPerson().trim());
        }
        if (dto.getEmail() != null) {
            dto.setEmail(dto.getEmail().trim());
        }
        if (dto.getPhone() != null) {
            dto.setPhone(dto.getPhone().trim());
        }
        if (dto.getBillingStateCode() != null) {
            dto.setBillingStateCode(dto.getBillingStateCode().trim().toUpperCase(Locale.ROOT));
        }
        if (dto.getShippingStateCode() != null) {
            dto.setShippingStateCode(dto.getShippingStateCode().trim().toUpperCase(Locale.ROOT));
        }
        if (dto.getBillingCountry() == null || dto.getBillingCountry().isBlank()) {
            dto.setBillingCountry("India");
        }
        if (dto.getShippingCountry() == null || dto.getShippingCountry().isBlank()) {
            dto.setShippingCountry("India");
        }
    }

    private void mapToEntity(CustomerDto dto, Customer customer, Long tenantId) {
        customer.setTenantId(tenantId);
        customer.setCode(dto.getCode());
        customer.setLegalName(dto.getLegalName());
        customer.setTradeName(dto.getTradeName());
        customer.setCustomerType(dto.getCustomerType());
        customer.setGstRegistrationType(dto.getGstRegistrationType());
        customer.setGstin(dto.getGstin());
        customer.setPan(dto.getPan());
        customer.setContactPerson(dto.getContactPerson());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());

        customer.setBillingAddressLine1(dto.getBillingAddressLine1());
        customer.setBillingAddressLine2(dto.getBillingAddressLine2());
        customer.setBillingCity(dto.getBillingCity());
        customer.setBillingState(dto.getBillingState());
        customer.setBillingStateCode(dto.getBillingStateCode());
        customer.setBillingPincode(dto.getBillingPincode());
        customer.setBillingCountry(dto.getBillingCountry());

        boolean shippingSameAsBilling = dto.getShippingSameAsBilling() == null || dto.getShippingSameAsBilling();
        customer.setShippingSameAsBilling(shippingSameAsBilling);

        if (shippingSameAsBilling) {
            customer.setShippingAddressLine1(dto.getBillingAddressLine1());
            customer.setShippingAddressLine2(dto.getBillingAddressLine2());
            customer.setShippingCity(dto.getBillingCity());
            customer.setShippingState(dto.getBillingState());
            customer.setShippingStateCode(dto.getBillingStateCode());
            customer.setShippingPincode(dto.getBillingPincode());
            customer.setShippingCountry(dto.getBillingCountry());
        } else {
            customer.setShippingAddressLine1(dto.getShippingAddressLine1());
            customer.setShippingAddressLine2(dto.getShippingAddressLine2());
            customer.setShippingCity(dto.getShippingCity());
            customer.setShippingState(dto.getShippingState());
            customer.setShippingStateCode(dto.getShippingStateCode());
            customer.setShippingPincode(dto.getShippingPincode());
            customer.setShippingCountry(dto.getShippingCountry());
        }

        customer.setPaymentTermsDays(dto.getPaymentTermsDays());
        customer.setActive(dto.getActive() == null || dto.getActive());
    }

    private CustomerDto toDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setTenantId(customer.getTenantId());
        dto.setCode(customer.getCode());
        dto.setLegalName(customer.getLegalName());
        dto.setTradeName(customer.getTradeName());
        dto.setCustomerType(customer.getCustomerType());
        dto.setGstRegistrationType(customer.getGstRegistrationType());
        dto.setGstin(customer.getGstin());
        dto.setPan(customer.getPan());
        dto.setContactPerson(customer.getContactPerson());
        dto.setPhone(customer.getPhone());
        dto.setEmail(customer.getEmail());

        dto.setBillingAddressLine1(customer.getBillingAddressLine1());
        dto.setBillingAddressLine2(customer.getBillingAddressLine2());
        dto.setBillingCity(customer.getBillingCity());
        dto.setBillingState(customer.getBillingState());
        dto.setBillingStateCode(customer.getBillingStateCode());
        dto.setBillingPincode(customer.getBillingPincode());
        dto.setBillingCountry(customer.getBillingCountry());

        dto.setShippingSameAsBilling(customer.isShippingSameAsBilling());
        dto.setShippingAddressLine1(customer.getShippingAddressLine1());
        dto.setShippingAddressLine2(customer.getShippingAddressLine2());
        dto.setShippingCity(customer.getShippingCity());
        dto.setShippingState(customer.getShippingState());
        dto.setShippingStateCode(customer.getShippingStateCode());
        dto.setShippingPincode(customer.getShippingPincode());
        dto.setShippingCountry(customer.getShippingCountry());

        dto.setPaymentTermsDays(customer.getPaymentTermsDays());
        dto.setActive(customer.isActive());

        dto.setCreatedAt(customer.getCreatedAt());
        dto.setUpdatedAt(customer.getUpdatedAt());
        dto.setCreatedBy(customer.getCreatedBy());
        dto.setUpdatedBy(customer.getUpdatedBy());
        dto.setVersion(customer.getVersion());

        return dto;
    }
}