"""Seed database with sample data for OPEX360."""

from sqlmodel import Session, select

from database import engine
from models import Employee, Organization, Role, User


def seed_data() -> None:
    with Session(engine) as session:
        # Check if data already exists
        existing_org = session.exec(select(Organization)).first()
        if existing_org:
            print("Database already seeded, skipping...")
            return

        # Create organization
        org = Organization(
            name="Default BPO",
            description="Default organization for OPEX360"
        )
        session.add(org)
        session.flush()

        # Create roles
        admin_role = Role(
            name="Administrator",
            description="Full system access",
            organization_id=org.id
        )
        ops_role = Role(
            name="Operations Manager",
            description="Operations team management",
            organization_id=org.id
        )
        session.add(admin_role)
        session.add(ops_role)
        session.flush()

        # Create admin user
        admin_user = User(
            email="admin@opex360.com",
            full_name="Admin User",
            hashed_password="8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",  # admin
            organization_id=org.id,
            role_id=admin_role.id
        )
        session.add(admin_user)
        session.flush()

        import random
        import faker
        fake = faker.Faker()

        campaigns = [
            "Healthcare Support", "E-Commerce CX", "Travel Services", "Fintech Helpdesk", "Telecom Billing",
            "Insurance Claims", "Retail Loyalty", "Tech Hardware", "Food Delivery", "Logistics B2B",
            "Education Online", "Utilities Support", "Banking KYC", "Automotive CX", "Media Streaming"
        ]
        # Assign 2, 3, or 5 employees per campaign, repeat as needed
        campaign_counts = []
        total = 0
        while total < 200:
            for c in campaigns:
                n = random.choice([2, 3, 5])
                if total + n > 200:
                    n = 200 - total
                campaign_counts.append((c, n))
                total += n
                if total >= 200:
                    break

        employees = []
        emp_no = 1001
        for campaign, count in campaign_counts:
            for _ in range(count):
                first = fake.first_name()
                last = fake.last_name()
                employee = Employee(
                    employee_no=f"EMP{emp_no:04d}",
                    first_name=first,
                    last_name=last,
                    campaign=campaign,
                    date_of_joining=str(fake.date_between(start_date="-5y", end_date="-1d")),
                    last_working_date=None if random.random() > 0.1 else str(fake.date_between(start_date="-1y", end_date="today")),
                    status=random.choice(["active"]*8 + ["on_leave", "resigned"]),
                    client_email=f"{first.lower()}.{last.lower()}@client.com",
                    phone_no=fake.phone_number(),
                    personal_email=fake.email(),
                    emergency_name=fake.name(),
                    emergency_phone=fake.phone_number(),
                    organization_id=org.id
                )
                employees.append(employee)
                emp_no += 1

        session.add_all(employees)
        session.commit()
        print(f"✓ Database seeded successfully with {len(employees)} employees")

        # Seed schedules and DTRs
        from models import Schedule, DTR
        from datetime import datetime, timedelta

        # Get all employees with IDs
        all_emps = session.exec(select(Employee)).all()

        today = datetime(2026, 1, 15)
        schedule_start = today - timedelta(days=30*6)  # 6 months ago
        schedule_end = today + timedelta(days=30*2)    # 2 months in future
        dtr_start = today - timedelta(days=30*6)
        dtr_end = today

        schedules = []
        dtrs = []
        for emp in all_emps:
            # Schedules: every weekday from schedule_start to schedule_end
            sched_date = schedule_start
            while sched_date <= schedule_end:
                if sched_date.weekday() < 5:  # Mon-Fri
                    shift_start = random.choice(["08:00", "09:00", "10:00"])
                    shift_end = f"{int(shift_start[:2])+9:02d}:{shift_start[3:]}"
                    schedules.append(Schedule(
                        employee_id=emp.id,
                        date=sched_date.strftime("%Y-%m-%d"),
                        shift_start=shift_start,
                        shift_end=shift_end,
                        campaign=emp.campaign,
                        status="scheduled"
                    ))
                sched_date += timedelta(days=1)

            # DTRs: every weekday from dtr_start to dtr_end
            dtr_date = dtr_start
            while dtr_date <= dtr_end:
                if dtr_date.weekday() < 5:  # Mon-Fri
                    # 90% present, 5% late, 3% on_leave, 2% absent
                    roll = random.random()
                    if roll < 0.90:
                        status = "present"
                        in_time = random.choice(["08:00", "09:00", "10:00"])
                        out_time = f"{int(in_time[:2])+9:02d}:{in_time[3:]}"
                        remarks = None
                    elif roll < 0.95:
                        status = "late"
                        in_time = random.choice(["08:15", "09:20", "10:10"])
                        out_time = f"{int(in_time[:2])+9:02d}:{in_time[3:]}"
                        remarks = "Late arrival"
                    elif roll < 0.98:
                        status = "on_leave"
                        in_time = None
                        out_time = None
                        remarks = "On leave"
                    else:
                        status = "absent"
                        in_time = None
                        out_time = None
                        remarks = "Absent"
                    dtrs.append(DTR(
                        employee_id=emp.id,
                        date=dtr_date.strftime("%Y-%m-%d"),
                        time_in=in_time,
                        time_out=out_time,
                        status=status,
                        remarks=remarks
                    ))
                dtr_date += timedelta(days=1)

        session.add_all(schedules)
        session.add_all(dtrs)
        session.commit()
        print(f"✓ Seeded {len(schedules)} schedules and {len(dtrs)} DTRs for all employees")


if __name__ == "__main__":
    seed_data()

