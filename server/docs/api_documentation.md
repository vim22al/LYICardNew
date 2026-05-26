# LYICard API Documentation

This document provides a comprehensive guide to the LYICard backend API, including endpoint details, authentication requirements, and a typical Postman workflow.

## Base Configuration
- **Base URL:** `http://localhost:8000/api`
- **Content-Type:** `application/json`
- **Auth Strategy:** Bearer Token (JWT)

---

## 🔐 Authentication (`/auth`)

### 1. Register
Create a new user account.
- **Endpoint:** `POST /auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "name": "John Doe"
  }
  ```
- **Response:** `201 Created` with JWT token and user details.

### 2. Login
Authenticate an existing user.
- **Endpoint:** `POST /auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:** `200 OK` with JWT token and user details.

### 3. Google Login
Authenticate via Google OAuth.
- **Endpoint:** `POST /auth/google`
- **Body:** (Provide either `idToken` or `accessToken`)
  ```json
  {
    "idToken": "google_id_token_from_client",
    "accessToken": "google_access_token_from_client"
  }
  ```
- **Response:** `200 OK` with JWT token and user details (including `avatar` and `authMethod`).

### 4. Forgot Password
Request a password reset link via email.
- **Endpoint:** `POST /auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:** `200 OK` (Message: "If an account exists... a reset link will be sent.")

### 5. Reset Password
Reset password using the secret token received via email.
- **Endpoint:** `POST /auth/reset-password`
- **Body:**
  ```json
  {
    "token": "secret_token_from_email",
    "password": "newpassword123",
    "confirmPassword": "newpassword123"
  }
  ```
- **Response:** `200 OK`

---

## 👤 Contacts (`/contacts`)
*Requires Authorization Header: `Bearer <token>`*

### 1. Scan Business Card
Start the AI extraction process from an image.
- **Endpoint:** `POST /contacts/scan`
- **Body:** `Multipart/form-data` with `image` file OR JSON with base64 `image`.
- **Response:** `202 Accepted` with `contactId` and status `processing`.

### 2. Get All Contacts
- **Endpoint:** `GET /contacts`
- **Query Params:** `search`, `status`, `sortBy`, `order`
- **Response:** Array of contact objects.

### 3. Get Contact by ID
- **Endpoint:** `GET /contacts/:id`

### 4. Update Contact
- **Endpoint:** `PATCH /contacts/:id`
- **Body:** Fields to update (e.g., `name`, `email`, `company`).

### 5. Delete Contact
- **Endpoint:** `DELETE /contacts/:id` (Soft delete)

---

## 📄 Templates (`/templates`)
*Requires Authorization Header: `Bearer <token>`*

- **Endpoint:** `POST /templates`
- **Body:** `Multipart/form-data` (recommended for attachments) or `JSON`.
- **Fields:**
  - `name`: String (Required)
  - `type`: `email` | `whatsapp` (Required)
  - `body`: String (Required)
  - `subject`: String (Optional)
  - `header`: String (Optional)
  - `isDefault`: Boolean/String (Optional)
  - `files`: File[] (Optional, max 10MB each)
- **Update with Attachments:** When updating via `PATCH /templates/:id`, send `existingAttachmentIds` (Array of Strings) to preserve old files, and `files` for new ones.

### 2. Get All Templates
- **Endpoint:** `GET /templates`
- **Query Params:** `type`, `search`

### 3. Update/Delete Template
- `PATCH /templates/:id` (e.g., `{"isDefault": true}`)
- `DELETE /templates/:id`

---

## 🚀 Campaigns (`/campaigns`)
*Requires Authorization Header: `Bearer <token>`*

### 1. Create Campaign
- **Endpoint:** `POST /campaigns`
- **Body:**
  ```json
  {
    "name": "Conference Follow-up",
    "templateId": "template_id",
    "contacts": ["contact_id_1", "contact_id_2"]
  }
  ```

### 2. Update Campaign
- **Endpoint:** `PATCH /campaigns/:id`
- **Body:** Any fields from the creation body (e.g., `name`, `templateId`, `contacts`).

### 2. Manage Contacts in Campaign
- **Add:** `POST /campaigns/:id/contacts` (Body: `{"contactIds": []}`)
- **Remove:** `DELETE /campaigns/:id/contacts` (Body: `{"contactIds": []}`)

### 3. Send Campaign
Trigger the background worker to dispatch emails.
- **Endpoint:** `POST /campaigns/:id/send`
- **Response:** `200 OK` with `jobId`.

---

## 📊 Dashboard (`/dashboard`)
*Requires Authorization Header: `Bearer <token>`*

### 1. Get Dashboard Summary
Retrieve a high-level overview of account activity and analytics.
- **Endpoint:** `GET /dashboard`
- **Response:**
  ```json
  {
    "stats": {
      "totalContacts": 150,
      "totalCampaigns": 12,
      "totalTemplates": 8,
      "totalReach": 450
    },
    "analytics": {
      "scansOverTime": [{ "_id": "2024-04-20", "count": 5 }],
      "campaignStatus": [{ "_id": "completed", "count": 4 }]
    },
    "recentActivity": {
      "contacts": [...],
      "campaigns": [...]
    }
  }
  ```

---

## 🛠️ Postman Flow & Setup

### 1. Environment Variables
Create a Postman Environment with:
- `baseUrl`: `http://localhost:8000/api`
- `token`: (Leave empty, will be set by login)

### 2. Suggested Workflow (The "Happy Path")

1.  **Auth:** Call `POST /auth/login`. Copy the `token` from the response.
2.  **Setup Auth:** In Postman, go to the Collection's **Authorization** tab, select **Bearer Token**, and use `{{token}}`.
3.  **Scan Card:** Call `POST /contacts/scan` with a business card image. Note the `contactId`.
4.  **Check Progress:** Call `GET /contacts/:contactId` until `status` is `completed`.
5.  **Create Template:** Call `POST /templates` to create a follow-up email.
6.  **Create Campaign:** Call `POST /campaigns` using the `contactId` and `templateId`.
7.  **Dispatch:** Call `POST /campaigns/:id/send` to start the automation.

### 3. Pro Tip: Auto-set Token
In the **Tests** tab of your Login request, add:
```javascript
const response = pm.response.json();
if (response.token) {
    pm.environment.set("token", response.token);
}
```
