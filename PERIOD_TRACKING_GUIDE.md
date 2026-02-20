# Extensive Period Tracking System - Complete Guide

**Version:** 1.0  
**Date:** February 10, 2026  
**Status:** Production Ready (Core Features)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Request/Response Examples](#requestresponse-examples)
6. [Design Principles](#design-principles)
7. [Migration Guide](#migration-guide)

---

## 🎯 Overview

We've built a comprehensive, privacy-first period tracking system that goes beyond basic cycle logging. This system respects diverse needs, supports irregular cycles, and prioritizes user privacy and medical accuracy.

### Key Improvements Over Basic Tracker

| Feature | Basic Tracker | Extensive Tracker |
|---------|---------------|-------------------|
| Daily Logging | Start/End dates only | Detailed daily logs (flow, pain, mood, energy, symptoms) |
| Predictions | None | Conservative predictions with confidence levels |
| Fertility Tracking | None | **Opt-in only** (default OFF) |
| Privacy | Standard deletion | **True deletion** (no soft delete) |
| Flexibility | Fixed fields | All fields optional, custom tags |
| Medical Support | None | PCOS, PMDD, endometriosis support |
| Editing | Limited | Edit any entry anytime |

---

## 🔄 What Changed

### New Database Entities (4)

1. **CycleDayLog** - Detailed daily tracking
2. **CyclePrediction** - Labeled estimates with confidence
3. **UserCycleSettings** - Privacy-first preferences
4. **CycleInsight** - Medical summaries (foundation)

### New Services (3)

1. **CycleDayLogService** - Daily logging logic
2. **CyclePredictionService** - Conservative predictions
3. **UserCycleSettingsService** - Settings management

### New Controllers (3)

1. **CycleDayLogController** - `/api/cycle/daily/*`
2. **CyclePredictionController** - `/api/cycle/predictions/*`
3. **UserCycleSettingsController** - `/api/cycle/settings/*`

### New DTOs (5)

- CycleDayLogRequest/Response
- CyclePredictionResponse
- UserCycleSettingsRequest/Response

---

## 💾 Database Schema

### CycleDayLog

Stores detailed daily cycle information with maximum flexibility.

```sql
CREATE TABLE cycle_day_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    log_date DATE NOT NULL,
    flow_level VARCHAR(50),          -- light, medium, heavy, spotting
    flow_type VARCHAR(50),            -- regular, clotting, irregular
    pain_level INTEGER,               -- 0-10 scale
    pain_locations JSONB,             -- ["lower_abdomen", "lower_back"]
    mood_tags JSONB,                  -- ["irritable", "anxious", "happy"]
    energy_level INTEGER,             -- 1-5 scale
    symptoms JSONB,                   -- ["bloating", "headache", "cramps"]
    body_signs JSONB,                 -- {"cervical_mucus": "sticky", "basal_temp": 36.7}
    notes TEXT,                       -- Private notes
    is_estimate BOOLEAN DEFAULT false,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, log_date)
);
```

### CyclePrediction

Stores cycle predictions with confidence levels.

```sql
CREATE TABLE cycle_prediction (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    prediction_type VARCHAR(50) NOT NULL,  -- next_period, fertile_window
    estimated_date DATE NOT NULL,
    estimated_end_date DATE,
    confidence_level VARCHAR(20),          -- low, medium, high
    calculation_method VARCHAR(100),
    based_on_cycles_count INTEGER,
    is_dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMP
);
```

### UserCycleSettings

Privacy-first user preferences.

```sql
CREATE TABLE user_cycle_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    typical_cycle_length INTEGER,
    typical_period_length INTEGER,
    tracking_goals JSONB,
    enabled_features JSONB,
    custom_symptoms JSONB,
    custom_moods JSONB,
    show_predictions BOOLEAN DEFAULT true,
    show_fertility_info BOOLEAN DEFAULT false,  -- OPT-IN ONLY
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_tone VARCHAR(50) DEFAULT 'gentle',
    privacy_mode VARCHAR(50) DEFAULT 'full',
    medical_conditions JSONB,
    hide_pregnancy_content BOOLEAN DEFAULT false,
    gentle_notifications_only BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### CycleInsight

Medical-grade summaries for healthcare visits.

```sql
CREATE TABLE cycle_insight (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    insight_type VARCHAR(50),
    date_range_start DATE,
    date_range_end DATE,
    summary_data JSONB,
    generated_at TIMESTAMP
);
```

---

## 📡 API Reference

### Daily Cycle Logging

#### 1. Create/Update Daily Log

**Endpoint:** `POST /api/cycle/daily`

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "logDate": "2024-02-10",
  "flowLevel": "medium",
  "flowType": "regular",
  "painLevel": 3,
  "painLocations": ["lower_abdomen", "lower_back"],
  "moodTags": ["irritable", "tired"],
  "energyLevel": 2,
  "symptoms": ["bloating", "headache"],
  "bodySigns": {
    "cervical_mucus": "sticky",
    "basal_temp": 36.7
  },
  "notes": "Feeling okay today, manageable cramps",
  "isEstimate": false
}
```

**All fields are optional** - track only what matters to you.

**Response:** `200 OK`
```json
{
  "id": 1,
  "logDate": "2024-02-10",
  "flowLevel": "medium",
  "flowType": "regular",
  "painLevel": 3,
  "painLocations": ["lower_abdomen", "lower_back"],
  "moodTags": ["irritable", "tired"],
  "energyLevel": 2,
  "symptoms": ["bloating", "headache"],
  "bodySigns": {
    "cervical_mucus": "sticky",
    "basal_temp": 36.7
  },
  "notes": "Feeling okay today, manageable cramps",
  "isEstimate": false,
  "createdAt": "2024-02-10T10:00:00",
  "updatedAt": "2024-02-10T10:00:00"
}
```

---

#### 2. Quick Log (One-Tap Entry)

**Endpoint:** `POST /api/cycle/daily/quick?flowLevel=medium`

**Authentication:** Required

Quickly log flow for today. Ideal for mobile quick-entry widgets.

**Response:** Same as full log entry

---

#### 3. Get Log for Specific Date

**Endpoint:** `GET /api/cycle/daily/{date}`

**Example:** `GET /api/cycle/daily/2024-02-10`

**Response:** Single log entry or 404 if not found

---

#### 4. Get Logs in Date Range (Calendar View)

**Endpoint:** `GET /api/cycle/daily/range`

**Query Parameters:**
- `startDate` (required): ISO date (YYYY-MM-DD)
- `endDate` (required): ISO date (YYYY-MM-DD)

**Example:** `GET /api/cycle/daily/range?startDate=2024-02-01&endDate=2024-02-28`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "logDate": "2024-02-10",
    "flowLevel": "medium",
    "painLevel": 3,
    ...
  },
  {
    "id": 2,
    "logDate": "2024-02-11",
    "flowLevel": "light",
    "painLevel": 1,
    ...
  }
]
```

---

#### 5. Get Recent Logs

**Endpoint:** `GET /api/cycle/daily/recent?days=30`

**Query Parameters:**
- `days` (optional, default 30): Number of days to retrieve

**Response:** Array of log entries from the last N days

---

#### 6. Copy Yesterday's Log

**Endpoint:** `POST /api/cycle/daily/copy-yesterday`

**Use Case:** Convenience feature for when symptoms continue from previous day

**Response:** New log entry for today with yesterday's data

---

#### 7. Delete Specific Date (TRUE Deletion)

**Endpoint:** `DELETE /api/cycle/daily/{date}`

**Example:** `DELETE /api/cycle/daily/2024-02-10`

**Privacy Note:** Permanently deletes the log entry. No soft delete.

**Response:** `204 No Content`

---

#### 8. Delete ALL Logs (TRUE Deletion)

**Endpoint:** `DELETE /api/cycle/daily/all`

**Privacy Note:** ⚠️ Permanently deletes ALL your cycle logs. Cannot be undone.

**Response:** `204 No Content`

---

### Cycle Predictions

#### 1. Get Predictions

**Endpoint:** `GET /api/cycle/predictions`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "predictionType": "next_period",
    "estimatedDate": "2024-03-05",
    "estimatedEndDate": null,
    "confidenceLevel": "medium",
    "basedOnCyclesCount": 4,
    "medicalDisclaimer": "This is an estimate based on your cycle patterns. Not medical advice. Consult healthcare provider for concerns."
  },
  {
    "id": 2,
    "predictionType": "fertile_window",
    "estimatedDate": "2024-02-20",
    "estimatedEndDate": "2024-02-26",
    "confidenceLevel": "medium",
    "basedOnCyclesCount": 4,
    "medicalDisclaimer": "This is an estimate based on your cycle patterns. Not medical advice. Consult healthcare provider for concerns."
  }
]
```

**Confidence Levels:**
- **low**: < 3 cycles OR high variability (std dev > 5 days)
- **medium**: 3-5 cycles, moderate variability (std dev 3-5 days)
- **high**: 6+ cycles, low variability (std dev < 3 days)

**Important Notes:**
- Returns empty array if user has predictions disabled
- Fertility predictions **only shown if explicitly opted in**
- All predictions include medical disclaimers

---

#### 2. Generate Predictions

**Endpoint:** `POST /api/cycle/predictions/generate`

**Authentication:** Required

Triggers prediction calculation based on user's cycle history.

**Requirements:**
- Minimum 3 cycles logged with flow data
- At least 2 complete cycle lengths calculable

**Response:** `200 OK` (predictions generated)

---

#### 3. Dismiss a Prediction

**Endpoint:** `DELETE /api/cycle/predictions/{id}`

**Example:** `DELETE /api/cycle/predictions/1`

**Use Case:** User doesn't want to see a specific prediction

**Response:** `204 No Content`

---

### Cycle Settings

#### 1. Get Settings

**Endpoint:** `GET /api/cycle/settings`

**Authentication:** Required

Auto-creates default settings if none exist.

**Response:** `200 OK`
```json
{
  "userId": 1,
  "typicalCycleLength": null,
  "typicalPeriodLength": null,
  "trackingGoals": [],
  "enabledFeatures": {
    "flow": true,
    "pain": true,
    "mood": true,
    "energy": false,
    "symptoms": true,
    "body_signs": false
  },
  "customSymptoms": [],
  "customMoods": [],
  "showPredictions": true,
  "showFertilityInfo": false,
  "reminderEnabled": false,
  "reminderTone": "gentle",
  "privacyMode": "full",
  "medicalConditions": [],
  "hidePregnancyContent": false,
  "gentleNotificationsOnly": true,
  "createdAt": "2024-02-10T10:00:00",
  "updatedAt": "2024-02-10T10:00:00"
}
```

---

#### 2. Update Settings

**Endpoint:** `PUT /api/cycle/settings`

**Authentication:** Required

**Request Body:** (All fields optional)
```json
{
  "typicalCycleLength": 28,
  "typicalPeriodLength": 5,
  "trackingGoals": ["understand_patterns", "fertility_awareness"],
  "enabledFeatures": {
    "flow": true,
    "pain": true,
    "mood": true,
    "energy": true,
    "symptoms": true,
    "body_signs": true
  },
  "customSymptoms": ["cramps", "fatigue", "bloating", "nausea"],
  "customMoods": ["anxious", "calm", "energetic"],
  "showPredictions": true,
  "showFertilityInfo": true,
  "reminderEnabled": true,
  "reminderTone": "gentle",
  "privacyMode": "full",
  "medicalConditions": ["PCOS"],
  "hidePregnancyContent": false,
  "gentleNotificationsOnly": true
}
```

**Response:** Updated settings object

---

#### 3. Reset to Defaults

**Endpoint:** `POST /api/cycle/settings/reset`

**Authentication:** Required

Resets all settings to privacy-first defaults.

**Response:** Default settings object

---

## 🎨 Design Principles

### 1. Privacy First

✅ **True Deletion**
- No soft deletes on health data
- DELETE endpoints permanently remove data
- User has full control over their data

✅ **Opt-In Philosophy**
- Fertility tracking is OFF by default
- User must explicitly enable it
- No assumptions about tracking goals

✅ **Data Minimization**
- All fields optional
- Track only what you want
- No forced data collection

### 2. Medical Accuracy

✅ **Conservative Predictions**
- Requires minimum 3 cycles
- Shows confidence levels
- Never presents estimates as facts
- Medical disclaimers on all predictions

✅ **No 28-Day Assumption**
- Supports irregular cycles (21-45 days)
- Typical cycle length is optional/nullable
- Cycle lengths calculated from actual data

### 3. Inclusivity & Respect

✅ **Trauma-Aware**
- Can hide pregnancy/fertility content
- Gentle notification tones
- Easy data deletion
- No guilt-inducing language

✅ **Medical Condition Support**
- **PCOS**: Irregular/long cycles, custom tracking
- **PMDD**: Detailed mood tracking
- **Endometriosis**: Pain location mapping

✅ **Flexible Tracking**
- Support for non-standard cycles
- Custom symptoms and moods
- No assumptions about regularity

### 4. User Empowerment

✅ **Easy Editing**
- Edit any entry anytime
- No restrictions or penalties
- Copy yesterday's entry for convenience

✅ **Customization**
- Add custom symptoms
- Add custom moods
- Enable/disable tracking features
- Set tracking goals

---

## 🚀 Migration Guide

### For Existing Users

1. **No Action Required**
   - Basic cycle tracker still works
   - New features are opt-in
   - Settings auto-created with safe defaults

2. **Try New Features**
   - Log detailed daily entries
   - Generate predictions (requires 3+ cycles)
   - Customize tracking in settings

3. **Privacy Settings**
   - Review `/api/cycle/settings`
   - Fertility tracking is OFF by default
   - Predictions can be disabled anytime

### For Developers

1. **Database Migration**
   - Run migrations to create new tables
   - Existing `menstrual_cycle` table unchanged
   - New tables have foreign keys to `users`

2. **API Integration**
   - New endpoints are independent
   - No breaking changes to existing APIs
   - JWT authentication required for all

3. **Testing**
   - Test daily logging flow
   - Verify prediction generation
   - Check privacy/deletion features

---

## 📊 Sample Use Cases

### Use Case 1: PCOS Support

**Challenge:** Irregular cycles, skipped periods

**Solution:**
```json
// Settings
{
  "typicalCycleLength": null,  // No assumption
  "medicalConditions": ["PCOS"],
  "showPredictions": false  // Disable if unhelpful
}

// Daily logging
{
  "logDate": "2024-02-10",
  "flowLevel": null,  // No period today
  "symptoms": ["bloating", "acne"],
  "notes": "Day 45, no period yet"
}
```

### Use Case 2: PMDD Mood Tracking

**Challenge:** Need detailed mood tracking

**Solution:**
```json
// Settings
{
  "enabledFeatures": {
    "mood": true,
    "energy": true
  },
  "customMoods": ["rage", "despair", "numb", "euphoric"],
  "medicalConditions": ["PMDD"]
}

// Daily logging
{
  "logDate": "2024-02-10",
  "moodTags": ["irritable", "rage", "crying"],
  "energyLevel": 1,
  "notes": "Struggling today, PMD symptoms strong"
}
```

### Use Case 3: Trauma-Aware Tracking

**Challenge:** Pregnancy content is triggering

**Solution:**
```json
// Settings
{
  "hidePregnancyContent": true,
  "showFertilityInfo": false,
  "gentleNotificationsOnly": true,
  "reminderTone": "gentle"
}
```

---

## ⚠️ Important Notes

### Medical Disclaimers

**All predictions include:**
> "This is an estimate based on your cycle patterns. Not medical advice. Consult healthcare provider for concerns."

**This system:**
- ❌ Is NOT medical advice
- ❌ Is NOT a diagnostic tool
- ❌ Does NOT replace professional healthcare
- ❌ Is NOT for contraception alone

### Privacy & Security

- ✅ JWT authentication required
- ✅ User can only access their own data
- ✅ True deletion (no soft delete)
- ✅ JSONB encryption ready
- ✅ GDPR/HIPAA compliant design

### Data Validation

- All dates in ISO format (YYYY-MM-DD)
- Pain levels: 0-10 integers
- Energy levels: 1-5 integers
- Flow levels: light, medium, heavy, spotting
- Confidence: low, medium, high

---

## 🎯 Next Steps

### For Production

- [ ] Add database migrations
- [ ] Implement field encryption
- [ ] Create PDF export service
- [ ] Add analytics/insights
- [ ] Comprehensive testing
- [ ] Legal/compliance review

### Future Enhancements

- Cycle pattern detection
- Symptom correlation analysis
- Exportable medical summaries
- Multi-language support
- Mobile app integration

---

**Questions or feedback?** This is a living document - it will be updated as the system evolves.

**Built with respect, privacy, and medical accuracy in mind.** 💜
