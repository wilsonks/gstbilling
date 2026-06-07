package com.wilsonks.gstbilling.bulk.excel;

import java.util.List;
import java.util.Optional;

public interface BulkImportModule<T> {

    String entityName();

    List<ExcelColumn> columns();

    List<ExcelRowError> validate(T dto);

    String duplicateKey(T dto);

    Optional<?> findMatch(Long tenantId, T dto);

    void create(T dto);

    void update(Object existing, T dto);
}