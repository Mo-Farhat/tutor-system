/**
 * Parses a formatted tutor request message to extract structured data
 * Expected format:
 * Subject: [subject]
 * 
 * Phone: [phone]
 * 
 * Preferred Contact: [contact method]
 * 
 * Availability: Morning - Mon, Tue; Afternoon - Wed, Thu; Night - Fri, Sat
 * Availability Notes: [notes]
 * 
 * Message:
 * [actual message text]
 */
export const parseTutorRequestMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return {
      subject: null,
      phone: null,
      preferredContact: null,
      availability: null,
      availabilityNotes: null,
      message: null
    };
  }

  const parsed = {
    subject: null,
    phone: null,
    preferredContact: null,
    availability: null,
    availabilityNotes: null,
    message: null
  };

  // Split message into lines
  const lines = message.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let messageStartIndex = -1;

  // Parse each line for structured data
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract subject
    if (line.startsWith('Subject:')) {
      parsed.subject = line.substring(8).trim();
      continue;
    }

    // Extract phone
    if (line.startsWith('Phone:')) {
      parsed.phone = line.substring(6).trim();
      continue;
    }

    // Extract preferred contact
    if (line.startsWith('Preferred Contact:')) {
      parsed.preferredContact = line.substring(18).trim();
      continue;
    }

    // Extract availability
    if (line.startsWith('Availability:')) {
      const availabilityText = line.substring(13).trim();
      parsed.availability = parseAvailabilityText(availabilityText);
      continue;
    }

    // Extract availability notes
    if (line.startsWith('Availability Notes:')) {
      parsed.availabilityNotes = line.substring(19).trim();
      continue;
    }

    // Find where the actual message starts (after "Message:" line)
    if (line.toLowerCase() === 'message:' && i < lines.length - 1) {
      messageStartIndex = i + 1;
      break;
    }
  }

  // Extract the actual message content
  if (messageStartIndex >= 0 && messageStartIndex < lines.length) {
    parsed.message = lines.slice(messageStartIndex).join('\n').trim();
  } else {
    // If no "Message:" label found, try to find the message part
    // (everything after the last structured field)
    const lastStructuredFieldIndex = Math.max(
      lines.findIndex(l => l.startsWith('Subject:')),
      lines.findIndex(l => l.startsWith('Phone:')),
      lines.findIndex(l => l.startsWith('Preferred Contact:')),
      lines.findIndex(l => l.startsWith('Availability:')),
      lines.findIndex(l => l.startsWith('Availability Notes:'))
    );

    if (lastStructuredFieldIndex >= 0 && lastStructuredFieldIndex < lines.length - 1) {
      // Get everything after the last structured field
      parsed.message = lines.slice(lastStructuredFieldIndex + 1).join('\n').trim();
    } else {
      // If no structured fields found, treat entire message as the message content
      parsed.message = message.trim();
    }
  }

  // Handle legacy format where message might not have structure
  if (!parsed.subject && !parsed.phone && !parsed.preferredContact && !parsed.availability && !parsed.availabilityNotes && !parsed.message) {
    parsed.message = message.trim();
  }

  return parsed;
};

/**
 * Parses availability text into a structured object
 * Formats supported:
 * - "Morning: Mon, Tue; Afternoon: Wed, Thu; Night: Fri, Sat" (colon format)
 * - "Morning - Mon, Tue; Afternoon - Wed, Thu; Night - Fri, Sat" (dash format - legacy)
 */
const parseAvailabilityText = (availabilityText) => {
  if (!availabilityText || availabilityText === 'Not specified') {
    return null;
  }

  // Initialize the availability grid structure
  const availability = {
    morning: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
    afternoon: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
    night: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false }
  };

  // Map day labels to keys
  const dayMap = {
    'mon': 'mon',
    'monday': 'mon',
    'tue': 'tue',
    'tuesday': 'tue',
    'wed': 'wed',
    'wednesday': 'wed',
    'thu': 'thu',
    'thursday': 'thu',
    'fri': 'fri',
    'friday': 'fri',
    'sat': 'sat',
    'saturday': 'sat',
    'sun': 'sun',
    'sunday': 'sun'
  };

  // Split by semicolon to get time periods
  const timePeriods = availabilityText.split(';').map(t => t.trim());

  timePeriods.forEach(period => {
    // Try colon format first (current format), then dash format (legacy)
    let parts = period.split(':').map(p => p.trim());
    if (parts.length !== 2) {
      // Try dash format as fallback
      parts = period.split('-').map(p => p.trim());
    }
    
    if (parts.length === 2) {
      const timeOfDay = parts[0].toLowerCase();
      const days = parts[1].split(',').map(d => d.trim().toLowerCase());

      let timeKey = null;
      if (timeOfDay.includes('morning')) {
        timeKey = 'morning';
      } else if (timeOfDay.includes('afternoon')) {
        timeKey = 'afternoon';
      } else if (timeOfDay.includes('night') || timeOfDay.includes('evening')) {
        timeKey = 'night';
      }

      if (timeKey) {
        days.forEach(day => {
          const dayKey = dayMap[day];
          if (dayKey && availability[timeKey]) {
            availability[timeKey][dayKey] = true;
          }
        });
      }
    }
  });

  return availability;
};

