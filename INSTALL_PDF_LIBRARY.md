# Install PDF Export Library

To enable PDF export functionality for order receipts, please run:

```bash
npm install html2pdf.js
```

This library allows users to export their order confirmation as a PDF file.

## Features Added:
- ✅ Fixed scrolling issue on order confirmation page
- ✅ Added "Export Receipt as PDF" button
- ✅ Professional PDF generation with proper formatting
- ✅ Loading state during PDF generation
- ✅ Error handling for PDF generation failures

## How it works:
1. User completes order and reaches confirmation page
2. Clicks "Export Receipt as PDF" button
3. PDF is generated with all order details
4. File is automatically downloaded as "Arome-Receipt-[OrderNumber].pdf"

The PDF includes:
- Order details (number, date, payment method)
- Complete item list with quantities and prices
- Shipping information
- Order totals (subtotal, shipping, tax, total)
- Professional Arome branding