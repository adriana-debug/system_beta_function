function doGet() {
  return HtmlService.createTemplateFromFile('smartdoc')
    .evaluate()
    .setTitle('Smart Document Builder')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getActiveUserEmail() {
  try { return Session.getActiveUser().getEmail() || ''; }
  catch (e) { return ''; }
}

function saveFormToSheet(formData) {
  const ss = SpreadsheetApp.openById('1oXYTBKr105VwjETP-CHGkm1W4hnoIvGBQGBOdaNxjsQ');
  const sh = ss.getSheetByName('FormData');

  const row = [
    new Date(),
    formData.documentTitle || '',
    formData.date || '',
    formData.preparedBy || '',
    formData.clientName || '',
    formData.category || '',
    formData.descriptionNotes || ''
  ];

  sh.appendRow(row);
  return 'Saved to Sheet';
}

function generateDocumentFromSheet() {
  const ss = SpreadsheetApp.openById('1oXYTBKr105VwjETP-CHGkm1W4hnoIvGBQGBOdaNxjsQ');
  const sh = ss.getSheetByName('FormData');
  const lastRow = sh.getLastRow();
  if (lastRow < 2) throw new Error('No data available in sheet.');

  const row = sh.getRange(lastRow, 1, 1, 7).getValues()[0];
  const [
    timestamp,
    documentTitle,
    date,
    preparedBy,
    clientName,
    category,
    descriptionNotes
  ] = row;

  const folderName = 'Smart Document Builder PDFs';
  const logoUrl = 'https://digitalmindsbpo.com/storage/2021/11/cropped-Digital_Minds_Logo_Original.png';

  // --- Folder ---
  let folderIt = DriveApp.getFoldersByName(folderName);
  const folder = folderIt.hasNext()
    ? folderIt.next()
    : DriveApp.createFolder(folderName);

  // --- Document ---
  const inch = 72;
  const doc = DocumentApp.create(documentTitle || 'Untitled Document');
  const body = doc.getBody();
  body.clear();
  body.setMarginTop(0.5 * inch);
  body.setMarginBottom(0.5 * inch);
  body.setMarginLeft(0.5 * inch);
  body.setMarginRight(0.5 * inch);
  body.setAttributes({
    [DocumentApp.Attribute.FONT_FAMILY]: 'Arial',
    [DocumentApp.Attribute.FONT_SIZE]: 11,
  });

  // --- Header ---
  const header = doc.addHeader();
  const table = header.appendTable();
  table.setBorderWidth(0);
  const rowHeader = table.appendTableRow();
  const logoCell = rowHeader.appendTableCell('');
  const titleCell = rowHeader.appendTableCell('');

  try {
    const resp = UrlFetchApp.fetch(logoUrl, { muteHttpExceptions: true });
    if (resp.getResponseCode() === 200) {
      const blob = resp.getBlob();
      const img = logoCell.appendImage(blob);
      const width = 110;
      const ratio = img.getHeight() / img.getWidth();
      img.setWidth(width).setHeight(width * ratio);
    }
  } catch (e) {
    Logger.log('Logo load failed: ' + e);
  }

  const pTitle = titleCell.appendParagraph(documentTitle || '');
  pTitle.setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

  const metaLine =
    'Client: ' + (clientName || '') +
    ' | Category: ' + (category || '') +
    ' | Date: ' + (date || '') +
    ' | Prepared by: ' + (preparedBy || '');
  const pMeta = titleCell.appendParagraph(metaLine);
  pMeta.setFontSize(10)
       .setForegroundColor('#666666')
       .setAlignment(DocumentApp.HorizontalAlignment.RIGHT);


// --- Body with light gray border frame and bullet support ---
const mainTable = body.appendTable();
mainTable.setBorderWidth(1);
mainTable.setBorderColor('#cccccc'); // light gray border

const mainRow = mainTable.appendTableRow();
const mainCell = mainRow.appendTableCell();

// Add padding
mainCell.setPaddingTop(20);
mainCell.setPaddingBottom(20);
mainCell.setPaddingLeft(30);
mainCell.setPaddingRight(30);

// Split content by double line breaks
const paragraphs = String(descriptionNotes || '').split(/\n{2,}/);

// Detect bullet lines and convert them properly
paragraphs.forEach((para) => {
  if (para.trim()) {
    const lines = para.trim().split(/\n/);
    let currentList = null;

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Detect bullet indicators (-, •, *)
      if (/^[-•*]/.test(trimmed)) {
        if (!currentList) {
          currentList = mainCell.appendListItem(trimmed.replace(/^[-•*]\s*/, ''));
        } else {
          currentList = mainCell.appendListItem(trimmed.replace(/^[-•*]\s*/, ''));
        }
        currentList.setGlyphType(DocumentApp.GlyphType.BULLET);
      } else {
        // Normal paragraph
        const p = mainCell.appendParagraph(trimmed);
        p.setSpacingAfter(8);
        p.setLineSpacing(1.2);
      }
    });
  }
});



// --- Footer ---
const footer = doc.addFooter();
footer.appendParagraph('© Digital Minds BPO | Confidential Document')
      .setAlignment(DocumentApp.HorizontalAlignment.LEFT)
      .setFontSize(8);

const pFooter = footer.appendParagraph('Page 1 of 1');
pFooter.setFontSize(8)
       .setAlignment(DocumentApp.HorizontalAlignment.RIGHT);



  // --- Save & Export ---
  doc.saveAndClose();
  const docFile = DriveApp.getFileById(doc.getId());
  const pdfBlob = docFile.getAs('application/pdf').setName(documentTitle + '.pdf');
  const pdfFile = folder.createFile(pdfBlob);
  docFile.setTrashed(true);

  return {
    success: true,
    fileName: pdfFile.getName(),
    driveUrl: 'https://drive.google.com/file/d/' + pdfFile.getId() + '/view',
  };
}
