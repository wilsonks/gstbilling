package com.wilsonks.gstbilling.common;

import com.wilsonks.gstbilling.auth.access.UserAccess;
import com.wilsonks.gstbilling.auth.access.UserAccessRepository;
import com.wilsonks.gstbilling.auth.identity.Role;
import com.wilsonks.gstbilling.auth.identity.User;
import com.wilsonks.gstbilling.auth.identity.UserRepository;
import com.wilsonks.gstbilling.auth.identity.UserScope;
import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyRepository;
import com.wilsonks.gstbilling.tenant.Tenant;
import com.wilsonks.gstbilling.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DemoSeeder implements ApplicationRunner {

    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final UserAccessRepository accessRepo;
    private final TenantRepository tenantRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(ApplicationArguments args) {

        // 1) Platform Root (SUPER_ADMIN)
        upsertPlatformUser(
                "root",
                "root@local.com",
                "root@1234",
                List.of("SUPER_ADMIN")
        );


        //Create 20 demo tenant in a loop
        //For each tenant, create a tenant admin and a demo company
        for (int i = 1; i <= 20; i++) {
            String tenantName = "Demo Tenant " + i;
            String gstin = generateGstin(i);
            String companyEmail = "demo" + i + "@company.com";

            //Create a tenant
            //1. tenantId = DEMO_TENANT_001, DEMO_TENANT_002, ..., DEMO_TENANT_020
            //2 tenantName = Demo Tenant 1, Demo Tenant 2, ..., Demo Tenant 20

            Tenant tenant = upsertTenant(tenantName, gstin, companyEmail);


            String tenantAdminUsername = "tenantadmin" + i;
            String tenantAdminEmail = "tenantadmin" + i + "@local.com";
            String tenantAdminPassword = "admin@1234";


            // Create tenant admin user
            User tenantAdmin = upsertTenantUser(
                    tenantAdminUsername,
                    tenantAdminEmail,
                    tenantAdminPassword,
                    tenant.getTenantId(),
                    List.of("ADMIN")
            );

            // Create demo company
            String companyName = "Demo Company " + i;


            Company demoCompany = upsertDemoCompany(
                    companyName,
                    gstin,
                    companyEmail,
                    tenant.getTenantId()
            );

            // Grant ADMIN access to tenant admin for the demo company
            upsertAccess(tenantAdmin.getId(), demoCompany.getId(), tenant.getTenantId(), Role.ADMIN);
        }

    }

    private String generateGstin(int i) {

        String stateCode = String.format("%02d", 10 + (i % 25)); // 10–34 valid states

        String pan = String.format("ABCDE%04dF", i); // ensures uniqueness

        String entity = String.valueOf((i % 9) + 1); // 1–9

        return stateCode + pan + entity + "Z5";
    }

    private User upsertPlatformUser(String username,
                                    String email,
                                    String rawPassword,
                                    List<String> roles) {

        User user = userRepo.findByUsername(username).orElseGet(User::new);

        user.setUsername(username);
        user.setEmail(email);

        // set password only on first create (avoid changing it every restart)
        if (user.getId() == null) {
            user.setPassword(encoder.encode(rawPassword));
        }

        user.setScope(UserScope.PLATFORM);
        user.setTenantId(null);
        user.setRoles(roles);

        return userRepo.save(user);
    }

    private Tenant upsertTenant(String name, String gstin, String contactEmail) {
        Tenant tenantDto =  Tenant.builder()
                .name(name)
                .gstin(gstin)
                .contactEmail(contactEmail)
                .active(true)
                .build();

        return tenantRepo.save(tenantDto);

    }

    private User upsertTenantUser(String username,
                                  String email,
                                  String rawPassword,
                                  Long tenantId,
                                  List<String> roles) {

        User user = userRepo.findByUsername(username).orElseGet(User::new);

        user.setUsername(username);
        user.setEmail(email);

        // set password only on first create (avoid changing it every restart)
        if (user.getId() == null) {
            user.setPassword(encoder.encode(rawPassword));
        }

        user.setScope(UserScope.TENANT);
        user.setTenantId(tenantId);
        user.setRoles(roles);

        return userRepo.save(user);
    }

    private Company upsertDemoCompany(String name,
                                      String gstin,
                                      String email,
                                      Long tenantId) {

        Company c = companyRepo.findByGstin(gstin).orElseGet(Company::new);

        c.setName(name);
        c.setGstin(gstin);
        c.setEmail(email);
        c.setTenantId(tenantId);
        c.setActive(true);

        // derive minimal fields (since we bypass CompanyService/CompanyValidator here)
        if (gstin != null && gstin.length() >= 12) {
            c.setStateCode(gstin.substring(0, 2));
            c.setPan(gstin.substring(2, 12));
        }

        return companyRepo.save(c);
    }

    private void upsertAccess(Long userId, Long companyId, Long tenantId, Role role) {

        UserAccess access = accessRepo.findByUserIdAndCompanyId(userId, companyId)
                .orElseGet(UserAccess::new);

        access.setUserId(userId);
        access.setCompanyId(companyId);
        access.setTenantId(tenantId);
        access.setRole(role);
        access.setActive(true);

        accessRepo.save(access);
    }
}