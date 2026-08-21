# Project TODO

- [x] Define invoice, customer, product, line-item, and status-history database tables with user ownership.
- [x] Build protected tRPC procedures for customers, products, invoices, totals, status changes, and bilingual data rendering.
- [x] Create the responsive blue-and-white dashboard layout with bilingual sidebar navigation and language toggle.
- [x] Build customer management with create, edit, delete, validation, and empty states.
- [x] Build product/service catalog management with create, edit, delete, default pricing, and validation.
- [x] Build invoice creation and editing with customer selection, dynamic line items, tax/VAT, discount, and real-time totals.
- [x] Build a searchable, filterable, and sortable invoice list with draft, sent, paid, and overdue statuses.
- [x] Build a bilingual invoice detail and print-ready preview with business, customer, line-item, and total sections.
- [x] Add browser printing and PDF export for bilingual invoice output.
- [x] Integrate credential-ready direct invoice email sending from the invoice detail page, pending a verified Resend sender configuration.
- [x] Add client and server Vitest coverage for invoice total calculations, bilingual email content, and protected authentication behavior.
- [x] Verify responsive layouts, accessibility, primary workflows, and browser console health.
- [x] Build an invoice edit route that loads an existing invoice into the form and saves changes end-to-end.
- [x] Add visible sortable invoice table columns for number, customer, due date, amount, and status.
- [x] Add client-side tests for bilingual language switching, total rendering, sortable columns, and invoice detail actions.
- [x] Add server tests confirming protected invoice data procedures reject unauthenticated access.
- [x] Execute documented create, edit, status, print/PDF, and credential-ready email-path workflow checks without inserting test business records.
- [x] Verify keyboard access, accessible labels, focus treatment, and semantic controls for the core forms and navigation.
- [x] Add UI-level tests for locale switching, invoice totals, sortable table header interactions, and invoice detail actions.
- [x] Add unauthenticated rejection coverage for invoice-specific protected procedures.
- [x] Perform executable create, edit, status, PDF, and email-error-path workflow checks without modifying user business data.
- [x] Run explicit keyboard and semantic accessibility checks for primary controls and document the results.
- [x] Add a component test that clicks invoice sortable headers and verifies rendered row order changes.
- [x] Add explicit keyboard-accessibility tests for sidebar navigation, core invoice controls, and action buttons.
- [x] Add a focused keyboard-accessibility test for the sidebar navigation controls.
- [x] Add Enter/Space activation and focus-order checks for sidebar navigation controls.
- [x] Add Space-key activation and Tab-based traversal checks for sidebar navigation controls.

- [x] Rebrand the application to invoice-gen.net in the website title, header, footer, and invoice output.
- [x] Add a global language selector covering the application UI and invoice document output with a broad supported-language catalog.
- [x] Add a global currency selector with localized currency symbols and invoice total formatting.
- [x] Add temporary invoice mode that permits invoice generation with unsaved customer details and does not require creating a customer record.
- [x] Add tests and responsive validation for the new brand, language, currency, and temporary-invoice flows.
- [x] Save a new checkpoint for the invoice-gen.net update.

### Implementation assumptions

- The initial language catalog will include the most widely used global languages with native labels and a fallback strategy for unsupported copy.
- Currency selection will be persisted per user preference and stored on each saved invoice so historical invoices keep their original currency.
- Temporary invoices will support preview, print, PDF download, and email only when a valid recipient email is supplied; they will not be persisted as invoices unless the user explicitly saves them.
- The existing BDT-based records will remain compatible and default to BDT until a different currency is selected.

### References

