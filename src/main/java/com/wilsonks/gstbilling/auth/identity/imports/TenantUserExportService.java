package com.wilsonks.gstbilling.auth.identity.imports;


import com.wilsonks.gstbilling.auth.identity.TenantUserService;
import com.wilsonks.gstbilling.auth.identity.User;
import com.wilsonks.gstbilling.auth.identity.UserRepository;
import com.wilsonks.gstbilling.bulk.excel.ExcelWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantUserExportService {

    private final TenantUserService tenantUserService;

    private final TenantUserExcelDefinition excelDefinition;

    private final ExcelWriter excelWriter;

    public byte[] exportUsers() {

        List<TenantUserExportRow> rows =
                tenantUserService.getMine()
                        .stream()
                        .map(this::toExportRow)
                        .toList();

        return excelWriter.write("Users", rows, excelDefinition.columns());
    }

    private TenantUserExportRow toExportRow(TenantUserImportDto user) {

        TenantUserExportRow row = new TenantUserExportRow();

        row.setUsername(user.getUsername());

        row.setEmail(user.getEmail());

        row.setRoles(String.join(",", user.getRoles()));

        row.setActive(user.getActive());

        return row;
    }
}