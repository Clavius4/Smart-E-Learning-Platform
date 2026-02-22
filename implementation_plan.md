# Implementation Plan - Learning Courses Dashboard Logic

The goal is to ensure the "Kozi za Kujifunza" (Learning Courses) dashboard correctly filters and displays courses relevant to the student's current learning path (Category and Level), showing the next unlocked course as expected.

## User Review Required
> [!NOTE]
> This change relies on hardcoded Category IDs for 'Kusoma' and 'Kuhesabu'. If these IDs change in the database (e.g., during a reset), this mapping will need to be updated.

## Proposed Changes

### Frontend mechanism

#### [MODIFY] [CoursesView.vue](file:///root/smart-learning-platform-docker/smart-elearning-frontend/src/views/CoursesView.vue)
- Import `useAuthStore`.
- Define `CATEGORY_MAP` to map 'literacy'/'numeracy' to their database ObjectIDs.
- In `onMounted`, initialize `filterSubject` and `filterLevel` based on the user's profile (`learningStyle` and `difficultyPreference`) from `authStore`.
- This ensures the dashboard explicitly shows the user's current context.

```javascript
const CATEGORY_MAP = {
  'literacy': '68d7c0f165485406bf5aa6fa', // Kusoma
  'numeracy': '68d7c5341138e183c59cee36'  // Kuhesabu
}
```

## Verification Plan

### Manual Verification
1.  **User Action**: Log in as a student with 'Kuhesabu' (Numeracy) preference.
2.  **User Action**: Click "Kozi za Kujifunza" in the navbar.
3.  **Expected Result**: The dashboard should strictly show 'Kuhesabu' courses for the current level. Queries for other categories should be filtered out by the UI logic (if present).
4.  **User Action**: Check that "filterSubject" dropdown (if visible) or internal state reflects 'Kuhesabu'.
