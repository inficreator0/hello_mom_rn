# Baby Growth Tracker API Documentation

The Baby Growth Tracker allows parents to monitor their baby's physical development by logging weight, height, and head circumference over time.

---

## 🏗️ Data Model

### BabyGrowth Object
| Field | Type | Description |
|---|---|---|
| `id` | Long | Unique identifier of the growth log |
| `weightKg` | Double | Baby's weight in kilograms |
| `heightCm` | Double | Baby's height/length in centimeters |
| `headCircumferenceCm` | Double | Head circumference in centimeters |
| `logDate` | LocalDate | Date of the measurement (YYYY-MM-DD) |
| `notes` | String | Optional observations or notes |
| `createdAt` | Instant | Timestamp when log was created |
| `updatedAt` | Instant | Timestamp when log was last updated |

---

## 🚀 API Endpoints

### 1. Log Growth Entry
Log new physical metrics for a specific baby.

**URL:** `POST /api/users/me/babies/{babyId}/growth`

**Sample Request:**
```json
{
  "weightKg": 4.2,
  "heightCm": 54.5,
  "headCircumferenceCm": 36.2,
  "logDate": "2026-02-21",
  "notes": "Healthy growth spurt!"
}
```

**Sample Response (201 Created):**
```json
{
  "id": 10,
  "weightKg": 4.2,
  "heightCm": 54.5,
  "headCircumferenceCm": 36.2,
  "logDate": "2026-02-21",
  "notes": "Healthy growth spurt!",
  "createdAt": "2026-02-21T07:07:02.123Z",
  "updatedAt": "2026-02-21T07:07:02.123Z"
}
```

---

### 2. Get Growth History
Retrieve all growth logs for a specific baby, ordered by date (descending).

**URL:** `GET /api/users/me/babies/{babyId}/growth`

**Sample Response (200 OK):**
```json
[
  {
    "id": 10,
    "weightKg": 4.2,
    "heightCm": 54.5,
    "headCircumferenceCm": 36.2,
    "logDate": "2026-02-21",
    "notes": "Healthy growth spurt!",
    "createdAt": "2026-02-21T07:07:02.123Z",
    "updatedAt": "2026-02-21T07:07:02.123Z"
  },
  {
    "id": 5,
    "weightKg": 3.5,
    "heightCm": 50.0,
    "headCircumferenceCm": 35.0,
    "logDate": "2026-01-21",
    "notes": "Birth measurements",
    "createdAt": "2026-01-21T10:00:00Z",
    "updatedAt": "2026-01-21T10:00:00Z"
  }
]
```

---

### 3. Update Growth Entry
Modify an existing growth log. You only need to send the fields you want to update.

**URL:** `PUT /api/users/me/babies/growth/{id}`

**Sample Request:**
```json
{
  "weightKg": 4.3,
  "notes": "Correction: weight was slightly higher"
}
```

**Sample Response (200 OK):**
```json
{
  "id": 10,
  "weightKg": 4.3,
  "heightCm": 54.5,
  "headCircumferenceCm": 36.2,
  "logDate": "2026-02-21",
  "notes": "Correction: weight was slightly higher",
  "createdAt": "2026-02-21T07:07:02.123Z",
  "updatedAt": "2026-02-21T07:15:45.987Z"
}
```

---

### 4. Delete Growth Entry
Permanently remove a growth log record.

**URL:** `DELETE /api/users/me/babies/growth/{id}`

**Sample Response (200 OK):**
```json
{
  "message": "Growth log deleted successfully"
}
```

---

## 🔒 Security & Authorization
- **Ownership**: Users can only access growth logs for babies that belong to their account.
- **Validation**:
    - `logDate` is required.
    - Growth metrics (weight, height, etc.) are optional in updates but should be positive numbers.
- **Authentication**: All endpoints require a valid JWT token in the `Authorization` header.