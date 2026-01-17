To access the PostgreSQL database from your local machine, you can use a PostgreSQL client. Here's how:

Connection details (from docker-compose.yml):

Host: localhost
Port: 5432
Database: bpo_platform
Username: postgres
Password: postgres
Option 1: Using psql (command line)

Option 2: Using a GUI tool

Install pgAdmin or DBeaver, then connect with:

Host: localhost
Port: 5432
Database: bpo_platform
Username: postgres
Password: postgres
Option 3: Using VS Code extension

Install "PostgreSQL" extension by Chris Kolkman
Create a new connection:
Host: localhost
Port: 5432
Database: bpo_platform
Username: postgres
Password: postgres
Common queries:

The database is accessible because Docker exposes port 5432 to your host machine via the ports: - "5432:5432" mapping in docker-compose.yml.