export const formatPhoneNumber = (value) => {
  if (!value) return '';
  // Keep only digits
  const phoneNumber = value.replace(/\D/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength <= 3) return phoneNumber;
  if (phoneNumberLength <= 6) {
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};
