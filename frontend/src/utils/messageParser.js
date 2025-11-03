/**
 * Parses a formatted tutor request message to extract structured data
 * Expected format:
 * Subject: [subject]
 * 
 * Phone: [phone]
 * 
 * Preferred Contact: [contact method]
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
      message: null
    };
  }

  const parsed = {
    subject: null,
    phone: null,
    preferredContact: null,
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
      lines.findIndex(l => l.startsWith('Preferred Contact:'))
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
  if (!parsed.subject && !parsed.phone && !parsed.preferredContact && !parsed.message) {
    parsed.message = message.trim();
  }

  return parsed;
};

