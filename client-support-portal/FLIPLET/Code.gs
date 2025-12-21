function sendKnowledgeBaseDashboard() {
  const recipient = Session.getActiveUser().getEmail(); // or replace with fixed email
  const subject = "Knowledge Base – Dashboard Overview";

  // Example dynamic values (replace with real data if needed)
  const activeRolesCount = 5;
  const documentsCount = 12;

  const htmlBody = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#ffffff; padding:24px; color:#111827;">
    
    <!-- Header -->
    <h2 style="margin:0 0 6px 0; font-size:22px;">Knowledge Base</h2>
    <p style="margin:0 0 20px 0; color:#6b7280; font-size:14px;">
      Select a category from the left to open documents and templates.
    </p>

    <!-- Cards Row -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <!-- Active Roles -->
        <td style="padding-right:12px;">
          <div style="
            border:1px solid #e5e7eb;
            border-radius:8px;
            padding:16px 20px;
            min-width:160px;
          ">
            <div style="font-size:13px; color:#374151;">Active Roles</div>
            <div style="font-size:22px; font-weight:bold; margin-top:6px;">
              ${activeRolesCount}
            </div>
          </div>
        </td>

        <!-- Documents -->
        <td>
          <div style="
            border:1px solid #e5e7eb;
            border-radius:8px;
            padding:16px 20px;
            min-width:160px;
          ">
            <div style="font-size:13px; color:#374151;">Documents</div>
            <div style="font-size:22px; font-weight:bold; margin-top:6px;">
              ${documentsCount}
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Getting Started Box -->
    <div style="
      background:#f9fafb;
      border:1px solid #e5e7eb;
      border-radius:8px;
      padding:16px 20px;
    ">
      <h3 style="margin:0 0 10px 0; font-size:16px;">Getting Started</h3>
      <ul style="margin:0; padding-left:18px; color:#374151; font-size:14px;">
        <li style="margin-bottom:6px;">Click a sidebar item to view its content</li>
        <li>Use the search to find documents quickly</li>
      </ul>
    </div>

  </div>
  `;

  GmailApp.sendEmail(
    recipient,
    subject,
    "Your email client does not support HTML.",
    { htmlBody: htmlBody }
  );
}
