# Template-Based Bulk Import/Export Framework
This document outlines the design and implementation of a template-based bulk import/export framework. The framework is designed to handle large data sets efficiently while providing flexibility through the use of templates.

For a GST Billing product, don't start with Apache POI code first.

Start with the architecture so that when you later add:

1. [ ] Customers
2. [ ] Products
3. [ ] Companies
4. [ ] Vendors
5. [ ] HSN Codes
6. [ ] Price Lists

Our goal is  all should use

**ONE Excel Engine**

Add Apache POI Dependency

Maven:

```java

<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.4.1</version>
</dependency>

```

## Phase 1 - Introduce Bulk Module

The first phase of the import/export framework is to introduce a bulk module that can handle large data sets efficiently. This module will be responsible for processing data in batches, reducing memory usage and improving performance.

```
com.wilsonks.gstbilling.bulk
```

```
bulk
├── controller
├── service
├── excel
├── model
├── validation
└── customer
```

## Phase 2 - Import Lifecycle
Design the flow first.

```aidl
Upload Excel
      ↓
Read Workbook
      ↓
Convert Row → DTO
      ↓
Validate Row
      ↓
Build Validation Report
      ↓
Show Errors
      ↓
Commit
      ↓
Insert / Update
      ↓
Import Summary
```

## Phase 3 - Create Import Job Model
The import job model will represent the state of an import operation, including the data being imported, validation results, and any errors encountered.

```java
public class ImportJob {

    UUID jobId;

    String entityType;

    int totalRows;

    int validRows;

    int invalidRows;

    ImportStatus status;
}
```

```java
public enum ImportStatus {

    VALIDATING,

    VALIDATION_FAILED,

    READY_TO_IMPORT,

    IMPORTING,

    COMPLETED
}
```

## Phase 4 - Create Validation Error Model

```java
public record ImportError(
        int rowNumber,
        String column,
        String message
) {
}
```

## Phase 5 - Create Import Summary

```java
public record ImportSummary(

        int totalRows,

        int inserted,

        int updated,

        int failed,

        List<ImportError> errors
) {
}
```

## Phase 6 - Define Customer Excel Template
The customer Excel template will define the structure of the data that needs to be imported for customers. 
This includes columns such as Customer Name, GSTIN, Address, etc.


## Phase 7 - Define Matching Rules
Matching rules will be defined to determine how existing records are identified during the import process. For example, customers may be matched based on their GSTIN or a combination of their name and address.

Look at the repository and identify the unique constraints and indexes to determine the matching rules.


```
ID exists?
   YES → UPDATE

NO

CODE exists?
   YES → UPDATE

NO

GSTIN exists?
   YES → UPDATE

NO

INSERT
```
## Phase 8 - Repository Enhancements


```java
Optional<Customer>
findByTenantIdAndGstinIgnoreCase(
        Long tenantId,
        String gstin);
```

```java
Optional<Customer>
findByIdAndTenantId(
        Long id,
        Long tenantId);
```

## Phase 9 - Create Customer Excel Mapper

Do not let Apache POI know about JPA.

```java
@Component
public class CustomerExcelMapper {
}
```

```aidl
Excel Row
    ↓
CustomerDto
```
and
```aidl
CustomerDto
    ↓
Excel Row
```

## Phase 10 - Create CustomerImportService

```java
@Service
@RequiredArgsConstructor
public class CustomerImportService {

    private final CustomerRepository repo;

    private final CustomerValidator validator;

    private final CustomerExcelMapper mapper;
}
```

Huge win:

Every API validation rule automatically applies to Excel imports.

No duplication

## Phase 12 - Upsert Phase

The upsert phase will handle both inserting new records and updating existing records based on the defined matching rules. This will ensure that the import process is efficient and does not create duplicate records.

