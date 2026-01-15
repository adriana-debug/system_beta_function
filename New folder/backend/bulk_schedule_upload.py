import csv
from datetime import datetime, timedelta, time
from typing import List, Dict, Optional

# --- 1. Shift Code Parser ---
def parse_shift_code(shift_code: str) -> Optional[Dict[str, str]]:
    """Parse a shift code like 'a2307' or 'o' into start/end times and status."""
    code = shift_code.strip().lower()
    if code in ("o", "x"):
        return {"status": "off"}
    if len(code) == 5 and code[0] == "a" and code[1:5].isdigit():
        start_hour = int(code[1:3])
        end_hour = int(code[3:5])
        return {
            "status": "active",
            "start_hour": start_hour,
            "end_hour": end_hour,
        }
    return None  # Invalid code

# --- 2. Validation Logic ---
def validate_shift_code(shift_code: str) -> bool:
    parsed = parse_shift_code(shift_code)
    return parsed is not None

# --- 3. Date Expansion Logic ---
def expand_dates(start_date: str, end_date: str, shift_code: str) -> List[Dict]:
    """Expand shift code to all valid workdays (Mon-Fri) in the date range."""
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    days = []
    code = shift_code.strip().lower()
    for i in range((end - start).days + 1):
        day = start + timedelta(days=i)
        weekday = day.weekday()
        # Mon-Fri: apply shift; Sat/Sun: OFF unless explicitly coded
        if weekday < 5 or code not in ("o", "x"):  # Mon-Fri or explicit code
            days.append({"date": day.date(), "shift_code": code})
    return days

# --- 4. Midnight Crossover Handling & Block Expansion ---
def generate_schedule_blocks(start_hour: int, end_hour: int) -> List[str]:
    """Return 30-min blocks, handling midnight crossover."""
    blocks = []
    t = time(hour=start_hour)
    end = time(hour=end_hour)
    dt = datetime.combine(datetime.today(), t)
    end_dt = datetime.combine(datetime.today(), end)
    if end_hour <= start_hour:
        end_dt += timedelta(days=1)  # Crosses midnight
    while dt < end_dt:
        block_start = dt.time().strftime("%H:%M")
        block_end = (dt + timedelta(minutes=30)).time().strftime("%H:%M")
        blocks.append(f"{block_start}-{block_end}")
        dt += timedelta(minutes=30)
    return blocks

# --- 5. Main Service Function ---
def process_bulk_schedule(csv_content: str, employee_lookup: Dict[str, int]) -> List[Dict]:
    """Parse CSV and return normalized schedule records for DB insert."""
    reader = csv.DictReader(csv_content.strip().splitlines())
    records = []
    for row in reader:
        emp_code = row["employee_code"].strip()
        emp_id = employee_lookup.get(emp_code)
        if not emp_id:
            continue  # Unknown employee
        start_date = row["start_date"]
        end_date = row["end_date"]
        shift_code = row["shift_code"]
        if not validate_shift_code(shift_code):
            continue
        for day in expand_dates(start_date, end_date, shift_code):
            parsed = parse_shift_code(day["shift_code"])
            if parsed["status"] == "off":
                continue
            work_date = day["date"].strftime("%Y-%m-%d")
            start_hour = parsed["start_hour"]
            end_hour = parsed["end_hour"]
            blocks = generate_schedule_blocks(start_hour, end_hour)
            records.append({
                "employee_id": emp_id,
                "work_date": work_date,
                "start_time": f"{start_hour:02d}:00",
                "end_time": f"{end_hour:02d}:00",
                "shift_code": shift_code,
                "schedule_blocks": blocks,
            })
    return records

# --- 6. Example FastAPI Endpoint ---
# (To be integrated in main.py or as a router)
# from fastapi import APIRouter, UploadFile, File, Depends
# @router.post("/bulk-upload-schedule")
# async def bulk_upload_schedule(file: UploadFile = File(...), session: Session = Depends(get_session)):
#     csv_content = (await file.read()).decode()
#     # Build employee_lookup from DB: {employee_no: id}
#     # records = process_bulk_schedule(csv_content, employee_lookup)
#     # Insert records into Schedule table
#     return {"inserted": len(records)}
