package com.wilsonks.gstbilling.product.imports;

import com.wilsonks.gstbilling.bulk.excel.ExcelWriter;
import com.wilsonks.gstbilling.product.ProductDto;
import com.wilsonks.gstbilling.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductExportService {

    private final ProductService productService;

    private final ProductExcelDefinition excelDefinition;

    private final ExcelWriter excelWriter;

    public byte[] exportProducts() {

        List<ProductDto> products = productService.getAllForCurrentTenant();

        return excelWriter.write("Products", products, excelDefinition.columns());
    }
}