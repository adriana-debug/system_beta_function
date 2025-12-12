// ===================================================================================
// --- GLOBAL CONFIGURATION ---
// All API keys and shared settings go in this file.
// ===================================================================================

// --- Timezone ---
const CENTRAL_TIMEZONE = 'America/Chicago';

// --- Customer / Branding ---
const CUSTOMER_NAME = 'Make A Fort Reports';

// --- WooCommerce ---
const YOUR_WEBSITE_URL = 'https://www.makeafort.fun';
const YOUR_CONSUMER_KEY = 'ck_5665d29837492596ca23746282f4e53241c1ae4f';
const YOUR_CONSUMER_SECRET = 'cs_ab4022d4285f6ca734ffec46e1b2ab1ae8cc6837';
const WOO_TARGET_SHEET_NAME = 'Woo Processing';
const DAYS_TO_CHECK = 30;


// --- Aftership ---
const AFTERSHIP_API_KEY = 'asat_e81ab4d68ce7461cbd897400754b1ed2';

// --- ShipStation ---
const SHIPSTATION_API_KEY = 'e417c7e503e048c7814f74686f3e4732';
const SHIPSTATION_API_SECRET = 'f76cc44c582244739c3ccdbb702eb409';
const SS_TARGET_SHEET_NAME = 'ShipStation Data';
const SS_SOURCE_SHEET_NAME = 'Woo Processing';
const FBA_SKUS = ['860009053304', '860001442250'];
const AMAZON_CHANNEL_IDS = [90, 116];
const AMAZON_DELIVERY_SHEET_NAME = 'Amazon Delivery Tracking';
// Stalled threshold (days) for label-created with no movement.
const STALLED_LABEL_DAYS = 3;
// Optional: warehouse recipients for stalled-label notice (array of emails). Falls back to distro sheet if empty.
const WAREHOUSE_RECIPIENTS = [];

// --- Spreadsheet binding ---
// Shared spreadsheet used by the Apps Script project.
const SPREADSHEET_ID = '1Dfl-MwrJ-CJ7CJ-OORVusXcqT_CAn9VgLjNZPQgVZBI';

// CSR notes sheet (read-only) for replacement/reship/refund/resolution context.
const CSR_NOTES_SPREADSHEET_ID = '1EuHkU-3LwzPiljLZqUkSue17KKVCx6SrgOaWQIp4wLU';
const CSR_NOTES_SHEET_NAME = 'November';


// --- Pipe17 ---
const PIPE17_API_KEY = 'e70fc36708eb19ef52d79dd81d84986f4440d2c0eede35f52a06ab88b4a1cc21';
