package com.wilsonks.gstbilling.invoice.sequence.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelWriter;
import com.wilsonks.gstbilling.company.Company;
import com.wilsonks.gstbilling.company.CompanyRepository;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceDto;
import com.wilsonks.gstbilling.invoice.sequence.InvoiceSequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceSequenceExportService {

    private final InvoiceSequenceService service;

    private final InvoiceSequenceExcelDefinition excelDefinition;

    private final ExcelWriter excelWriter;

    private final CompanyRepository companyRepository;

    public byte[] exportSequences() {

        List<InvoiceSequenceExportRow> rows =
                service.getForCurrentTenant()
                        .stream()
                        .map(this::toExportRow)
                        .toList();

        return excelWriter.write(
                "Invoice Sequences",
                rows,
                excelDefinition.columns()
        );
    }

    private InvoiceSequenceExportRow toExportRow(
            InvoiceSequenceDto dto) {

        String companyName =
                companyRepository
                        .findById(dto.getCompanyId())
                        .map(Company::getName)
                        .orElse("");

        InvoiceSequenceExportRow row =
                new InvoiceSequenceExportRow();

        row.setId(dto.getId());
        row.setCompanyName(companyName);
        row.setDocumentType(dto.getDocumentType());
        row.setFinancialYear(dto.getFinancialYear());
        row.setPrefix(dto.getPrefix());
        row.setSuffix(dto.getSuffix());
        row.setPaddingLength(dto.getPaddingLength());
        row.setCurrentNumber(dto.getCurrentNumber());
        row.setResetPolicy(dto.getResetPolicy());
        row.setActive(dto.getActive());

        return row;
    }
}