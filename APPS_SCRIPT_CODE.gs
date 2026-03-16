// Add this function to your Apps Script

function getRsvpCounts() {
  try {
    const sheet = SpreadsheetApp.openById('1tHc8JCWCkjeRVI5mlYZ0IfgCSsg3Ciild9cj5UZD5wc');
    
    const eventMap = {
      'Engagement': 'engagement',
      'Haldi': 'haldi',
      'Marriage': 'marriage',
      'Cocktail': 'cocktail'
    };
    
    const counts = {
      engagement: 0,
      haldi: 0,
      marriage: 0,
      cocktail: 0
    };
    
    // Count entries in each event sheet
    Object.entries(eventMap).forEach(([sheetName, eventKey]) => {
      try {
        const eventSheet = sheet.getSheetByName(sheetName);
        if (eventSheet) {
          // Get all rows (excluding header)
          const lastRow = eventSheet.getLastRow();
          if (lastRow > 1) {
            counts[eventKey] = lastRow - 1;
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
        counts: { engagement: 0, haldi: 0, marriage: 0, cocktail: 0 },
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Update your existing doPost function to this:

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Handle getRsvpCounts action
    if (data.action === 'getRsvpCounts') {
      return getRsvpCounts();
    }
    
    // Handle RSVP form submission (existing code)
    const sheet = SpreadsheetApp.openById('1tHc8JCWCkjeRVI5mlYZ0IfgCSsg3Ciild9cj5UZD5wc');

    const timestamp = new Date();
    const row = [
      timestamp,
      data.guestName || '',
      data.email || '',
      data.phone || '',
      data.numberOfGuests || '',
      data.mealPreference || '',
      data.specialNote || '',
      (data.events || []).join(', ')
    ];

    const allSheet = sheet.getSheetByName('All RSVPs');
    allSheet.appendRow(row);

    const eventMap = {
      engagement: 'Engagement',
      haldi: 'Haldi',
      marriage: 'Marriage',
      cocktail: 'Cocktail'
    };

    (data.events || []).forEach((eventKey) => {
      const tabName = eventMap[eventKey];
      if (tabName) {
        const eventSheet = sheet.getSheetByName(tabName);
        if (eventSheet) {
          eventSheet.appendRow(row);
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
