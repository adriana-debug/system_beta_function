# Development Log (Plain English)

- Keep this log updated anytime we review or change the project. Do not delete older notes; add new ones under a date.

## 2025-12-10 Project Check
- There is one main setup file (`Code.gs`) that holds time zone, branding, website info, and several service keys and passwords. All of those keys are typed directly into the file.
- There was an empty file meant for AfterShip work called `stuck_with_aftership`.
- To do later: move the keys/passwords into a safer place (not in the file), change the exposed keys, and add notes once more scripts are built.

## 2025-12-10 AfterShip Helpers
- The empty `stuck_with_aftership.gs` file now has simple helpers to talk to AfterShip so we can look up or add package tracking.
- It checks that the AfterShip key is set and shows clear errors if a call fails.
- There is a small demo function with placeholder courier and tracking numbers that should be replaced before running.

## 2025-12-10 Log Update
- Log refreshed on request; no new code changes in this step.

## 2025-12-10 Codebase Facts Refresh
- Files present: `Code.gs` (setup values only) and `stuck_with_aftership.gs` (AfterShip helper functions). No other scripts are in this project right now.
- `Code.gs` holds the time zone (America/Chicago), branding name, WooCommerce site URL and keys, AfterShip key, ShipStation keys and sheet names, Amazon/FBA settings, and shared spreadsheet IDs. All keys are still typed directly into the file.
- The AfterShip helper file is the only place with working code; everything else is configuration.

## 2025-12-10 AfterShip File Check (latest)
- `stuck_with_aftership.gs` is currently empty (0 bytes). The helper code noted earlier is not present in the file anymore.
- Action needed: restore the AfterShip helper code or remove the earlier note if we intentionally cleared it.

## 2025-12-10 System Review and Lead-Time Flow
- Current files: `Code.gs` (all configuration and API keys in plain text), `amzwebsiteleadtime.gs` (lead-time report + emailer), and empty `stuck_with_aftership.gs`.
- Lead-time process (Apps Script): fetches completed WooCommerce orders modified in the last N days, filters to channel 0 plus Amazon channel IDs, computes lead days from order created to completed, writes a summary + daily table to sheet `Website + Amazon Fulfillment Lead Time`, highlights weekends, and emails a 7-day summary/trend to distro recipients.
- Dependencies that must exist elsewhere: `validateConfig`, `getResolvedConfig`, `fetchWithRetry`, `formatDuration`, `getRecipientsFromDistro`, plus globals like `SpreadsheetApp`, `MailApp`, and `Utilities`.
- Risks/gaps spotted: sensitive keys are hardcoded in `Code.gs`; AfterShip helper file is empty; no tests; the lead-time calc assumes created->completed equals awaiting-shipment->completed and might misalign if status transitions differ.

## 2025-12-10 amzwebsiteleadtime.gs Check
- File timestamp and contents match prior review (no new edits observed).
- Behavior: on each run, pulls completed WooCommerce orders modified within the lookback window (min 7 days, default 30), filters to channel 0 + Amazon channel IDs, computes lead time (order created -> completed), rebuilds the sheet `Website + Amazon Fulfillment Lead Time` from scratch, applies weekend highlighting, and emails a 7-day summary/trend.
- Data refresh model: every run recomputes all rows within the lookback window; it does not append. Older rows drop off once they fall outside the lookback. Daily numbers update to reflect whatever WooCommerce returns at run time.

## 2025-12-10 Append-Only Variant Added
- Added `amzwebsiteleadtime_append_only.gs` with `syncAmzWebsiteFulfillmentLeadTimesAppendOnly()`.
- Behavior: uses the same WooCommerce pull/filters but keeps historical rows intact; only today + yesterday (CST) are mutable. First run populates the lookback window; subsequent runs only upsert those two days and append new dates when they appear. Weekend highlighting remains. Sheet name: `Website + Amazon Fulfillment Lead Time (append-only)`.

## 2025-12-10 Append-Only Email Sender
- Added `emailAmzWebsiteFulfillmentLeadTimesAppendOnly(runSync=true)` which optionally syncs the append-only sheet, loads it, and sends an HTML summary/trend email (mirrors the original style). It uses the append-only sheet data (no historical rebuild) and notes that only today/yesterday are mutable. Sheet link points to the append-only tab.

