# Database Access Guide

## Adminer (Database Admin Tool)

When you start the development environment, Adminer is available at http://localhost:8080

### Connection Settings:
- **System**: PostgreSQL
- **Server**: `postgres`
- **Username**: `postgres`
- **Password**: `postgres`
- **Database**: `vehicle_tracker`

## Direct Database Connection

You can also connect directly using any PostgreSQL client:

```bash
# Using psql
psql -h localhost -p 5432 -U postgres -d vehicle_tracker

# Connection string
postgresql://postgres:postgres@localhost:5432/vehicle_tracker
```

## Common Issues

### "Name does not resolve" error in Adminer
- Make sure you're using `postgres` as the server name, not `db` or `localhost`
- The server name must match the Docker service name in docker-compose.yml

### Backend connection issues
- Local backend should use `localhost:5432`
- Docker backend should use `postgres:5432`
- The dev script automatically configures this

## Demo Data

After running the seed script, you'll have:
- 2 demo users (admin@example.com, user@example.com)
- 3 demo vehicles with trip data
- Password for both users: `password123`