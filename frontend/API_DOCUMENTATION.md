# API Documentation - ClinicHub

Base URL: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require a JWT token sent via HTTP-only cookie or `Authorization: Bearer <token>` header.

### Register Clinic
**POST** `/auth/register-clinic`

Creates a new clinic and owner account.

**Request Body:**
```json
{
  "name": "City Health Clinic",
  "email": "admin@clinic.com",
  "password": "password123",
  "city": "New York",
  "specialty": "General Practice",
  "services": "Checkups, Vaccinations",
  "address": "123 Main St",
  "phone": "(555) 123-4567",
  "description": "Comprehensive healthcare"
}
```

**Response:** `201 Created`
```json
{
  "message": "Clinic registered successfully",
  "clinic": {
    "id": 1,
    "name": "City Health Clinic",
    "email": "admin@clinic.com",
    "city": "New York",
    "specialty": "General Practice"
  },
  "token": "eyJhbGc..."
}
```

### Login
**POST** `/auth/login`

Authenticates a user (clinic owner or staff).

**Request Body:**
```json
{
  "email": "admin@clinic.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "City Health Clinic",
    "email": "admin@clinic.com",
    "type": "clinic",
    "role": "owner",
    "clinic_id": 1
  },
  "token": "eyJhbGc..."
}
```

### Logout
**POST** `/auth/logout`

Clears authentication cookie.

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User
**GET** `/auth/me`

Returns current authenticated user.

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "City Health Clinic",
    "email": "admin@clinic.com",
    "role": "owner",
    "clinic_id": 1,
    "clinic": {
      "id": 1,
      "name": "City Health Clinic",
      "city": "New York",
      "specialty": "General Practice"
    }
  }
}
```

---

## Clinics

### List Clinics (Public)
**GET** `/clinics`

Returns all clinics with optional search filters.

**Query Parameters:**
- `city` (optional) - Filter by city
- `specialty` (optional) - Filter by specialty
- `search` (optional) - Search in name, description, services

**Response:** `200 OK`
```json
{
  "clinics": [
    {
      "id": 1,
      "name": "City Health Clinic",
      "email": "admin@clinic.com",
      "city": "New York",
      "specialty": "General Practice",
      "services": "Checkups, Vaccinations",
      "address": "123 Main St",
      "phone": "(555) 123-4567",
      "description": "Comprehensive healthcare",
      "created_at": "2025-11-23T00:00:00.000Z"
    }
  ]
}
```

### Get Clinic by ID (Public)
**GET** `/clinics/:id`

Returns detailed clinic information.

**Response:** `200 OK`
```json
{
  "clinic": {
    "id": 1,
    "name": "City Health Clinic",
    "email": "admin@clinic.com",
    "city": "New York",
    "specialty": "General Practice",
    "services": "Checkups, Vaccinations",
    "address": "123 Main St",
    "phone": "(555) 123-4567",
    "description": "Comprehensive healthcare",
    "created_at": "2025-11-23T00:00:00.000Z"
  }
}
```

### Update Clinic
**PUT** `/clinics/:id`

Updates clinic information.

**Auth Required:** Yes (Owner or Super Admin)

**Request Body:**
```json
{
  "name": "Updated Clinic Name",
  "city": "Los Angeles",
  "specialty": "Pediatrics",
  "services": "Child care, Vaccinations",
  "address": "456 Oak Ave",
  "phone": "(555) 234-5678",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "message": "Clinic updated successfully",
  "clinic": { /* updated clinic object */ }
}
```

---

## Users

### List Users
**GET** `/users`

Returns all users in the clinic.

**Auth Required:** Yes (Owner or Admin)

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": 1,
      "clinic_id": 1,
      "name": "Dr. Sarah Johnson",
      "email": "sarah@clinic.com",
      "role": "doctor",
      "created_at": "2025-11-23T00:00:00.000Z"
    }
  ]
}
```

### Create User
**POST** `/users`

Creates a new user in the clinic.

**Auth Required:** Yes (Owner or Admin)

**Request Body:**
```json
{
  "name": "Dr. John Doe",
  "email": "john@clinic.com",
  "password": "password123",
  "role": "doctor"
}
```

**Roles:** `admin`, `doctor`, `nurse`, `reception`, `billing`, `lab`, `pharmacist`, `patient`

**Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "clinic_id": 1,
    "name": "Dr. John Doe",
    "email": "john@clinic.com",
    "role": "doctor",
    "created_at": "2025-11-23T00:00:00.000Z"
  }
}
```

### Update User
**PUT** `/users/:id`

Updates user information.

**Auth Required:** Yes (Owner or Admin)

**Request Body:**
```json
{
  "name": "Dr. John Smith",
  "email": "johnsmith@clinic.com",
  "role": "admin",
  "password": "newpassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "User updated successfully",
  "user": { /* updated user object */ }
}
```

### Delete User
**DELETE** `/users/:id`

Deletes a user from the clinic.

**Auth Required:** Yes (Owner only)

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

---

## Patients

### List Patients
**GET** `/patients`

Returns all patients in the clinic.

**Auth Required:** Yes (Staff roles)

**Response:** `200 OK`
```json
{
  "patients": [
    {
      "id": 1,
      "clinic_id": 1,
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "(555) 111-2222",
      "birthdate": "1985-03-15",
      "gender": "male",
      "address": "100 Park Ave",
      "notes": "Allergic to penicillin",
      "created_at": "2025-11-23T00:00:00.000Z"
    }
  ]
}
```

### Get Patient by ID
**GET** `/patients/:id`

Returns detailed patient information.

**Auth Required:** Yes (Staff roles)

**Response:** `200 OK`
```json
{
  "patient": { /* patient object */ }
}
```

### Create Patient
**POST** `/patients`

Creates a new patient record.

**Auth Required:** Yes (Reception or Admin)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "(555) 222-3333",
  "birthdate": "1990-07-22",
  "gender": "female",
  "address": "200 Broadway",
  "notes": "No known allergies"
}
```

**Response:** `201 Created`
```json
{
  "message": "Patient created successfully",
  "patient": { /* patient object */ }
}
```

### Update Patient
**PUT** `/patients/:id`

Updates patient information.

**Auth Required:** Yes (Staff roles)

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "(555) 333-4444",
  "address": "300 Fifth Ave",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "message": "Patient updated successfully",
  "patient": { /* updated patient object */ }
}
```

### Delete Patient
**DELETE** `/patients/:id`

Deletes a patient record.

**Auth Required:** Yes (Admin or Owner)

**Response:** `200 OK`
```json
{
  "message": "Patient deleted successfully"
}
```

---

## Appointments

### List Appointments
**GET** `/appointments`

Returns appointments (filtered by role).

**Auth Required:** Yes (Staff roles)

**Query Parameters:**
- `date` (optional) - Filter by date (YYYY-MM-DD)
- `status` (optional) - Filter by status
- `patient_id` (optional) - Filter by patient
- `doctor_id` (optional) - Filter by doctor

**Response:** `200 OK`
```json
{
  "appointments": [
    {
      "id": 1,
      "clinic_id": 1,
      "patient_id": 1,
      "doctor_id": 1,
      "date": "2025-11-25",
      "time": "09:00",
      "status": "confirmed",
      "notes": "Annual checkup",
      "patient_name": "John Smith",
      "patient_phone": "(555) 111-2222",
      "doctor_name": "Dr. Sarah Johnson",
      "created_at": "2025-11-23T00:00:00.000Z"
    }
  ]
}
```

### Get Appointment by ID
**GET** `/appointments/:id`

Returns detailed appointment information.

**Auth Required:** Yes (Staff roles)

**Response:** `200 OK`
```json
{
  "appointment": { /* appointment object with patient and doctor details */ }
}
```

### Create Appointment
**POST** `/appointments`

Creates a new appointment.

**Auth Required:** Yes (Reception or Admin)

**Request Body:**
```json
{
  "patient_id": 1,
  "doctor_id": 1,
  "date": "2025-11-25",
  "time": "09:00",
  "notes": "Annual checkup"
}
```

**Response:** `201 Created`
```json
{
  "message": "Appointment created successfully",
  "appointment": { /* appointment object */ }
}
```

### Update Appointment
**PUT** `/appointments/:id`

Updates appointment information.

**Auth Required:** Yes (Staff roles)

**Request Body:**
```json
{
  "doctor_id": 2,
  "date": "2025-11-26",
  "time": "10:00",
  "status": "confirmed",
  "notes": "Rescheduled"
}
```

**Status values:** `pending`, `confirmed`, `canceled`, `completed`

**Response:** `200 OK`
```json
{
  "message": "Appointment updated successfully",
  "appointment": { /* updated appointment object */ }
}
```

### Cancel Appointment
**DELETE** `/appointments/:id`

Cancels an appointment (soft delete).

**Auth Required:** Yes (Reception or Admin)

**Response:** `200 OK`
```json
{
  "message": "Appointment canceled successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## RBAC Permission Matrix

| Role | Clinics | Users | Patients | Appointments |
|------|---------|-------|----------|--------------|
| Super Admin | All | All | All | All |
| Owner | Update own | CRUD | CRUD | CRUD |
| Admin | Read | CRU | CRUD | CRUD |
| Doctor | Read | - | RU | RU |
| Nurse | Read | - | RU | R |
| Reception | Read | - | CRU | CRUD |
| Billing | Read | - | R | R |
| Lab | Read | - | R | R |
| Pharmacist | Read | - | R | R |
| Patient | - | - | - | Own only |

**Legend:** C=Create, R=Read, U=Update, D=Delete
