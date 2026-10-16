const EMAIL_DOMAIN = '@chaquillchaka.com.pe';

function isAllowedStaffEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase().endsWith(EMAIL_DOMAIN);
}

module.exports = { EMAIL_DOMAIN, isAllowedStaffEmail };
