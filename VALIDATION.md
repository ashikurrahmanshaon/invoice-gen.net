# InvoiceFlow Validation Record

## Automated checks

The project currently passes `pnpm check` and `pnpm test`. The test suite covers invoice arithmetic in integer poisha, Bangla invoice-email presentation, unauthenticated protected-procedure rejection, sortable invoice list behavior, and authenticated logout behavior.

## Runtime and responsive review

The web application is running through the managed development preview. Dashboard, invoice-list, customer-management, and product-management pages were reviewed at desktop (1280 px) and mobile (390 px) widths. The forms retain visible labels, controls retain keyboard-focus styling through the shared form styles, icon-only actions have accessible names, and the invoice table provides button-based sortable headers.

## Primary workflow readiness

The application contains end-to-end create, edit, status-change, print, PDF-download, and email-send code paths. Empty workspace states were observed in the preview, so no user business records were inserted only for testing. PDF output is generated in the browser from the print-ready invoice layout. Invoice email delivery validates customer email, attaches the generated PDF, updates a sent status when appropriate, and intentionally reports a configuration error until `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are supplied for a verified Resend sender.

