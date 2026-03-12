# MyDay API Documentation

Welcome to the MyDay API! This document outlines the available endpoints, authentication mechanisms, and data models for integrating with MyDay.

## Authentication

All API requests (except for setup/login) require a valid session token passed in the `X-Session-Token` header.

```http
X-Session-Token: <your_jwt_token>
```

Tokens are obtained via the `/api/auth/login` or `/api/auth/signup` endpoints.

---

## Data Models

### Item

| Field | Type | Notes |
|---|---|---|
| `id` | `string` (UUID) | Auto-generated |
| `userId` | `string` | User ID |
| `title` | `string` | Required |
| `type` | `ItemType` | `TASK | ASSIGNMENT | EVENT | MEETING | DEADLINE` |
| `priority` | `Priority` | `ROUTINE | IMPORTANT | CRITICAL` |
| `date` | `DateTime` | ISO 8601 string |
| `startTime` | `DateTime?` | Optional; for Event/Meeting |
| `endTime` | `DateTime?` | Optional; for Event/Meeting |
| `location` | `string?` | Optional; for Event/Meeting |
| `joinUrl` | `string?` | Optional; for Meeting |
| `attendeeName` | `string?` | Optional; for Meeting |
| `recurrence` | `Recurrence` | `NONE | DAILY | WEEKLY | MONTHLY` |
| `recurrenceEndDate` | `DateTime?` | Optional |
| `notes` | `string?` | Optional |
| `completedAt` | `DateTime?` | Marked when finished |

---

## Authentication Endpoints

### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "secretpassword",
  "displayName": "John Doe"
}
```

**Response (200 OK):**
```json
{
  "token": "jwt_token_here",
  "user": { "id": "uuid", "username": "johndoe", "displayName": "John Doe", "role": "USER", "theme": "dark" }
}
```

### POST `/api/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "secretpassword"
}
```

**Response (200 OK):**
```json
{
  "token": "jwt_token_here",
  "user": { "id": "uuid", "username": "johndoe", "displayName": "John Doe", "role": "USER", "theme": "dark" }
}
```

---

## Item Endpoints

### GET `/api/items`
Fetch items for a specific date.

**Query Parameters:**
- `date`: (Optional) ISO 8601 date string (e.g., `2026-03-12`).
- `userId`: (Admin only) ID of user to fetch items for.

**Response (200 OK):**
`Array<Item>`

### POST `/api/items`
Create a new item.

**Request Body:**
`CreateItemSchema` (subset of Item fields)

**Response (201 Created):**
`Item`

### PATCH `/api/items/:id`
Update an existing item.

**Request Body:**
Partial `Item` object.

**Response (200 OK):**
`Item`

### DELETE `/api/items/:id`
Delete an item.

**Response (200 OK):**
`{ "success": true }`

### GET `/api/items/week`
Fetch all items for a week view, including expanded recurring instances.

**Query Parameters:**
- `start`: (Required) ISO 8601 start date.
- `days`: (Optional) Number of days to fetch (defaults to 7).
- `userId`: (Admin only) ID of user.

**Response (200 OK):**
`Array<Item>` (including virtual recurring items)

---

## User Endpoints (Admin Only)

### GET `/api/users`
List all registered users.

**Response (200 OK):**
`Array<{ id: string, username: string, displayName: string, role: string }>`

---

## Error Codes

| Code | Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid session token. |
| `BAD_REQUEST` | 400 | Missing required fields or malformed payload. |
| `VALIDATION_ERROR` | 400 | Payload failed schema validation (e.g., Zod error). |
| `NOT_FOUND` | 404 | Resource does not exist. |
| `CONFLICT` | 409 | Resource already exists (e.g., username taken). |
| `INTERNAL_ERROR` | 500 | An unexpected server error occurred. |