```java
if (customerDto.getId() != null) {
    // Update existing record
    Optional<Customer> existingCustomer = repo.findByIdAndTenantId(customerDto.getId(), tenantId);
    if (existingCustomer.isPresent()) {
        // Update logic
    } else {
        // Handle case where ID does not exist
    }
} else if (customerDto.getGstin() != null) {
    // Match based on GSTIN
    Optional<Customer> existingCustomer = repo.findByTenantIdAndGstinIgnoreCase(tenantId, customerDto.getGstin());
    if (existingCustomer.isPresent()) {
        // Update logic
    } else {
        // Insert new record
    }
} else {
    // Insert new record
}
```

## Phase 13 - Reuse CustomerService

This is the most important refinement.
The CustomerService should be reused for both API and Excel imports to ensure that all business logic and validation rules are consistently applied. This will also reduce code duplication and make maintenance easier.


```java
CustomerDto create(CustomerDto dto)

CustomerDto update(
Long id,
CustomerDto dto)

```
This guarantees:

* same validation
* same normalization
* same audit
* same tenant rules
* same duplicate checks

for both API and Excel.

## Phase 14 - API Endpoints

Add to CustomerController:

```java
POST /api/customers/import/validate

POST /api/customers/import/commit

GET /api/customers/export
```

## Phase 15 - Metadata Driven Excel Framework
The final phase of the framework will be to make it metadata-driven, allowing for dynamic handling of different entity types without the need for hardcoding specific logic for each entity. This will involve creating a generic import/export service that can handle any entity type based on its metadata configuration.

### Create ExcelColumn Definition
```java
package com.wilsonks.gstbilling.bulk.excel;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExcelColumn<T> {

    private String header;

    private boolean required;

    private boolean hidden;

    private Class<?> dataType;

    private ValueReader<T> reader;

    private ValueWriter<T> writer;
}
```

### Reader Functional Interface
```java
package com.wilsonks.gstbilling.bulk.excel;

@FunctionalInterface
public interface ValueReader<T> {

    void read(
            T target,
            String value);
}
```

### Writer Functional Interface
```java
package com.wilsonks.gstbilling.bulk.excel;

@FunctionalInterface
public interface ValueWriter<T> {

    Object write(T source);
}
```

## Phase 16 - Customer Template Definition


## Define CustomerExcelDefinition as a Spring Component that will provide the column definitions for the customer Excel template.

```java
package com.wilsonks.gstbilling.customer.imports;

@Component
public class CustomerExcelDefinition {
}   
```

## Define columns() method that returns the list of columns for the customer Excel template.

```java
public List<ExcelColumn<CustomerDto>> columns() {

    return List.of(

        ExcelColumn.<CustomerDto>builder()
            .header("ID")
            .hidden(true)
            .dataType(Long.class)
            .reader((dto,v) ->
                 dto.setId(Long.valueOf(v)))
            .writer(CustomerDto::getId)
            .build(),

        ExcelColumn.<CustomerDto>builder()
            .header("CODE")
            .required(true)
            .dataType(String.class)
            .reader(CustomerDto::setCode)
            .writer(CustomerDto::getCode)
            .build()
    );
}   
```

Result

The framework learns:

Customer has 28 columns

without hardcoding.


## Phase 17 - Generic Excel Reader

The generic Excel reader will be responsible for reading Excel files and mapping the data to DTOs based on the column definitions provided by the Excel definition classes.

```java
package com.wilsonks.gstbilling.bulk.excel;

@Component
public class ExcelReader {
}
```

```aidl
public <T> List<T> read(
        InputStream stream,
        Supplier<T> supplier,
        List<ExcelColumn<T>> columns)
```

The read method will take an InputStream of the Excel file, a Supplier to create instances of the target DTO, and a list of ExcelColumn definitions to map the data correctly. It will return a list of populated DTOs based on the data in the Excel file.


Reader should now work for:

* CustomerDto
* ProductDto
* CompanyDto

without changes.

## Phase 18 - Generic Excel Writer

```java
@Component
public class ExcelWriter {
}
```

```java
public <T> byte[] write(
        List<T> rows,
        List<ExcelColumn<T>> columns)
```

Now Export becomes generic.

## Phase 19 - Generic Validation Engine

The generic validation engine will be responsible for validating the imported data based on the column definitions and any additional validation rules defined in the DTOs or service layer. It will ensure that all data is valid before it is processed for insertion or updating in the database.