- [1]: https://www.unicode.org/cldr/ Unicode CLDR locale and currency data.
- [2]: https://www.iso.org/iso-4217-currency-codes.html ISO 4217 currency code standard.
- [3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat JavaScript Intl.NumberFormat reference.

References: [1] [2] [3]

Rules: Prefer Intl locale and currency formatting over handwritten symbol tables. Keep saved invoice currency immutable after creation unless the user explicitly edits it. Treat temporary invoice customer data as transient and avoid inserting it into the customer table automatically.

Success criteria: The header and footer visibly use invoice-gen.net; the language and currency selectors update UI/invoice output; a user can make a preview-ready invoice without creating a customer; existing flows continue to pass type checks and tests.

- [x] Limit the language selector to locales with real UI/invoice translations or add real localization coverage and locale-aware invoice output for each exposed language.
- [x] Prevent mixed-currency dashboard totals from being summed under one selected currency; group summary values by currency or clearly label them.
- [x] Add executable tests for temporary invoice creation and preview behavior.
- [x] Run fresh desktop and mobile visual validation after the invoice-gen.net, language, currency, and temporary-invoice changes.
- [x] Prevent invoice-gen.net mobile header branding from wrapping or clipping at narrow viewport widths.
- [x] Add a component test that switches NewInvoice into temporary mode, fills unsaved customer data, submits, and verifies transient session data and navigation.
- [x] Add a component test for TemporaryInvoice that verifies preview rendering plus print/PDF actions when temporary data exists.
- [x] Make temporary mode controls stable for accessible component testing and keep form submission behavior consistent across modes.
- [x] Restore a semantic submit path for the primary invoice action and verify saved and temporary modes submit consistently.
- [x] Add an executable keyboard/form submission test for the primary invoice action in both saved and temporary modes.
- [x] Add a saved-customer keyboard/form-submit test that verifies the create mutation fires without a click.
- [x] Add a temporary-customer keyboard/form-submit test that verifies transient session data and navigation without a click.

- [x] Create a public invoice-gen.net landing page for visitors who are not signed in.
- [x] Add public navigation, hero section, product explanation, feature sections, trust-oriented messaging, and clear sign-in/get-started CTAs.
- [x] Keep the invoice dashboard and management routes protected and reachable from the public site.
- [x] Add public-site SEO metadata, semantic structure, responsive behavior, and accessible navigation.
- [x] Add automated coverage and fresh desktop/mobile visual validation for the public website.
- [x] Save a checkpoint for the public-facing invoice-gen.net website update.
- [x] Add invoice-gen.net public SEO title, description, canonical, language, and social preview metadata.
- [x] Add an automated assertion covering the public page metadata contract.
- [x] Expand the SEO contract test to cover HTML language metadata and the full declared Open Graph/Twitter metadata set.

- [x] Redesign the public header with stronger branding, improved navigation, language access, and clearer conversion actions.
- [x] Redesign the public footer with product links, resource links, app access, contact context, and a stronger brand close.
- [x] Create a bilingual SEO-friendly blog index with category filters or topic grouping and article cards.
- [x] Create initial original blog article pages focused on practical invoicing, small-business billing, currencies, and payment workflows.
- [x] Add article metadata, canonical URLs, Open Graph/Twitter tags, structured data, sitemap/robots coverage, and internal linking for the blog.
- [x] Add public-site tests and responsive visual validation for the polished header, footer, blog index, and article pages.
- [x] Save a checkpoint for the premium public website and blog update.
- [x] Add route-aware per-article canonical, Open Graph, and Twitter metadata and test the metadata values.
- [x] Run fresh mobile visual validation for the blog index and at least one article page, including responsive header and footer behavior.
- [x] Inject per-article canonical, Open Graph, Twitter, and BlogPosting metadata into the initial HTML response for /blog/:slug routes.
- [x] Validate delivered HTML for a blog article route, not only hydrated browser DOM metadata.

### Guest invoice and SEO expansion

- [x] Add a public guest invoice generator entry point that does not require sign-in.
- [x] Keep saved invoices, customer records, and protected workspace actions behind authentication.
- [x] Make guest invoice creation smooth with clear steps, validation, autosave-in-session, preview, print, and PDF output.
- [x] Add professional conversion copy explaining guest mode versus saved workspace mode.
- [x] Expand SEO metadata and structured content for the public generator route.
- [x] Verify sitemap, robots directives, canonical URLs, social metadata, and crawler-visible HTML for public routes.
- [x] Add automated tests for guest invoice creation, protected saved actions, responsive access, and SEO contracts.
- [x] Run fresh desktop/mobile visual validation and save a final checkpoint for the guest invoice experience.

### Guest-flow follow-up validation

- [x] Autosave and restore guest invoice draft fields in session storage while editing.
- [x] Add automated guest route and mobile-access contract coverage.
- [ ] Save a checkpoint after the guest invoice expansion and final validation.
