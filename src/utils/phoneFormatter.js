export const formatPhoneNumber = (value) => {
  if (!value) return '';
  // Keep only digits
  const phoneNumber = value.replace(/\D/g, '');
  const len = phoneNumber.length;
  if (len <= 3) return phoneNumber;
  if (len <= 6) {
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3)}`;
  }
  if (len <= 10) {
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  }
  // For more than 10 digits, format with country code prefix
  return `+${phoneNumber.slice(0, len - 10)} (${phoneNumber.slice(len - 10, len - 7)})-${phoneNumber.slice(len - 7, len - 4)}-${phoneNumber.slice(len - 4)}`;
};
