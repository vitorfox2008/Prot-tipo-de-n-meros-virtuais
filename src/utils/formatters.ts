export function formatPhoneNumber(phoneNumber: string): string {
  // If it's already well formed from our demo or real API with +, return it directly, 
  // maybe adding some spacing if it doesn't have it
  if (!phoneNumber) return '';
  
  if (phoneNumber.startsWith('+')) {
    // If it's just digits after +, try to format a bit
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+55') && cleaned.length >= 13) {
      return `+55 (${cleaned.substring(3, 5)}) ${cleaned.substring(5, 10)}-${cleaned.substring(10, 14)}`;
    }
    if (cleaned.startsWith('+1') && cleaned.length >= 12) {
      return `+1 (${cleaned.substring(2, 5)}) ${cleaned.substring(5, 8)}-${cleaned.substring(8, 12)}`;
    }
    if (cleaned.startsWith('+44') && cleaned.length >= 12) {
       return `+44 ${cleaned.substring(3, 7)} ${cleaned.substring(7, 13)}`;
    }
    if (cleaned.startsWith('+351') && cleaned.length >= 12) {
       return `+351 ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)} ${cleaned.substring(10, 13)}`;
    }
  }
  
  return phoneNumber;
}

export function extractVerificationCode(text: string): string | null {
  // Look for 4 to 6 digit codes usually sent by whatsapp, facebook, telegram, instagram
  const match = text.match(/\b\d{4,6}\b/);
  return match ? match[0] : null;
}
