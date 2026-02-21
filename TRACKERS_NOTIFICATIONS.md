# Tracker Notification Settings API Documentation

## Overview
The platform has been updated to allow users to control notifications on a per-tracker basis, including broad tracker toggles and granular sub-tracker toggles. Previously, users could only toggle broad notification channels globally (Email, Push, In-App). These new settings give users granular control over alerts from the following trackers:
- Cycle Tracker
- Health Tracker (with granular toggles for Water, Sleep, and Mood reminders)
- Pregnancy Tracker
- Baby Tracker (with granular toggles for Feeding reminders)

## API Reference

The endpoints are authenticated. Clients must include a valid Bearer token in the `Authorization` header.

### 1. Get Settings
Retrieves the current user's notification preferences for all channels and trackers.

**Endpoint:** `GET /api/notifications/settings`
**Headers:**
- `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "enableEmail": true,
  "enablePush": true,
  "enableInApp": true,
  "enableCycleTracker": true,
  "enablePregnancyTracker": true,
  "enableBabyGrowthTracker": true,
  "enableWaterReminder": true,
  "enableSleepReminder": true,
  "enableMoodReminder": true,
  "enableFeedingReminders": true
}
```

### 2. Update Settings
Updates the current user's notification preferences. The request body must contain all fields, as it replaces the existing settings.

**Endpoint:** `PUT /api/notifications/settings`
**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "enableEmail": true,
  "enablePush": true,
  "enableInApp": true,
  "enableCycleTracker": false,
  "enablePregnancyTracker": false,
  "enableBabyGrowthTracker": true,
  "enableWaterReminder": false,
  "enableSleepReminder": true,
  "enableMoodReminder": true,
  "enableFeedingReminders": false
}
```

**Response (200 OK):**
Returns the updated settings object.

```json
{
  "enableEmail": true,
  "enablePush": true,
  "enableInApp": true,
  "enableCycleTracker": false,
  "enablePregnancyTracker": false,
  "enableBabyGrowthTracker": true,
  "enableWaterReminder": false,
  "enableSleepReminder": true,
  "enableMoodReminder": true,
  "enableFeedingReminders": false
}
```

### 3. Test Scheduler Endpoints (Development Only)
Triggers the scheduled background jobs for health tracker reminders manually without having to wait for the cron schedule. This is unauthenticated and purely for development and testing.

**Endpoint:** `POST /api/notifications/test-scheduler/{type}`
**Headers:** None (Unauthenticated)

**Path Variable `{type}` options:**
- `water`: Triggers water intake reminders.
- `sleep`: Triggers sleep logging reminders.
- `weight`: Triggers weight logging reminders.
- `mood`: Triggers mood check-in reminders.

**Response (200 OK):**
```text
Triggered water scheduler successfully.
```

### 4. Test User Notification (Development Only)
Sends a system alert notification to a specific user. This endpoint is unauthenticated and intended for development testing.

**Endpoint:** `POST /api/notifications/test-user`
**Headers:** None (Unauthenticated)

**Query Parameters:**
- `username` (required): The username of the user receiving the notification.
- `title` (optional): The notification title (default: "Test Notification").
- `message` (optional): The notification message (default: "This is a test notification for a specific user").

**Response (200 OK):**
```text
Test notification sent to user: shubham
```

## Implementation Details

### Database Layer
The `notification_settings` table (mapped to the `NotificationSetting` JPA entity) has been extended with the following boolean columns:
- `enable_cycle_tracker`
- `enable_pregnancy_tracker`
- `enable_baby_growth_tracker`
- `enable_water_reminder`
- `enable_sleep_reminder`
- `enable_mood_reminder`
- `enable_feeding_reminders`

By default, when a user is created or when their settings record is generated for the first time, all settings (channels and trackers) default to `true`.

### Service Logic (`NotificationService`)
- When fetching or updating settings, the service ensures a settings record exists for the user. If not, it generates a default one on the fly using `createDefaultSettings()`.
- Updates only affect the boolean flags for channels and trackers, ensuring sensitive fields like `deviceEndpointArn` are not tampered with via this API.
- The endpoints are surfaced through `NotificationController`.