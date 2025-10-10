const STATUS_CONFIG = {
  "P":   { deduction: 0 },   // Present
  "HD":  { deduction: 4 },   // Half Day
  "L":   { deduction: 1 },   // Late
  "A":   { deduction: 8 },   // Absent
  "VL":  { deduction: 0 },   // Vacation Leave
  "SUS": { deduction: 0 },   // Suspension
  "Off": { deduction: 0 },   // Day Off
  "T":   { deduction: 8 }    // Terminated
};

// === API ENTRYPOINT ===
function doGet(e) {
  const api = e.parameter.api || "raw";
  const month = e.parameter.month || "";     // 1–12
  const cluster = e.parameter.cluster || ""; // e.g. "Team Bravo"

  if (api === "clusters") {
    return ContentService.createTextOutput(
      JSON.stringify(getClusters())
    ).setMimeType(ContentService.MimeType.JSON);
  } else if (api === "summary") {
    return ContentService.createTextOutput(
      JSON.stringify(getAttendanceSummary(month, cluster))
    ).setMimeType(ContentService.MimeType.JSON);
  } else if (api === "calendars") {
    return ContentService.createTextOutput(
      JSON.stringify(getCampaignCalendars(month, cluster))
    ).setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(
      JSON.stringify(getAttendanceRaw(month, cluster))
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// === CLUSTER LIST API ===
function getClusters() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("att");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const clusterIndex = headers.indexOf("Cluster");
  if (clusterIndex === -1) return [];

  const clusters = [...new Set(data.map(r => r[clusterIndex]).filter(c => c))];
  return clusters.sort();
}

// === RAW DATA API with Filters ===
function getAttendanceRaw(month, cluster) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("att");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  return data
    .map(r => {
      const entry = {};
      headers.forEach((h,i)=> entry[h] = r[i]);
      return entry;
    })
    .filter(r => {
      const d = new Date(r["Date"]);
      const m = d.getMonth() + 1; // JS months are 0-based
      const monthMatch = !month || m == month;
      const clusterMatch = !cluster || r["Cluster"] == cluster;
      return monthMatch && clusterMatch;
    });
}

// === SUMMARY API with Filters ===
function getAttendanceSummary(month, cluster) {
  const rows = getAttendanceRaw(month, cluster);
  let overall = { P:0, L:0, HD:0, A:0, VL:0, SUS:0, Off:0, T:0, lostHours:0 };
  let campaigns = {};

  rows.forEach(entry => {
    const status = entry["Status"];
    const camp = entry["Campaign"];
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return;

    if (!overall[status]) overall[status] = 0;
    overall[status]++;
    overall.lostHours += cfg.deduction;

    if (!campaigns[camp]) {
      campaigns[camp] = { P:0, L:0, HD:0, A:0, VL:0, SUS:0, Off:0, T:0, lostHours:0 };
    }
    campaigns[camp][status]++;
    campaigns[camp].lostHours += cfg.deduction;
  });

  return { overall, campaigns };
}

// === CALENDAR API with Filters ===
function getCampaignCalendars(month, cluster) {
  const rows = getAttendanceRaw(month, cluster);
  const campaigns = {};

  rows.forEach(entry => {
    const date = new Date(entry["Date"]);
    const day = date.getDate();
    const name = entry["Employee Name"];
    const campaign = entry["Campaign"];
    const status = entry["Status"];

    if (!campaigns[campaign]) campaigns[campaign] = {};
    if (!campaigns[campaign][name]) campaigns[campaign][name] = Array(31).fill("NA");
    campaigns[campaign][name][day - 1] = status || "NA";
  });

  return campaigns;
}
