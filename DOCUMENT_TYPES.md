# Transaction Document Types

The following document types are used in the transaction system:
- Tax Invoice
- Proforma Invoice 
- Credit Note 
- Debit Note


First, make sure Invoice itself stores:

private DocumentType documentType;
If this is not already in the Invoice entity/DTO/request, that is the first backend change.

So for credit/debit note, I strongly recommend adding:


private Long referenceInvoiceId;
private String referenceInvoiceNo;



## Tax Invoice 

Normal finalized sale document.

## Proforma Invoice

Usually:

non-posting / non-final tax document
quote-like or preliminary commercial invoice
may not affect final accounting/inventory depending on your business model

## Credit Note
   Usually:

reduces taxable value / tax liability
should reference original invoice
amounts may be negative logically, or stored positive with note semantics 

## Debit Note
   Usually:

increases amount receivable
should reference original invoice



## Invoice table
Keep one invoice table for all 4 document types.

Add:

* document_type
* reference_invoice_id nullable
* reason nullable

This is simpler than separate tables.

phase 1 backend refactor for document types
This version supports:

TAX_INVOICE
PROFORMA_INVOICE

Frontend Working
create Tax Invoice
create Proforma Invoice
list page shows Type
details page shows dynamic document title
print/download PDF still works

AppRouter.jsx to support:

tax invoice pages
proforma invoice pages

Sidebar to support:
tax invoice menu
proforma invoice menu

Update DemoSeeder.java like this so each company gets the same number of proforma invoices as tax invoices.

What changed
invoice sequences are created for both:
TAX_INVOICE
PROFORMA_INVOICE

invoice seeding now creates:
INVOICES_PER_COMPANY tax invoices
INVOICES_PER_COMPANY proforma invoices

sequence current number is updated per document type
invoice entity gets documentType

generate the backend changes for:

Invoice.java
CreateInvoiceRequest.java
InvoiceDto.java
InvoiceValidator.java
InvoiceService.java
so that:

CREDIT_NOTE and DEBIT_NOTE are both supported
both require referenceInvoiceId
both validate against an existing tax invoice