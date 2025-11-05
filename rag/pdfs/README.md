# PDF Organization Guide

## Place your PDF files here organized by product ID

Create one folder per product, using the **exact product_id** from your database.

## Expected Structure

```
pdfs/
├── HP-PROBOOK-440-G11/
│   └── spec.pdf (or any .pdf file)
├── HP-PROBOOK-445-G11/
│   └── spec.pdf
├── HP-PROBOOK-460-G11/
│   └── spec.pdf
├── HP-PROBOOK-465-G11/
│   └── spec.pdf
├── HP-PROBOOK-4-G1I-NOTEBOOK/
│   └── spec.pdf
├── LENOVO-THINKPAD-E14-GEN6-AMD/
│   └── spec.pdf
├── LENOVO-THINKPAD-E14-GEN7-AMD/
│   └── spec.pdf
├── LENOVO-THINKPAD-E14-GEN7-INTEL/
│   └── spec.pdf
├── LENOVO-THINKPAD-E16-GEN2-AMD/
│   └── spec.pdf
└── LENOVO-THINKPAD-T16-GEN4-INTEL/
    └── spec.pdf
```

## Important Rules

1. **Folder names MUST match product_id** from database exactly
   - Check your database for exact product IDs
   - Use uppercase, hyphens, etc. exactly as in database

2. **PDF file names don't matter**
   - Can be named anything (spec.pdf, manual.pdf, datasheet.pdf)
   - All .pdf files in the folder will be processed

3. **Multiple PDFs per product**
   - You can have multiple PDF files per product
   - All will be processed and combined

## How to Get Product IDs

Run this query in your database:

```sql
SELECT product_id FROM products;
```

Or check the API:

```powershell
curl https://laptop-insights-api.proudstone-99ac53cb.eastus.azurecontainerapps.io/api/v1/products
```

## After Adding PDFs

1. Process PDFs:
   ```powershell
   python pdf_processor.py
   ```

2. Upload to Azure:
   ```powershell
   python indexer.py
   ```

3. Test search:
   ```powershell
   python test_search.py
   ```

## Where to Get PDFs

- Manufacturer websites
- Product specification sheets
- User manuals
- Technical documentation

Make sure PDFs contain text (not scanned images) for best results!
