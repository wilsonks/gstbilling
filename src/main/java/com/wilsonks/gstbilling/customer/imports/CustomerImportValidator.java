package com.wilsonks.gstbilling.customer.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelRowAware;
import com.wilsonks.gstbilling.bulk.excel.ExcelRowError;
import com.wilsonks.gstbilling.customer.CustomerDto;
import com.wilsonks.gstbilling.customer.CustomerValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CustomerImportValidator {

    private final CustomerValidator validator;

    public List<ExcelRowError> validate(
            CustomerDto dto) {

        List<ExcelRowError> errors =
                new ArrayList<>();

        try {

            validator.validateForCreateOrUpdate(
                    dto);

        } catch (Exception ex) {

            int row = dto.getExcelRowNumber();

            errors.add(
                    new ExcelRowError(
                            row,
                            "ROW",
                            null,
                            ex.getMessage()));
        }

        return errors;
    }
}