# No Notes Admin

This is a Turborepo-based monorepo hosting the following applications:

- `apps/admin`: React Router 7 contacts application
- `packages/db`: Drizzle ORM package for PostgreSQL database operations

## Development

From your terminal:

```sh
# Install dependencies
pnpm install

# Setup database
# First, make sure you have PostgreSQL running locally
# Then create a database:
createdb no_notes_admin

# Generate and push database schema
cd packages/db
pnpm db:push
pnpm db:seed

# Start the development server
cd ../..
pnpm dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Database

The project uses PostgreSQL with Drizzle ORM. Environment variables can be configured in packages/db/.env file:

```
DATABASE_URL=
```

Database operations:

```sh
# Generate migrations
cd packages/db
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Seed the database with sample data
pnpm db:seed

# View database with Studio
pnpm db:studio
```

## Deployment

First, build your app for production:

```sh
pnpm build
```

Then run the app in production mode:

```sh
cd apps/admin
pnpm start
```

## About this project

This project uses:

- [Turborepo](https://turbo.build/repo) for monorepo management
- [React Router 7](https://reactrouter.com/) for routing
- [React 19](https://react.dev/) for UI
- [Drizzle ORM](https://orm.drizzle.team/) for database operations
- [PostgreSQL](https://www.postgresql.org/) for database