## 2025-12-10 Append-Only Helper Shims
- Added fallback shims in `amzwebsiteleadtime_append_only.gs` for `getResolvedConfig`, `validateConfig`, `fetchWithRetry`, `formatDuration`, and `getRecipientsFromDistro` so the append-only sync/email can run in this project even if shared helpers aren't defined elsewhere. They read config from the constants in `Code.gs` and use a basic retry for fetches.

## 2025-12-11 Codebase Review
- Files present: `Code.gs` (config with plaintext keys), `amzwebsiteleadtime_rewrite.gs` (full rebuild + emailer that overwrites the sheet each run), `amzwebsiteleadtime_append_only.gs` (append-only sync + emailer with helper shims), and empty `stuck_with_aftership.gs`.
- Lead-time flows: rewrite version rebuilds `Website + Amazon Fulfillment Lead Time` every run; append-only writes to `Website + Amazon Fulfillment Lead Time (append-only)` and only mutates today/yesterday while preserving older rows. Both pull WooCommerce completed orders for the lookback window (>=7 days, default 30) and filter to channel 0 + Amazon channel IDs.
- Emailers: `emailAmzWebsiteFulfillmentLeadTimes` recomputes then emails; `emailAmzWebsiteFulfillmentLeadTimesAppendOnly` optionally syncs then emails using sheet data (no historical rebuild).
- Helper shims: append-only file contains stand-ins for config resolution, validation, fetch retry, duration formatting, and distro loading (from a `Distro` sheet) to avoid missing-reference errors.
- Risks: credentials remain hardcoded; AfterShip helper file is still empty; no tests; lead-time metric still uses created->completed as proxy for awaiting-shipment->completed.

## 2025-12-11 Append-Only Syntax Fix
- Removed non-ASCII artifacts in `amzwebsiteleadtime_append_only.gs` email body that caused a syntax error when running `syncAmzWebsiteFulfillmentLeadTimesAppendOnly` / `emailAmzWebsiteFulfillmentLeadTimesAppendOnly`. The message now uses plain ASCII text.

## 2025-12-11 Current Snapshot
- Files: `Code.gs` (config with plaintext keys), `amzwebsiteleadtime_rewrite.gs` (full rebuild + email), `amzwebsiteleadtime_append_only.gs` (append-only sync/email with helper shims), and empty `stuck_with_aftership.gs`.
- Lead-time behavior: rewrite version overwrites the sheet each run; append-only version only mutates today/yesterday and preserves older rows. Both pull Woo completions for the lookback window (>=7 days, default 30) and filter to channel 0 + Amazon channel IDs.
- Emailers: rewrite email recomputes then sends; append-only email optionally syncs then sends from sheet data (no historical rebuild).
- Helpers: append-only file includes shims for config, validation, fetch retry, duration formatting, and distro loading (from a `Distro` sheet).
- Risks: credentials remain hardcoded; AfterShip helper file still empty; no tests; lead-time metric still uses created->completed as proxy for awaiting-shipment->completed.

## 2025-12-11 Append-Only Sender Shim
- Added a fallback `buildSenderName` shim inside `amzwebsiteleadtime_append_only.gs` so the append-only email sender no longer throws `ReferenceError: buildSenderName is not defined`.

## 2025-12-11 Append-Only Shim Scope Fix
- Converted all append-only helper shims (`getResolvedConfig`, `validateConfig`, `fetchWithRetry`, `formatDuration`, `getRecipientsFromDistro`, `buildSenderName`) to use top-level `var` assignments to ensure global availability under Apps Script V8 block scoping. This prevents `ReferenceError` for these helpers when calling the append-only sync/email functions.

## 2025-12-11 Append-Only Email Guard
- Added a recipient guard to `emailAmzWebsiteFulfillmentLeadTimesAppendOnly`: if the Distro sheet is empty, it logs and skips sending instead of throwing "Failed to send email: no recipient."

## 2025-12-11 Distro Sheet Detection
- The append-only email distro lookup now checks `email_distro` first, then `Distro`, so it can find recipients when the sheet is named differently. Still filters blank rows and requires an @.

## 2025-12-11 Duration Formatting Update
- Updated duration formatting to drop the leading `0d` when under a day (e.g., "0d 15h 16m 1s" -> "15h 16m 1s") in both lead-time scripts: fallback `formatDuration` in `amzwebsiteleadtime_rewrite.gs` and the shim in `amzwebsiteleadtime_append_only.gs`.

