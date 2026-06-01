# PDF export 

## Option A — HTML print/export first
faster
easier styling
browser print-to-PDF friendly

## Option B — real backend-generated PDF
proper downloadable PDF from API
best for production

### Spring MVC
Spring MVC supports returning file responses through ResponseEntity, including setting headers like Content-Disposition and a binary body.

### OpenPDF
OpenPDF is an actively maintained open-source PDF library for Java

<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>2.2.2</version>
</dependency>

Implementation Flow
1) PDF file wrapper
2) PDF export service
3) Controller endpoint
4) Frontend API
5) Invoice details page Download PDF button
6) Add a Print Invoice button next to Download PDF on the invoice details page.



Why this approach is good , This export uses the saved invoice snapshot:

- seller snapshot
- customer snapshot
- line snapshot
- totals snapshot

So exported PDFs stay historically accurate even if product/customer/company masters change later.


## Hydrate auth at app startup



Your refresh token is in an httpOnly cookie, which is good. Persisting the access token in localStorage is a tradeoff: convenient, but less secure than memory-only storage. If you want a stronger approach later, use:

short-lived access token in memory
app bootstrap calls /api/auth/refresh
cookie-based session restoration
But for your current app and print-in-new-tab issue, localStorage persistence is the simplest fix. Browser storage like localStorage is shared across tabs for the same origin, unlike in-memory Redux state.


## Invoice PDF export implementation steps

Problem:
API auth depends on axios-added headers, and a browser-opened tab cannot automatically include those custom headers.


window.open("/api/invoices/.../export/pdf") does not use axios, so it does not attach:

Authorization: Bearer ...
X-Company-Id

Solution:
Fetch the PDF with axios as a blob, then open the blob URL in a new tab.

