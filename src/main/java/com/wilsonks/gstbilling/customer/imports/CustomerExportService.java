package com.wilsonks.gstbilling.customer.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelWriter;
import com.wilsonks.gstbilling.customer.CustomerDto;
import com.wilsonks.gstbilling.customer.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerExportService {

    private final CustomerService customerService;

    private final CustomerExcelDefinition excelDefinition;

    private final ExcelWriter excelWriter;

    public byte[] export() {

        List<CustomerDto> customers = customerService.getAllForCurrentTenant();

        log.info("Exporting {} customers", customers.size());

        return excelWriter.write("Customers", customers, excelDefinition.columns());
    }

    public byte[] export(List<CustomerDto> customers) {

        log.info("Exporting {} supplied customers", customers.size());

        return excelWriter.write("Customers", customers, excelDefinition.columns());
    }
}