```java
public interface ImportValidator<T> {

    List<ImportError> validate(
            int rowNumber,
            T row);
}
```

```java
@Component
@RequiredArgsConstructor
public class CustomerImportValidator
        implements ImportValidator<CustomerDto> {
}
```

## Phase 20 - Generic Import Processor
The generic import processor will handle the entire import process, including reading the Excel file, validating the data, and performing the necessary insertions or updates in the database. It will use the generic Excel reader and validation engine to ensure that the process is efficient and consistent across different entity types.

```java
public interface ImportProcessor<T> {

    ValidationResponse validate(
            MultipartFile file);

    ImportSummary commit(
            MultipartFile file);
}
```

```java
@Service
@RequiredArgsConstructor
public class CustomerImportProcessor
       implements ImportProcessor<CustomerDto> {
}
```

## Phase 21 - Matching Strategy Abstraction

The matching strategy abstraction will allow for different matching strategies to be defined and used during the import process. This will enable the framework to handle various scenarios for identifying existing records, such as matching by ID, code, or other unique attributes.

```java
public interface MatchStrategy<T,E> {

    Optional<E> findMatch(T dto);
}
```

```java
@Component
@RequiredArgsConstructor
public class CustomerMatchStrategy
        implements MatchStrategy<
            CustomerDto,
            Customer> {
}
```

## Phase 22 - Generic Export Service

The generic export service will handle the export of data to Excel files based on the column definitions provided by the Excel definition classes. It will use the generic Excel writer to generate the Excel file and return it as a byte array for download.

```java
public interface ExportService<T> {

    byte[] export();
}

```

```java
@Service
@RequiredArgsConstructor
public class CustomerExportService
        implements ExportService<CustomerDto> {
}
```

## Final Architecture

```aidl
bulk
├── controller
├── service
├── excel
├── model
├── validation
└── customer
```

```aidl
bulk
│
├── excel
│   ├── ExcelColumn
│   ├── ExcelReader
│   ├── ExcelWriter
│   └── ExcelTemplateBuilder
│
├── validation
│   ├── ImportValidator
│   ├── ImportError
│   └── ValidationResponse
│
├── importer
│   ├── ImportProcessor
│   └── MatchStrategy
│
└── model
    ├── ImportSummary
    └── ImportJob
```

```aidl
customer
│
├── CustomerExcelDefinition
├── CustomerImportValidator
├── CustomerMatchStrategy
├── CustomerImportProcessor
└── CustomerExportService
```
A ReUSable, Scalable, and Maintainable framework for Excel Import/Export in the GST Billing System.
BulkImportModal.jsx

✓ Hidden file input
✓ Chakra "Choose Excel File" button
✓ Selected file card
✓ Download Template
✓ Validate
✓ Commit
✓ Validation Summary
✓ Commit Summary
✓ Error rendering
✓ Proper state reset
✓ Loading states
✓ Chakra UI formatting
✓ Ready for Customers/Products/Companies reuse


So before commit, need a preview grid.

```

Validation Summary
--------------------------------

Total Rows      10
Valid Rows       8
Invalid Rows     2

--------------------------------

Preview Rows

Row | Status | Code | Legal Name | GSTIN | Error

3   | ✓      | C001 | ABC Ltd    | ...   |
4   | ✗      | C002 | XYZ Ltd    | ...   | GSTIN Invalid
5   | ✓      | C003 | PQR Ltd    | ...   |

--------------------------------

```

Upload File
↓
Validate
↓
Summary Cards
↓
Preview Table
↓
Validation Errors
↓
Commit Import


✓ Template Download
✓ Excel Upload
✓ Header Validation
✓ DTO Mapping
✓ Row-Level Validation
✓ Duplicate Detection
✓ Validation Preview Grid
✓ Commit Import
✓ Error Workbook Export
✓ Raw Value Preservation


1. Finish Download Errors.xlsx
2. Product Import
3. Company Import
4. Import History
5. Generic BulkImportModule<T>
6. Async Imports