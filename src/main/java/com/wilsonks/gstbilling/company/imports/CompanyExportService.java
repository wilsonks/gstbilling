package com.wilsonks.gstbilling.company.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelWriter;
import com.wilsonks.gstbilling.company.CompanyDto;
import com.wilsonks.gstbilling.company.TenantCompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyExportService {

    private final TenantCompanyService companyService;

    private final CompanyExcelDefinition excelDefinition;

    private final ExcelWriter excelWriter;

    public byte[] exportCompanies() {

        List<CompanyDto> companies =
                companyService.getMine();

        return excelWriter.write(
                "Companies",
                companies,
                excelDefinition.columns()
        );
    }
}