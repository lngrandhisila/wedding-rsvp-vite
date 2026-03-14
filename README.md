# Wedding RSVP Vite Project

A deployment-ready interactive wedding RSVP website built with Vite + React.

## What this package includes

- Colorful RSVP landing page
- Photo gallery area for the couple
- Four event cards:
  - Engagement
  - Haldi
  - Marriage
  - Cocktail Party
- RSVP form
- Google Apps Script integration hook for saving responses into Google Sheets
- Ready for Vercel or Netlify deployment

## 1) Install dependencies

```bash
npm install
```

## 2) Add your Apps Script URL

Copy `.env.example` to `.env` and replace the placeholder URL:

```bash
cp .env.example .env
```

Set:

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

If you do not set this value, the site still works in demo mode and logs the RSVP payload in the browser console.

## 3) Add your real couple photos

Place your images inside:

```text
public/photos/
```

Expected file names:

- `couple-1.jpg`
- `couple-2.jpg`
- `couple-3.jpg`

Or edit `src/config.js` to point to different image names.

## 4) Edit couple names, venues, dates

Open:

```text
src/config.js
```

Update:

- `coupleNames`
- `subtitle`
- `datesLabel`
- `cityLabel`
- event titles/times/venues/notes

## 5) Start locally

```bash
npm run dev
```

## 6) Build for production

```bash
npm run build
```

## 7) Deploy on Vercel

### Option A: Vercel with GitHub

1. Push this project to GitHub
2. Open Vercel
3. Import the repo
4. Add environment variable:
   - `VITE_APPS_SCRIPT_URL`
5. Deploy

### Option B: Drag and drop build output

1. Run `npm run build`
2. Upload the `dist` folder to a static host

## Google Apps Script backend example

Use this in Apps Script and deploy as a Web App:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById('PASTE_YOUR_SHEET_ID_HERE');
    const data = JSON.parse(e.postData.contents);

    const row = [
      new Date(),
      data.guestName || '',
      data.email || '',
      data.phone || '',
      data.numberOfGuests || '',
      data.mealPreference || '',
      data.specialNote || '',
      (data.events || []).join(', ')
    ];

    sheet.getSheetByName('All RSVPs').appendRow(row);

    const eventMap = {
      engagement: 'Engagement',
      haldi: 'Haldi',
      marriage: 'Marriage',
      cocktail: 'Cocktail'
    };

    (data.events || []).forEach((eventKey) => {
      const tabName = eventMap[eventKey];
      const target = sheet.getSheetByName(tabName);
      if (target) target.appendRow(row);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Recommended sheet tabs

Create these tabs in your Google Sheet:

- `All RSVPs`
- `Engagement`
- `Haldi`
- `Marriage`
- `Cocktail`

Recommended headers:

```text
Timestamp | Guest Name | Email | Phone | Number of Guests | Meal Preference | Special Note | Events
```

## Notes

- This package avoids heavy UI libraries so it is easier to deploy.
- It is mobile responsive.
- You can later add maps, countdown, music, dress code, or QR code.
