function doGet(e) {
  const page = (e && e.parameter && e.parameter.page || '').toLowerCase();
  const templateName = page === 'leave-policy'
    ? 'LeavePolicy'
    : page === '15-minute-rule'
      ? 'FifteenMinuteRule'
      : 'Index';

  const tpl = HtmlService.createTemplateFromFile(templateName);
  return tpl
    .evaluate()
    .setTitle('Employee Disciplinary Policy')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
