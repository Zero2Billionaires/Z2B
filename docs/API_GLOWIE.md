# Glowie AI App Builder API Documentation

**Version:** 1.0.0
**Base URL:** `http://localhost:5000/api/glowie`
**Authentication:** Required (JWT Bearer Token)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [App Generation](#app-generation)
   - [App Management](#app-management)
   - [User Settings](#user-settings)
   - [Statistics & Analytics](#statistics--analytics)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limits](#rate-limits)
7. [Examples](#examples)

---

## Overview

The Glowie API provides endpoints for AI-powered web application generation. Users can:
- Generate complete HTML applications using AI
- Manage their generated apps
- Track usage statistics
- Configure API keys and preferences
- Share generated apps with others

### Key Features

- **AI-Powered Generation** - Creates complete, functional web apps from descriptions
- **Secure API Key Storage** - Encrypted storage of user AI API keys
- **Usage Tracking** - Monthly generation limits and statistics
- **App History** - Full history of generated applications
- **Sharing** - Generate shareable links for public apps
- **Download Tracking** - Track downloads and views

---

## Authentication

All Glowie endpoints require authentication via JWT Bearer token.

### Getting a Token

First, authenticate using the Auth API:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Using the Token

Include the token in the Authorization header:

```bash
Authorization: Bearer <your-token>
```

---

## Endpoints

### App Generation

#### Generate New App

Creates a new AI-generated web application.

**Endpoint:** `POST /api/glowie/generate`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "Build me a task manager app with a clean design. Users should be able to add tasks, mark them complete, and delete them.",
  "appType": "tool",
  "features": {
    "mobile": true,
    "darkMode": false,
    "localStorage": true,
    "animations": false,
    "icons": true,
    "modern": true
  },
  "colorScheme": "z2b",
  "useOwnKey": false,
  "apiKey": "optional-api-key-if-useOwnKey-is-true"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | Yes | Detailed description of the app (10-2000 chars) |
| appType | string | Yes | Type: `landing`, `dashboard`, `form`, `game`, `tool`, `other` |
| features | object | No | Feature flags (all boolean) |
| features.mobile | boolean | No | Mobile responsive (default: true) |
| features.darkMode | boolean | No | Dark mode toggle (default: false) |
| features.localStorage | boolean | No | Local storage (default: true) |
| features.animations | boolean | No | Animations (default: false) |
| features.icons | boolean | No | Icon integration (default: true) |
| features.modern | boolean | No | Modern design (default: true) |
| colorScheme | string | No | Color scheme: `z2b`, `modern`, `vibrant`, `minimal`, `custom` |
| useOwnKey | boolean | No | Use provided API key instead of saved key |
| apiKey | string | No | Claude API key (required if useOwnKey is true) |

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "App generated successfully!",
  "data": {
    "appId": "507f1f77bcf86cd799439011",
    "appName": "Task Manager App",
    "appType": "tool",
    "generationTime": 3542,
    "codeSize": 15234,
    "tags": ["tool", "task", "productivity"],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "remainingGenerations": 7
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid input
```json
{
  "success": false,
  "message": "Description must be at least 10 characters long"
}
```

- **429 Too Many Requests** - Monthly limit reached
```json
{
  "success": false,
  "message": "Monthly generation limit reached. Limit resets on 2/1/2025.",
  "monthlyLimit": 10,
  "monthlyUsage": 10
}
```

- **500 Server Error** - Generation failed
```json
{
  "success": false,
  "message": "Failed to generate app",
  "error": "API request failed"
}
```

---

### App Management

#### Get App by ID

Retrieves details of a generated app (without code).

**Endpoint:** `GET /api/glowie/app/:appId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "appName": "Task Manager App",
    "description": "Build me a task manager...",
    "appType": "tool",
    "features": {
      "mobile": true,
      "darkMode": false,
      "localStorage": true,
      "animations": false,
      "icons": true,
      "modern": true
    },
    "colorScheme": "z2b",
    "codeSize": 15234,
    "generationTime": 3542,
    "aiModel": "claude-sonnet-4-20250514",
    "tokensUsed": 3890,
    "status": "completed",
    "downloads": 5,
    "views": 12,
    "isPublic": false,
    "tags": ["tool", "task", "productivity"],
    "userRating": 5,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:35:00.000Z"
  }
}
```

---

#### Get App Code

Retrieves the generated HTML code for an app.

**Endpoint:** `GET /api/glowie/app/:appId/code`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "code": "<!DOCTYPE html>\n<html>...",
    "appName": "Task Manager App"
  }
}
```

---

#### Track App Download

Records a download event for analytics.

**Endpoint:** `POST /api/glowie/app/:appId/download`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Download tracked",
  "data": {
    "downloads": 6
  }
}
```

---

#### Get User's Apps

Retrieves all apps for the authenticated user with pagination and filtering.

**Endpoint:** `GET /api/glowie/apps`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| appType | string | - | Filter by app type |
| status | string | completed | Filter by status |
| sortBy | string | createdAt | Sort field |
| order | string | desc | Sort order (asc/desc) |

**Example Request:**
```bash
GET /api/glowie/apps?page=1&limit=10&appType=tool&sortBy=createdAt&order=desc
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "appName": "Task Manager App",
      "appType": "tool",
      "codeSize": 15234,
      "generationTime": 3542,
      "downloads": 5,
      "views": 12,
      "status": "completed",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "pages": 2,
    "limit": 10
  }
}
```

---

#### Update App

Updates app metadata (name, rating, public status, etc.).

**Endpoint:** `PUT /api/glowie/app/:appId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "appName": "My Awesome Task Manager",
  "userRating": 5,
  "feedback": "Works perfectly!",
  "isPublic": true,
  "tags": ["tool", "productivity", "tasks"]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "App updated successfully",
  "data": { ... }
}
```

---

#### Delete App

Soft-deletes an app (changes status to 'deleted').

**Endpoint:** `DELETE /api/glowie/app/:appId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "App deleted successfully"
}
```

---

#### Generate Share Link

Creates a public shareable link for an app.

**Endpoint:** `POST /api/glowie/app/:appId/share`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "shareLink": "glowie-abc123xyz789",
    "shareUrl": "http://localhost:5000/shared/glowie-abc123xyz789"
  }
}
```

---

### User Settings

#### Get User Settings

Retrieves Glowie settings for the authenticated user.

**Endpoint:** `GET /api/glowie/settings`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasClaudeKey": true,
    "hasOpenAIKey": false,
    "defaultAppType": "landing",
    "defaultColorScheme": "z2b",
    "defaultFeatures": {
      "mobile": true,
      "darkMode": false,
      "localStorage": true,
      "animations": false,
      "icons": true,
      "modern": true
    },
    "generationsCount": 23,
    "monthlyLimit": 10,
    "monthlyUsage": 3,
    "remainingGenerations": 7,
    "resetDate": "2025-02-01T00:00:00.000Z"
  }
}
```

---

#### Update User Settings

Updates Glowie settings including API keys and preferences.

**Endpoint:** `PUT /api/glowie/settings`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "claudeApiKey": "sk-ant-api03-...",
  "openaiApiKey": "sk-...",
  "defaultAppType": "tool",
  "defaultColorScheme": "modern",
  "defaultFeatures": {
    "mobile": true,
    "darkMode": true,
    "localStorage": true,
    "animations": true,
    "icons": true,
    "modern": true
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "hasClaudeKey": true,
    "hasOpenAIKey": false,
    "defaultAppType": "tool",
    "defaultColorScheme": "modern",
    "defaultFeatures": { ... }
  }
}
```

**Note:** API keys are encrypted before storage using AES-256-CBC encryption.

---

### Statistics & Analytics

#### Get User Statistics

Retrieves generation statistics and usage analytics.

**Endpoint:** `GET /api/glowie/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalApps": 23,
    "totalDownloads": 145,
    "totalViews": 523,
    "avgGenerationTime": 3245.7,
    "avgCodeSize": 14532.3,
    "avgRating": 4.6,
    "monthlyLimit": 10,
    "monthlyUsage": 3,
    "remainingGenerations": 7
  }
}
```

---

#### Get Popular Apps

Retrieves popular public apps sorted by downloads and views.

**Endpoint:** `GET /api/glowie/popular`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | Number of apps to return |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "appName": "Task Manager Pro",
      "appType": "tool",
      "downloads": 523,
      "views": 2341,
      "userRating": 4.8,
      "tags": ["tool", "productivity"],
      "userId": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2025-01-10T10:30:00.000Z"
    }
  ]
}
```

