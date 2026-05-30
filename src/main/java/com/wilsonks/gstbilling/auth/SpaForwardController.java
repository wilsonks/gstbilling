package com.wilsonks.gstbilling.auth;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping({
            "/",
            "/login",
            "/register",

            "/dashboard",
            "/companies",
            "/users",
            "/user-access",
            "/products",
            "/customers",
            "/invoice-sequences",
            "/invoices",
            "/invoices/new",
            "/invoices/{id}",

            "/admin",
            "/admin/tenants",
            "/admin/tenants/{id}",
            "/admin/companies",
            "/admin/companies/{id}",
            "/admin/users",
            "/admin/users/{id}",
            "/admin/user-access",
            "/admin/user-access/{id}",
            "/admin/audit-logs",
            "/admin/audit-logs/{id}",
            "/admin/metrics",
            "/admin/billing"
    })
    public String forward() {
        return "forward:/index.html";
    }
}