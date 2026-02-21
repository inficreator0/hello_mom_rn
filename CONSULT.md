# Get Doctors API Documentation

## Overview
A new API endpoint `/api/doctors` has been introduced to the Motherhood Community application. This feature allows front-end clients to fetch a comprehensive list of medical professionals (doctors) and display their detailed profiles to users seeking consultations.

## Endpoints

### 1. Get All Doctors

**Endpoint:** `GET /api/doctors`

**Authentication:** 
Requires a valid Bearer token in the `Authorization` header.

**Response:**
Returns a JSON array containing doctor profiles. A `200 OK` status is returned upon success.

#### Example Response:

```json
[
  {
    "id": 1,
    "name": "Dr. Sarah Miller",
    "specialization": "Pediatrics",
    "fees": 150.00,
    "rating": 4.9,
    "experienceYears": 12,
    "numberOfConsultations": 1240,
    "languages": "English, Spanish",
    "phoneNumber": "+1-555-0198"
  },
  {
    "id": 2,
    "name": "Dr. James Chen",
    "specialization": "Obstetrics",
    "fees": 200.00,
    "rating": 4.7,
    "experienceYears": 8,
    "numberOfConsultations": 850,
    "languages": "English, Mandarin",
    "phoneNumber": "+1-555-0210"
  }
]
```

### 2. Get Doctor Summary

**Endpoint:** `GET /api/doctors/summary`

**Authentication:** 
Requires a valid Bearer token in the `Authorization` header.

**Response:**
Returns a JSON object containing the total number of doctors and total number of sessions given. A `200 OK` status is returned upon success.

#### Example Response:

```json
{
  "totalDoctors": 15,
  "totalSessions": 5420
}
```

## Implementation Details

The implementation spans across the standard Spring Boot layered architecture:

### 1. Entity Layer (`Doctor.java`)
A new JPA entity `Doctor` mapping to the `doctors` table in the database was created. The entity encapsulates the following properties:
- `id`: Auto-generated unique identifier (Primary Key).
- `name`: Full name of the physician.
- `specialization`: The doctor's area of medical expertise (e.g., Pediatrics, Obstetrics).
- `fees`: Consultation charge (Double).
- `rating`: Overall patient rating (Double).
- `experienceYears`: Integer representing years of medical experience.
- `numberOfConsultations`: Total number of consultations conducted.
- `languages`: A comma-separated string indicating the languages spoken by the doctor.
- `phoneNumber`: Contact number for the doctor or clinic.

### 2. Repository Layer (`DoctorRepository.java`)
A standard Spring Data JPA `JpaRepository` interface was introduced to handle seamless interaction with the `doctors` table, enabling standard CRUD operations without custom query writing.

### 3. Data Transfer Objects (`DoctorResponse.java`, `DoctorSummaryResponse.java`)
To maintain separation of concerns, `DoctorResponse` maps the list of doctors, and `DoctorSummaryResponse` maps the summary aggregates (total doctors, total sessions).

### 4. Service Layer (`DoctorService.java`)
The core business logic resides here. A method `getAllDoctors()` queries the `DoctorRepository` for all existing records, iterates through the resulting collection of `Doctor` entities, and securely maps them into a list of `DoctorResponse` DTOs.

### 5. Controller Layer (`DoctorController.java`)
The REST controller defining the routing logic. It defines the `@GetMapping` annotation on the class-level `/api/doctors` route and links to the service's retrieval methods. The new `/summary` subpath routes directly to the aggregated summary response.