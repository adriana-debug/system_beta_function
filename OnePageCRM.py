import requests
import csv
import time
from requests.auth import HTTPBasicAuth

# --- Configuration ---
USER_ID = '6924a9c9dc64ef84fad99ba0'  
API_KEY = 'DZxauW3lKaKjUBqfk81BgzNwslddliIWOsuWLTQwCwI='
BASE_URL = 'https://app.onepagecrm.com/api/v3'
OUTPUT_FILE = 'master_contact_audit_report.csv'

PERSONAL_EMAIL_DOMAINS = {
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com',
    'aol.com', 'msn.com', 'proton.me', 'protonmail.com', 'gmx.com', 'yandex.com',
    'pm.me', 'me.com', 'mac.com', 'fastmail.com', 'fastmail.fm', 'zoho.com',
    'hey.com', 'tutanota.com', 'tuta.com'
}

def get_user_map(auth):
    """Fetches all users to replace IDs with names"""
    try:
        response = requests.get(f"{BASE_URL}/users.json", auth=auth)
        if response.status_code != 200:
            return {}
        users_data = response.json().get('data', [])
        return {
            u['user']['id']: f"{u['user']['first_name']} {u['user']['last_name']}".strip() 
            for u in users_data
        }
    except Exception:
        return {}

def calculate_completeness(c):
    """Calculates score (max 100) based on Guide Section 12"""
    score = 0
    missing = []
    
    # Scoring Metrics definitions
    # Identity
    if c.get('first_name'): score += 10 
    else: missing.append("First Name")
    
    if c.get('last_name'): score += 10 
    else: missing.append("Last Name")
    
    # Connectivity
    emails = c.get('emails', [])
    if emails and isinstance(emails, list) and len(emails) > 0:
        score += 20 
    else:
        missing.append("Email")
        
    if c.get('phones'): score += 15 
    else: missing.append("Phone")
    
    # Professional Context
    if c.get('company_name'): score += 10 
    else: missing.append("Company")
    
    if c.get('job_title'): score += 5 
    else: missing.append("Job Title")
    
    # Sales Data
    if c.get('lead_source'): score += 10 
    else: missing.append("Lead Source")
    
    if c.get('status'): score += 5 
    else: missing.append("Status")
    
    if c.get('background'): score += 10 
    else: missing.append("Background/Notes")
    
    # Engagement (Action check)
    if c.get('next_action') or c.get('next_actions'): 
        score += 5
    else: 
        missing.append("Next Action")
            
    return score, ", ".join(missing) if missing else "None"

def classify_email_category(email):
    """Classifies primary email as Personal, Enterprise, Government, or Unknown."""
    if not email or email == 'N/A':
        return "Unknown"
    email = email.strip().lower()
    if '@' not in email:
        return "Unknown"
    domain = email.split('@', 1)[1]
    if domain in PERSONAL_EMAIL_DOMAINS:
        return "Personal"
    if domain.endswith('.gov') or domain.endswith('.mil') or '.gov.' in domain:
        return "Government"
    return "Enterprise"

def run_paginated_audit():
    auth = HTTPBasicAuth(USER_ID, API_KEY)
    user_names = get_user_map(auth)
    
    all_contacts = []
    current_page = 1
    
    print("🚀 Starting full database audit...")

    while True:
        print(f"📥 Fetching Page {current_page}...")
        params = {'per_page': 100, 'page': current_page}
        
        try:
            response = requests.get(f"{BASE_URL}/contacts.json", auth=auth, params=params)
            if response.status_code != 200:
                print(f"❌ Error on page {current_page}: {response.status_code}")
                break
                
            data = response.json().get('data', {})
            contacts_in_page = data.get('contacts', [])
            
            if not contacts_in_page:
                break
                
            for item in contacts_in_page:
                c = item.get('contact', {})
                score, missing_str = calculate_completeness(c)
                
                # SAFE EMAIL EXTRACTION
                # Check if list exists and has at least one item before accessing [0]
                emails = c.get('emails', [])
                primary_email = emails[0].get('value', 'N/A') if (emails and len(emails) > 0) else 'N/A'
                primary_email_category = classify_email_category(primary_email)
                
                all_contacts.append({
                    'Score': score,
                    'Lead Date': (c.get('created_at') or '')[:10],
                    'Lead Owner': user_names.get(c.get('owner_id'), "Unassigned"),
                    'Contact Name': f"{c.get('first_name', '')} {c.get('last_name', '')}".strip() or "Unnamed",
                    'Primary Email': primary_email,
                    'Primary Email Category': primary_email_category,
                    'Contact ID': c.get('id'),
                    'Missing Details': missing_str
                })
                
            # Check pagination
            if current_page >= data.get('max_page', 1):
                break
                
            current_page += 1
            time.sleep(0.2) # Small delay to respect rate limits
            
        except Exception as e:
            print(f"❌ Critical error during processing: {e}")
            break

    # --- Write to CSV ---
    headers = ['Score', 'Lead Date', 'Lead Owner', 'Contact Name', 'Primary Email', 'Primary Email Category', 'Contact ID', 'Missing Details']
    
    try:
        with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            # Sort by score (lowest first) to help find data gaps
            all_contacts.sort(key=lambda x: x['Score'])
            writer.writerows(all_contacts)
            
        print(f"\n✅ SUCCESS: {len(all_contacts)} records audited and saved to {OUTPUT_FILE}")
    except Exception as e:
        print(f"❌ CSV Write Error: {e}")

if __name__ == "__main__":
    run_paginated_audit()
