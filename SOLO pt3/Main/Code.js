/**
 * Google Apps Script Backend for Dashboard
 * This file serves the main HTML file with all pages embedded
 */

function doGet(e) {
  // Serve main index.html with all pages embedded
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Digital Minds BPO Services')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Include external HTML files
 * This is used in the template evaluation with <?!= include('filename'); ?>
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Test function to verify Apps Script is working
 */
function test() {
  Logger.log('Apps Script is working correctly!');
  return 'Success';
}/**
 * Google Apps Script Backend for Dashboard
 * This file handles routing and serves HTML pages
 */

function doGet(e) {
  const page = e.parameter.page || 'index';
  
  // Route to appropriate page
  switch(page) {
    case 'overview':
      return HtmlService.createHtmlOutput(include('overview'))
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    case 'kpi':
      return HtmlService.createHtmlOutput(include('kpi'))
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    case 'placeholder':
      return HtmlService.createHtmlOutput(createPlaceholder())
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    default:
      // Serve main index.html
      return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('Digital Minds Dashboard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Include external HTML files
 * This is used in the template evaluation
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Generate placeholder page for undeveloped sections
 */
function createPlaceholder() {
  return `
    <div class="bg-white rounded-xl shadow p-8 text-center">
      <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">construction</span>
      <h2 class="text-2xl font-bold mb-2">Coming Soon</h2>
      <p class="text-gray-500">This section is under development.</p>
    </div>
  `;
}

/**
 * Test function to verify Apps Script is working
 */
function test() {
  Logger.log('Apps Script is working correctly!');
  return 'Success';
}