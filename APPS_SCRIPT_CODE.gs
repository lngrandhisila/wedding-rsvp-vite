// Add this function to your Apps Script

function getRsvpCounts() {
  try {
    const sheet = SpreadsheetApp.openById('1tHc8JCWCkjeRVI5mlYZ0IfgCSsg3Ciild9cj5UZD5wc');
    
    const eventMap = {
      'Haldi': 'haldi',
      'Marriage': 'marriage',
      'Cocktail': 'cocktail'
    };
    
    const counts = {
      haldi: 0,
      marriage: 0,
      cocktail: 0
    };
    
    // Count entries in each event sheet
    Object.entries(eventMap).forEach(([sheetName, eventKey]) => {
      try {
        const eventSheet = sheet.getSheetByName(sheetName);
        if (eventSheet) {
          // Sum Number of Guests from column E (excluding header row)
          const lastRow = eventSheet.getLastRow();
          if (lastRow > 1) {
            const guestValues = eventSheet.getRange(2, 5, lastRow - 1, 1).getValues();
            counts[eventKey] = guestValues.reduce(function(total, row) {
              const raw = row && row[0];
              const parsed = parseInt(raw, 10);
              const guestCount = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
              return total + guestCount;
            }, 0);
          }
        }
      } catch (err) {
        console.log('Error counting ' + sheetName + ': ' + err);
      }
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ counts: counts }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        counts: { haldi: 0, marriage: 0, cocktail: 0 },
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function normalizeName(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeEmail(value) {
  return String(value || '').toLowerCase().trim();
}

function normalizePhone(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function findMatchingRowIndex(rows, guestName, email, phone) {
  const inputName = normalizeName(guestName);
  const inputEmail = normalizeEmail(email);
  const inputPhone = normalizePhone(phone);

  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i] || [];
    const rowName = normalizeName(row[1]);
    const rowEmail = normalizeEmail(row[2]);
    const rowPhone = normalizePhone(row[3]);

    if (inputPhone && rowPhone && inputPhone === rowPhone) {
      return i + 2; // sheet row index (account for header row)
    }

    if (inputName && inputPhone && rowName && rowPhone && inputName === rowName && inputPhone === rowPhone) {
      return i + 2;
    }

    if (inputName && inputEmail && rowName && rowEmail && inputName === rowName && inputEmail === rowEmail) {
      return i + 2;
    }
  }

  return -1;
}

function checkDuplicateRsvp(data) {
  try {
    const sheet = SpreadsheetApp.openById('1tHc8JCWCkjeRVI5mlYZ0IfgCSsg3Ciild9cj5UZD5wc');
    const allSheet = sheet.getSheetByName('All RSVPs');

    if (!allSheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ isDuplicate: false, duplicateEvents: [], reasons: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const selectedEvents = (data.events || []).map(String);
    const selectedEventSet = {};
    selectedEvents.forEach(function(eventId) {
      selectedEventSet[eventId] = true;
    });

    const inputName = normalizeName(data.guestName);
    const inputEmail = normalizeEmail(data.email);
    const inputPhone = normalizePhone(data.phone);

    const lastRow = allSheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ isDuplicate: false, duplicateEvents: [], reasons: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows = allSheet.getRange(2, 1, lastRow - 1, 8).getValues();
    const duplicateEventSet = {};
    const reasonSet = {};

    rows.forEach(function(row) {
      const rowName = normalizeName(row[1]);
      const rowEmail = normalizeEmail(row[2]);
      const rowPhone = normalizePhone(row[3]);
      const rowEvents = String(row[7] || '')
        .split(',')
        .map(function(value) { return value.trim(); })
        .filter(Boolean);

      let matchedBy = null;
      if (inputPhone && rowPhone && inputPhone === rowPhone) {
        matchedBy = 'phone';
      } else if (inputName && inputPhone && rowName && rowPhone && inputName === rowName && inputPhone === rowPhone) {
        matchedBy = 'name+phone';
      } else if (inputName && inputEmail && rowName && rowEmail && inputName === rowName && inputEmail === rowEmail) {
        matchedBy = 'name+email';
      }

      if (!matchedBy) return;

      reasonSet[matchedBy] = true;

      rowEvents.forEach(function(eventId) {
        if (selectedEventSet[eventId]) {
          duplicateEventSet[eventId] = true;
        }
      });
    });

    const duplicateEvents = Object.keys(duplicateEventSet);
    const reasons = Object.keys(reasonSet);

    return ContentService
      .createTextOutput(
        JSON.stringify({
          isDuplicate: duplicateEvents.length > 0,
          duplicateEvents: duplicateEvents,
          reasons: reasons,
        }),
      )
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        isDuplicate: false,
        duplicateEvents: [],
        reasons: [],
        error: String(error),
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Update your existing doPost function to this:

function doPost(e) {
  try {
    const rawBody =
      e &&
      e.postData &&
      typeof e.postData.contents === 'string'
        ? e.postData.contents
        : '';
    const data = rawBody ? JSON.parse(rawBody) : {};
    
    // Handle getRsvpCounts action
    if (data.action === 'getRsvpCounts') {
      return getRsvpCounts();
    }

    // Check duplicates against All RSVPs
    if (data.action === 'checkDuplicateRsvp') {
      return checkDuplicateRsvp(data);
    }

    // Only explicit submit actions are allowed to write RSVP rows
    if (data.action !== 'submitRsvp') {
      return ContentService
        .createTextOutput(
          JSON.stringify({
            success: false,
            error: 'Unsupported action: ' + String(data.action || 'missing'),
          }),
        )
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Only allow true RSVP submissions with required user fields + at least one event
    const guestName = String(data.guestName || '').trim();
    const email = String(data.email || '').trim();
    const phone = String(data.phone || '').trim();
    const events = Array.isArray(data.events)
      ? data.events.map(function(eventId) { return String(eventId || '').trim(); }).filter(Boolean)
      : [];

    const hasIdentity = Boolean(guestName && (email || phone));
    if (!hasIdentity || events.length === 0) {
      return ContentService
        .createTextOutput(
          JSON.stringify({
            success: false,
            error: 'Invalid RSVP payload: name and (email or phone) plus selected events are required.',
          }),
        )
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle RSVP form submission (existing code)
    const sheet = SpreadsheetApp.openById('1tHc8JCWCkjeRVI5mlYZ0IfgCSsg3Ciild9cj5UZD5wc');

    const timestamp = new Date();
    const row = [
      timestamp,
      guestName,
      email,
      phone,
      data.numberOfGuests || '',
      data.mealPreference || '',
      data.specialNote || '',
      events.join(', ')
    ];

    const allSheet = sheet.getSheetByName('All RSVPs');
    const allLastRow = allSheet.getLastRow();
    const allRows =
      allLastRow > 1 ? allSheet.getRange(2, 1, allLastRow - 1, 8).getValues() : [];
    const allMatchRow = findMatchingRowIndex(allRows, guestName, email, phone);

    if (allMatchRow > 0) {
      allSheet.getRange(allMatchRow, 1, 1, 8).setValues([row]);
    } else {
      allSheet.appendRow(row);
    }

    const eventMap = {
      haldi: 'Haldi',
      marriage: 'Marriage',
      cocktail: 'Cocktail'
    };

    events.forEach((eventKey) => {
      const tabName = eventMap[eventKey];
      if (tabName) {
        const eventSheet = sheet.getSheetByName(tabName);
        if (eventSheet) {
          const eventLastRow = eventSheet.getLastRow();
          const eventRows =
            eventLastRow > 1 ? eventSheet.getRange(2, 1, eventLastRow - 1, 8).getValues() : [];
          const eventMatchRow = findMatchingRowIndex(eventRows, guestName, email, phone);

          if (eventMatchRow > 0) {
            eventSheet.getRange(eventMatchRow, 1, 1, 8).setValues([row]);
          } else {
            eventSheet.appendRow(row);
          }
        }
      }
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
