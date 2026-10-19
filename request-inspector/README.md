# Request Inspector

A MERN-stack tool that captures and visualises HTTP traffic hitting a Node.js API.
Every request's method, path, status code, response time and client IP is recorded by Express
middleware and stored in MongoDB. A React dashboard (JWT-protected) lets you filter, search and
analyse the captured traffic.

## Features
- Node.js / Express REST API with JWT authentication (bcrypt-hashed passwords)
- Request-logging middleware (no request bodies stored, so credentials are never logged)
- Log filtering by method, status class (2xx/3xx/4xx/5xx) and path search, with pagination
- Aggregated stats via MongoDB aggregation: total requests, average response time, error rate, requests by method
- React dashboard with auto-refresh and one-click test traffic (200, 201, 401, 404, 500, slow response)

## Run locally
Requires Node.js 18+ and a running MongoDB (local or Atlas).

```bash
# backend
cd server
cp .env.example .env     # set MONGO_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:5000

# frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## API
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | no | Create account, returns JWT |
| POST | /api/auth/login | no | Login, returns JWT |
| GET | /api/logs | yes | Paginated logs (`method`, `status`, `search`, `page`, `limit`) |
| GET | /api/logs/stats | yes | Aggregated traffic stats |
| DELETE | /api/logs | yes | Clear logs |
| GET/POST | /api/demo/* | mixed | Sample endpoints that generate traffic |

## Tech stack
Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, React (Vite), Postman for API testing
