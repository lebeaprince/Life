# Nimbus POS (Angular + Spring Boot microservices)

Nimbus POS is a multi-tenant point of sale built with Angular 21 and a Spring Boot
microservices backend. The UI remains Angular, while the backend is split into
independent services behind a Spring Cloud Gateway for ease of local development
and Docker-based deployment.

## Services

- **gateway-service** (8080): Routes `/api/**` traffic to backend services.
- **identity-service** (8081): Authentication, users, tenants, roles.
- **catalog-service** (8082): Products and inventory adjustments.
- **order-service** (8083): Orders and checkout workflows.
- **settings-service** (8084): Tenant settings and POS preferences.

## Features

- Email/password authentication with JWT
- Multi-tenant catalog, inventory, and order data
- POS cart + checkout flow
- User roles and access management
- Tenant settings (currency, tax, low stock thresholds)

## Tech stack

- Angular 21 (standalone components)
- Spring Boot 3 microservices
- Spring Cloud Gateway
- Docker Compose
- RxJS for reactive UI streams

## Getting started

1. Install UI dependencies:
   ```bash
   npm install
   ```
2. Build and run the backend:
   ```bash
   docker compose build
   docker compose up
   ```
3. Start the Angular UI:
   ```bash
   npm start
   ```

The UI will be available at `http://localhost:4200` and the API gateway at
`http://localhost:8080/api`.

## Configuration notes

- API base URLs live in:
  - `src/environments/environment.ts`
  - `src/environments/environment.prod.ts`
- The backend uses in-memory storage for scaffolding. Restarting containers resets data.
- Set `JWT_SECRET` in `docker-compose.yml` (or your deployment environment) for production.
