# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package manager
- pnpm

## Commands

- Build: `pnpm turbo build`
- Dev: `pnpm turbo dev`
- Start: `pnpm turbo start`
- Type checking: `pnpm turbo typecheck`

## Code Style Guidelines
- TypeScript with strict mode enabled
- React functional components
- PascalCase for React components and type definitions
- camelCase for variables, functions
- kebab-case for route filenames
- Follow existing import order patterns: React, external, internal
- Use React Router v7 patterns for routing and data loading
- Create namespaced types in dedicated files (see +types/)
- Prefer explicit type annotations for function parameters
- Use optional chaining and nullish coalescing for handling undefined values
- For error handling: use Response objects with appropriate status codes

## Database
- Uses Drizzle ORM for database operations
- Data schema defined in app/data.ts