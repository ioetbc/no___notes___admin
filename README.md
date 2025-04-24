# No Notes Admin

This is a Turborepo-based monorepo hosting the following applications:

- `apps/admin`: React Router 7 contacts application
- `packages/db`: Drizzle ORM package for database operations

## Development

From your terminal:

```sh
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Database

The project includes a Drizzle ORM setup with SQLite. To use:

```sh
# Generate migrations
cd packages/db
pnpm generate

# Push migrations to database
pnpm db:push

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