---

## Data Models

### AppGeneration

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  appName: string,
  description: string,
  appType: 'landing' | 'dashboard' | 'form' | 'game' | 'tool' | 'other',
  features: {
    mobile: boolean,
    darkMode: boolean,
    localStorage: boolean,
    animations: boolean,
    icons: boolean,
    modern: boolean
  },
  colorScheme: 'z2b' | 'modern' | 'vibrant' | 'minimal' | 'custom',
  generatedCode: string,
  codeSize: number,
  generationTime: number,
  aiModel: string,
  promptUsed: string,
  tokensUsed: number,
  status: 'generating' | 'completed' | 'failed' | 'deleted',
  errorMessage?: string,
  downloads: number,
  lastDownloaded?: Date,
  views: number,
  isPublic: boolean,
  shareLink?: string,
  userRating?: number,
  feedback?: string,
  tags: string[],
  version: number,
  parentAppId?: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### UserSettings

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  glowie: {
    claudeApiKey: string (encrypted),
    openaiApiKey: string (encrypted),
    defaultAppType: string,
    defaultColorScheme: string,
    defaultFeatures: object,
    generationsCount: number,
    lastGenerationDate: Date,
    monthlyLimit: number,
    monthlyUsage: number,
    resetDate: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - No access to resource |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Internal error |

---

## Rate Limits

### Monthly Generation Limits

- **Free Tier:** 10 generations/month
- **Pro Tier:** 100 generations/month
- **Enterprise:** Unlimited

Limits reset on the 1st of each month.

### API Rate Limiting

- **General Endpoints:** 100 requests/minute
- **Generation Endpoint:** 5 requests/minute

---

## Examples

### Complete Generation Flow

#### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### 2. Save API Key
```bash
curl -X PUT http://localhost:5000/api/glowie/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "claudeApiKey": "sk-ant-api03-..."
  }'
```

#### 3. Generate App
```bash
curl -X POST http://localhost:5000/api/glowie/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Build me a simple todo app with add, complete, and delete functionality",
    "appType": "tool",
    "features": {
      "mobile": true,
      "darkMode": true,
      "localStorage": true
    },
    "colorScheme": "z2b"
  }'
```

#### 4. Get Generated Code
```bash
curl -X GET http://localhost:5000/api/glowie/app/<appId>/code \
  -H "Authorization: Bearer <token>"
```

#### 5. Download App
```bash
curl -X POST http://localhost:5000/api/glowie/app/<appId>/download \
  -H "Authorization: Bearer <token>"
```

---

### JavaScript/Frontend Example

```javascript
// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('auth_token');

// Generate app
async function generateApp() {
  const response = await fetch(`${API_BASE_URL}/glowie/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: 'Build me a task manager with priorities',
      appType: 'tool',
      features: {
        mobile: true,
        darkMode: false,
        localStorage: true
      },
      colorScheme: 'z2b'
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log('App generated!', data.data.appId);

    // Fetch the code
    const codeResponse = await fetch(
      `${API_BASE_URL}/glowie/app/${data.data.appId}/code`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const codeData = await codeResponse.json();
    console.log('Generated code:', codeData.data.code);
  }
}

// Get user stats
async function getStats() {
  const response = await fetch(`${API_BASE_URL}/glowie/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log('Stats:', data.data);
}

// Get app history
async function getApps() {
  const response = await fetch(
    `${API_BASE_URL}/glowie/apps?page=1&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await response.json();
  console.log('Apps:', data.data);
}
```

---

## Security Considerations

1. **API Key Encryption:** User API keys are encrypted using AES-256-CBC before storage
2. **Authentication Required:** All endpoints require valid JWT tokens
3. **Rate Limiting:** Prevents abuse with per-user and per-endpoint limits
4. **Input Validation:** All inputs are sanitized and validated
5. **Ownership Checks:** Users can only access/modify their own apps
6. **HTTPS Required:** Use HTTPS in production for encrypted transmission

---

## Support

For issues or questions:
- **GitHub:** https://github.com/Zero2Billionaires/Z2B/issues
- **Documentation:** See `/docs` folder
- **API Version:** Check `/api/test` endpoint

---

**Generated with Claude Code** 🤖
**Last Updated:** January 2025
