# CodeStream API Documentation

This document offers an overview of the REST API endpoints and available functions developed so far for the CodeStream application.

## Authentication Routes

Base Path: `/auth`

### 1. Initiate Google Login
- **Endpoint**: `GET /auth/google`
- **Description**: Initiates the Google OAuth2 login flow. Scopes include `profile` and `email`.

### 2. Google OAuth Callback
- **Endpoint**: `GET /auth/google/callback`
- **Description**: Handles the callback from Google OAuth2. 
- **Response**: Upon successful authentication, it redirects the user back to the frontend (e.g., `http://localhost:3000/?token=<JWT_TOKEN>`) with a generated JWT token as a url parameter.

### 3. Get Current User
- **Endpoint**: `GET /auth/me`
- **Authentication**: Required (Requires a valid JWT token).
- **Description**: Returns the details of the currently authenticated user.
- **Response**: JSON string indicating successful authentication and user information.

---

## Room Management Routes

Base Path: `/room`  
**All endpoints require authentication (Valid JWT token).**

### 1. Create a Room
- **Endpoint**: `POST /room/`
- **Description**: Creates a new code room/session and sets the creator as the initial `owner` in the `room_participants` table.
- **Body payload**:
  ```json
  {
    "name": "My Code Room",
    "language": "java", // optional, defaults to 'java'
    "is_private": false // optional, defaults to false
  }
  ```
- **Response**: Returns the created room details.

### 2. Leave an Existing Room
- **Endpoint**: `DELETE /room/`
- **Description**: Removes the current logged-in user from the specified room. Room Owners cannot leave unless they pass the ownership of the room.
- **Body payload**:
  ```json
  {
    "roomId": "room-uuid"
  }
  ```

### 3. Add a Member to a Room
- **Endpoint**: `POST /room/add`
- **Description**: Adds another user to the room. If the room is private, only the owner can add members.
- **Body payload**:
  ```json
  {
    "roomId": "room-uuid",
    "targetUserId": "user-uuid",
    "role": "editor" // 'viewer' or 'editor' or 'owner' (optional, defaults to 'editor')
  }
  ```

### 4. Change Room Ownership
- **Endpoint**: `POST /room/changeOwner`
- **Description**: Transfers the room ownership from the current owner to another member (Not fully detailed yet, but route is provided in `room.controller.ts`).
- **Body payload**:
  ```json
  {
    "roomId": "room-uuid",
    "newOwnerId": "user-uuid"
  }
  ```
