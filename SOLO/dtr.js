function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Team Attendance Tracker");
}

/** Utility to normalize dates as yyyy-mm-dd strings */
function toDateKey(val) {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return String(val).substring(0, 10);
}

/** Fetch all unique supervisors */
function getSupervisors() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Team_List");
  const data = sheet.getDataRange().getValues();
  data.shift();
  return [...new Set(data.map(r => r[0]))];
}

/** Get team for supervisor and mark if record exists for selected date */
function getTeamList(supervisor, dateStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const teamSheet = ss.getSheetByName("Team_List");
  const attSheet = ss.getSheetByName("Attendance_DB");

  const teamData = teamSheet.getDataRange().getValues();
  const attData = attSheet.getDataRange().getValues();
  teamData.shift();
  attData.shift();

  const dateKey = toDateKey(dateStr);
  const existing = new Set(
    attData.filter(r => toDateKey(r[0]) === dateKey && r[1] === supervisor).map(r => r[2])
  );

  return teamData
    .filter(r => r[0] === supervisor)
    .map(r => ({ agent: r[1], exists: existing.has(r[1]) }));
}

/** Fetch all attendance entries for that date & supervisor */
function getAttendanceRecords(dateStr, supervisor) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Attendance_DB");
  const data = sheet.getDataRange().getValues();
  data.shift();
  const dateKey = toDateKey(dateStr);

  return data
    .filter(r => toDateKey(r[0]) === dateKey && r[1] === supervisor)
    .map(r => ({
      agent: r[2],
      status: r[3],
      start: r[4],
      end: r[5],
      notes: r[6],
      recordedBy: r[8] || "—"
    }));
}

/** Save new record only if no duplicate exists */
function saveAttendance(rec) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Attendance_DB");
  const values = sheet.getDataRange().getValues();
  const dateKey = toDateKey(rec.date);

  const exists = values.some(r =>
    toDateKey(r[0]) === dateKey && r[1] === rec.supervisor && r[2] === rec.agentName
  );
  if (exists) {
    return { success: false, duplicate: true, message: `Record for ${rec.agentName} already exists.` };
  }

  const userEmail = Session.getActiveUser().getEmail() || "Unknown User";
  sheet.appendRow([
    new Date(rec.date),
    rec.supervisor,
    rec.agentName,
    rec.status,
    rec.shiftStart,
    rec.shiftEnd,
    rec.notes,
    new Date(),
    userEmail
  ]);

  return { success: true, message: `Saved new record for ${rec.agentName}` };
}

/** Update record + log all changes with editor’s email */
function updateAttendance(rec) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Attendance_DB");
  const history = ss.getSheetByName("Update_History") || ss.insertSheet("Update_History");
  const rows = sheet.getDataRange().getValues();
  const dateKey = toDateKey(rec.date);
  const editorEmail = Session.getActiveUser().getEmail() || "Unknown User";

  for (let i = 1; i < rows.length; i++) {
    if (
      toDateKey(rows[i][0]) === dateKey &&
      rows[i][1] === rec.supervisor &&
      rows[i][2] === rec.agentName
    ) {
      const oldVals = rows[i].slice(3, 7);
      const newVals = [rec.status, rec.shiftStart, rec.shiftEnd, rec.notes];
      sheet.getRange(i + 1, 4, 1, 4).setValues([newVals]);

      ["Status", "Shift Start", "Shift End", "Notes"].forEach((field, idx) => {
        if (oldVals[idx] !== newVals[idx]) {
          history.appendRow([
            rec.date,
            rec.supervisor,
            rec.agentName,
            field,
            oldVals[idx] || "",
            newVals[idx] || "",
            editorEmail,
            new Date()
          ]);
        }
      });

      return { success: true, message: `Updated ${rec.agentName}` };
    }
  }
  return { success: false, message: "No record found to update." };
}



/** Fetch summary counts by status for a date & supervisor */
function getAttendanceSummary(dateStr, supervisor) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Attendance_DB");
  const data = sheet.getDataRange().getValues();
  data.shift();
  const dateKey = toDateKey(dateStr);

  const filtered = data.filter(r => toDateKey(r[0]) === dateKey && r[1] === supervisor);
  const total = filtered.length;

  const summary = {
    total,
    Present: 0,
    Late: 0,
    Absent: 0,
    "On Leave": 0
  };

  filtered.forEach(r => {
    const status = r[3];
    if (summary[status] !== undefined) summary[status]++;
  });

  return summary;
}
