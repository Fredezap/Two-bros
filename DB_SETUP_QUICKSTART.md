# DB Quickstart

## 1. Create user and database (psql)
```sql
CREATE USER "example_user" WITH PASSWORD 'examplePass123!';
CREATE DATABASE exampledb OWNER "example_user";
GRANT ALL PRIVILEGES ON DATABASE exampledb TO "example_user";
```

### Check and grant database creation permissions

Prisma migrations require that your database user can create databases (for the shadow database). To check and grant this permission:

1. Connect to PostgreSQL as a superuser (e.g., `psql -U postgres`)
2. Run:

```sql
-- Check if your user has CREATEDB
SELECT rolname, rolcreatedb FROM pg_roles WHERE rolname = 'example_user';

-- If rolcreatedb is 'f', grant the permission:
ALTER ROLE "example_user" CREATEDB;
```

## 2. Check that the database exists
```sql
\l
```

## 3. Configure your .env file
Create the `.env` file and edit it with your real data:
Then, make sure the `DATABASE_URL` variable has the correct format, for example:

```
DATABASE_URL="postgresql://name:mipassword@localhost:5432/database?schema=public"
```

## 4. Prisma setup (from /backend)
Install dependencies if this is your first time:

```bash
cd backend
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```


Apply migrations to create the tables (this will also create the database if it doesn't exist and you have permissions):

```bash
npx prisma migrate dev --name init --schema=prisma/schema.prisma
```

> ℹ️ If the migration has already been applied, you don't need to run this command again unless you change the schema.

If you only want to sync the schema without migrations:

```bash
npx prisma db push --schema=prisma/schema.prisma
```

> ⚠️ If you get a permission error about creating the shadow database, make sure your database user has permission to create databases, or use a user with higher privileges just for the migration step. More info: https://pris.ly/d/migrate-shadow

## 5. Start the backend
```bash
npm start
```

### Useful notes
- If you change the `.env` file, run `npx prisma generate` again.
- To view and manage your database visually: `npx prisma studio`.
- If you have connection issues, check your `.env` values and ensure PostgreSQL is running.
- Si tienes problemas de conexión, revisa los datos de tu `.env` y que el servicio de PostgreSQL esté corriendo.