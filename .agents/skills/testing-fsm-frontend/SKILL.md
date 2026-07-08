---
name: testing-fsm-frontend
description: Test the FSM-Frontend Angular app (Dashboard, Iş Emirleri, Teknisyenler, Müşteriler) end-to-end. Use when verifying UI changes to any FSM page.
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

## Backend caveat (important)
The frontend calls a .NET backend at `https://localhost:7190/api` (see `DashboardService` and the technician/customer services). That backend is usually NOT running in the Devin VM. When it's down, list pages render their **error banner** ("... yüklenemedi. Backend bağlantısını kontrol edin.") and **empty-state** — this is expected, not a bug.

Verifiable WITHOUT the backend:
- Navigation / component mounting from the sidebar.
- Reactive-form validation in create modals (fully client-side): open modal, submit empty → required errors ("... zorunludur.") appear and modal stays open; typing into a field clears its error live.

NOT verifiable without the backend (mark untested): populated lists, technician workload color badges (0=green / 1-3=amber / 4+=red), availability PATCH toggle, POST create success, customer history/timeline drawer. To verify these, stand up the backend first or ask the user.

## Navigation map (sidebar y-coords at 1024x768, maximized)
Dashboard ~185, İş Emirleri ~216, Teknisyenler ~246, Müşteriler ~276, Ayarlar ~333.

## Recording tips
- Maximize first: `sudo apt-get install -y wmctrl 2>/dev/null; wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.
- The annotated DOM returned with each screenshot is reliable for asserting text (error labels, headings); use it alongside the screenshot.

## Devin Secrets Needed
None. (No auth; backend is local and typically unavailable.)
