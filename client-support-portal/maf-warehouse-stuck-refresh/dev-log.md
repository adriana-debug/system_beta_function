 Dev Log – AfterShip/Woo Delivery Tracker

  - Restored rich delivery digest email: emailAftershipLookupOrders now builds and sends the full HTML report (KPIs, carrier mix, stalled label-only list, 14+ day backlog, AfterShip issue tables) to
    adrian@makeafort.fun, including sender naming via buildSenderName.
  - Reintroduced helper logic: buildAftershipIssues (stuck/multiple/cancelled/consolidated tracking analysis) and buildStatusKpi for status mix in the email.
  - Added sheet visibility helper: hideNonWarehouseSheets keeps only Website + Amazon Fulfillment Lead Time and Stalled Labels visible; hides all other sheets.
  - Pruned earlier “summary-only” email path; reverted to the full workflow.