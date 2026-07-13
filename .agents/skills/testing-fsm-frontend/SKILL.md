---
name: testing-fsm-frontend
description: Test the FSM-Frontend Angular app (Dashboard, Iş Emirleri, Teknisyenler, Müşteriler, Envanter) end-to-end. Use when verifying UI changes to any FSM page.
---

# Testing FSM-Frontend

Angular 21 standalone SPA, Tailwind dark theme, signal-based page switching (no router). Sidebar buttons call `page.set(...)`; `app.html` renders each page in `@if (page() === '...')` blocks.

## Run it
```
npm install
npx ng serve --host 0.0.0.0 --port 4200   # http://localhost:4200
npx ng build --configuration development     # build gate; no lint target exists
```
No `ng lint` or CI test target is configured. `ng build` is the only static gate.

**Node version gotcha:** Angular CLI needs Node ≥20.19/22.12. A fresh one-shot shell may default to Node 20.18 and fail with "requires a minimum Node.js version". Use Node 22 first: `source ~/.nvm/nvm.sh && nvm use 22` (or prepend `/home/ubuntu/.nvm/versions/node/v22.12.0/bin` to PATH).

## Backend caveat (important)
The frontend calls a .NET backend at `https://localhost:7190/api` (see `DashboardService` and the technician/customer services). That backend is usually NOT running in the Devin VM. When it's down, list pages render their **error banner** ("... yüklenemedi. Backend bağlantısını kontrol edin.") and **empty-state** — this is expected, not a bug.

Verifiable WITHOUT the backend:
- Navigation / component mounting from the sidebar.
- Reactive-form validation in create modals (fully client-side): open modal, submit empty → required errors ("... zorunludur.") appear and modal stays open; typing into a field clears its error live.

NOT verifiable without the backend (mark untested): populated lists, technician workload color badges (0=green / 1-3=amber / 4+=red), availability PATCH toggle, POST create success, customer history/timeline drawer. To verify these, stand up the backend first or ask the user.

**Testing data-driven features (search filters, signal-based CRUD) without the backend:** the services live at `src/app/**/*.service.ts` (e.g. `features/inventories/inventory.service.ts`). To exercise the real component logic (search `computed`, `items.update()` add/edit/delete, reactive validators) you can TEMPORARILY stub a service to return in-memory data via `of(...)` guarded by a `const TEST_STUB = true;` flag — only HTTP is faked, all component logic runs. This lets you prove the whole feature end-to-end. ALWAYS `git checkout <service>` to revert the stub before committing; never commit it. Disclose the stub clearly in the test report / PR comment.

## Envanter (Inventory) module
Sidebar "Envanter" (~y 305) → `page.set('inventories')`, rendered at `app.html` `@if (page() === 'inventories')`. Data table with top search box filtering by name/SKU (client-side `filteredItems = computed()`), "Yeni Ekle" + row "Düzenle"/"Sil". Shared create/edit Tailwind modal (`inventory-modal.component`) with validators: name 2-100, skuCode 3-50, stockQuantity ≥0, unitPrice ≥0.1. Error texts: "Ürün adı zorunludur.", "SKU kodu zorunludur.", "Fiyat en az 0.1 olmalıdır.". Delete uses a native `confirm()` dialog (click OK to proceed).

## Navigation map (sidebar y-coords at 1024x768, maximized)
Dashboard ~185, İş Emirleri ~216, Teknisyenler ~246, Müşteriler ~276, Ayarlar ~333.

## Recording tips
- Maximize first: `sudo apt-get install -y wmctrl 2>/dev/null; wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.
- The annotated DOM returned with each screenshot is reliable for asserting text (error labels, headings); use it alongside the screenshot.

## Devin Secrets Needed
None. (No auth; backend is local and typically unavailable.)
