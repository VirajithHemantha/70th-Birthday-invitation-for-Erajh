const SPREADSHEET_ID = '1hM1-z5L9Bpyg2ABJNDP9tt2NiABv7hdnhfxCJQEYPjE';

function doPost(e) {
  try {
    let data;
    
    // Handle JSON payload
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.payload) {
      // Handle FormData payload
      data = JSON.parse(e.parameter.payload);
    } else {
      throw new Error('No data received');
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (data.type === 'wish') {
      return handleWish(ss, data);
    } else {
      return handleRSVP(ss, data);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleRSVP(ss, data) {
  let sheet = ss.getSheetByName('rsvp');
  if (!sheet) {
    sheet = ss.insertSheet('rsvp');
    sheet.appendRow(['Timestamp', 'Attendance', 'Primary Guest', 'Party Type', 'Guest Count', 'Full Guest List & Meals']);
  }

  const attendance = data.attendance || 'N/A';
  const partyType = data.partyType || 'individual';
  const guestCount = data.guestCount || 0;
  const submittedAt = data.submittedAt || new Date().toISOString();
  
  const guests = data.guests || [];
  const primaryName = guests.length > 0 ? guests[0].name : 'N/A';
  
  // Format the full guest list
  const guestListStr = guests
    .map(g => `${g.name || 'N/A'} (${g.meal || 'non-veg'})`)
    .join(', ');

  sheet.appendRow([
    submittedAt,
    attendance,
    primaryName,
    partyType,
    guestCount,
    guestListStr
  ]);

  return ContentService.createTextOutput(JSON.stringify({ 
    status: 'success', 
    message: 'RSVP recorded' 
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleWish(ss, data) {
  let sheet = ss.getSheetByName('wish');
  if (!sheet) {
    sheet = ss.insertSheet('wish');
    sheet.appendRow(['Timestamp', 'Name', 'Message']);
  }

  const name = data.name || 'Anonymous';
  const wishes = data.wishes || '';
  const submittedAt = data.submittedAt || new Date().toISOString();

  sheet.appendRow([
    submittedAt,
    name,
    wishes
  ]);

  return ContentService.createTextOutput(JSON.stringify({ 
    status: 'success', 
    message: 'Wish recorded' 
  })).setMimeType(ContentService.MimeType.JSON);
}

// Optional: Test function to initialize sheets
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  if (!ss.getSheetByName('rsvp')) {
    const sheet = ss.insertSheet('rsvp');
    sheet.appendRow(['Timestamp', 'Attendance', 'Primary Guest', 'Party Type', 'Guest Count', 'Full Guest List & Meals']);
  }
  
  if (!ss.getSheetByName('wish')) {
    const sheet = ss.insertSheet('wish');
    sheet.appendRow(['Timestamp', 'Name', 'Message']);
  }
}