## 2025-12-11 Append-Only Email Copy
- Updated the append-only email title/subject to "Website + Amazon Order Count and Lead Time - Daily & 7-Day Avg (awaiting-shipment -> completed)" and removed the "only today/yesterday are mutable" line from the body.

## 2025-12-11 Append-Only Email Tweaks
- Removed "(awaiting-shipment -> completed)" from the append-only email subject/title.
- Daily table now formats dates as `MM/dd/yyyy` (weekend highlighting stays via row backgrounds rather than label text).
- Updated the label of the formatted lead column to "Avg lead (duration)" and removed the "dates show weekend labels" text from the email body.
- Hardened date parsing/formatting in the append-only email so dates are rendered as `MM/dd/yyyy` even when source values contain timezone strings; also adjusted sorting and weekend detection to use parsed dates first.
- Weekend highlighting now uses parsed CST dates in the email (prevents timezone strings from appearing in the date column).
- Added `formatSheetDate` and `isWeekendDate` helpers in the append-only email path to format dates exactly as `MM/dd/yyyy` using the sheet timezone, preventing off-by-one-day shifts between the sheet and email.
- Append-only sheet now writes real Date values (using `dateFromKey`) formatted as `MM/dd/yyyy` and uses CST weekend detection for highlighting; avoids UTC parsing that shifted dates by one day.


• High-level overview of stuck_with_aftership.gs:
                                                                                                                                                                                
  - Purpose: Pull Amazon-channel WooCommerce orders, look up their tracking in AfterShip (auto-creating missing trackings on 404), identify undelivered/stuck shipments, write  
    sheets, and email a status report.                                                                                                                                          
  - Config: getResolvedConfig reads Woo/AfterShip keys, spreadsheet IDs, channel IDs, optional throttles (AFTERSHIP_THROTTLE_MS, WOO_PAGE_THROTTLE_MS), and CSR notes sheet     
    info.                                                                                                                                                                       
  - Sync core (syncAmazonDeliveryTrackingAftershipLookup): fetches Woo completed orders in a date window, pages through results with optional per-page throttle, filters to     
    Amazon channels, extracts Woo tracking items, resolves the “best” tracking per order using AfterShip movement recency, and writes undelivered rows to a sheet (default      
    Amazon Delivery Tracking). Collects missing tracking reasons and auto-create attempts for auxiliary sheets.                                                                 
  - Windowed runner (syncAmazonDeliveryTrackingAftershipLookupWindowed): splits a total span (default 30d) into small windows (default 3d), runs the core sync for each window  
    into its own sheet, then merges all rows into a consolidated sheet (Amazon Delivery Tracking (30d merged)) and aggregates missing/auto-create logs.                         
  - AfterShip lookup (resolveLatestTrackingWithAftership + fetchAftershipCheckpointsWithCreate): normalizes carrier slug, calls AfterShip for checkpoints with a throttle; if   
    404, logs “missing” and POSTs to create the tracking (real carrier/number), then re-fetches. Chooses the most recent active tracking, tracks replacements/cancellations, and    builds checkpoint timestamps/status tags.                                                                                                                                   
  - Sheets written: per-window delivery sheets, merged delivery sheet, Amazon Missing AfterShip (orders lacking usable tracking), AfterShip Auto-Created (404→create attempts), 
    Amazon Stalled Labels (label-only/stuck), plus the main delivery sheet.                                                                                                     
  - Email (emailAmazonAftershipLookupOrders): sends an in-transit/stuck summary (counts, carrier mix, aged/stalled lists) to a hardcoded distro adrian@makeafort.fun using data 
    from a fresh sync or sheet load.                                                                                                                                            
  - Helpers: CSR notes fetch (for replacements/status notes), throttling (maybeThrottle), formatting durations/status KPIs, header builder, and defensive parsers for Woo/      
    AfterShip responses.                                                                                                                                                        
                                                                                                                                                                                
  Practical use:                                                                                                                                                                
                                                                                                                                                                                
  - Run syncAmazonDeliveryTrackingAftershipLookupWindowed() daily to stay under timeouts: creates 3d slice sheets and a merged 30d sheet, plus missing/auto-create logs.        
  - Email trigger can stay on the main sheet or point to the merged sheet if you want the full 30d view.                                                                        
Token usage: total=164,093 input=128,339 (+ 1,543,680 cached) output=35,754 (reasoning 23,872)