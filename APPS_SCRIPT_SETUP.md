# Apps Script Setup for RSVP Count Syncing + Duplicate Prevention

The website now fetches RSVP counts from the Google Sheet on page load and checks for duplicate RSVPs directly from the sheet before submit.

## Quick Setup

1. Open your Google Apps Script in Google Sheets
2. Copy the updated code from `APPS_SCRIPT_CODE.gs` in this project
3. Replace your entire `doPost` function and add `getRsvpCounts` + `checkDuplicateRsvp`
4. Deploy as a new version
5. Refresh the website

## What Changed

The `getRsvpCounts` function:
- Counts the number of entries in each event sheet (Engagement, Haldi, Marriage, Cocktail)
- Returns the counts as JSON in the format: `{ counts: { engagement: number, haldi: number, marriage: number, cocktail: number } }`
- Works by counting rows in each sheet (total rows - 1 for header)

The `doPost` function now:
- Checks if the request has `action: 'getRsvpCounts'` 
- If yes, calls `getRsvpCounts()` to return the current counts
- Checks if the request has `action: 'checkDuplicateRsvp'`
- If yes, compares against `All RSVPs` and flags duplicates for selected events
- If no, proceeds with normal RSVP form submission (your existing logic)

Duplicate check rules are:
- Same phone number
- Same name + phone
- Same name + email

The duplicate check is event-aware: if a match exists in sheet but not for the selected events, submit is allowed.

## How It Works

1. **Page Load**: Website fetches current counts from the Google Sheet via `getRsvpCounts`
2. **Form Submission**: New RSVP is added to the sheet AND count is incremented
3. **Manual Deletion**: When you delete a row from the sheet, the count decreases on the next page refresh

## Testing

1. Deploy the updated Apps Script code
2. Refresh the website - counts should match your sheet
3. Delete a row from any event sheet
4. Refresh the website - count should decrease
