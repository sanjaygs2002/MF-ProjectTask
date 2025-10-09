export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\d*$/;
export const PASSWORD_LOWERCASE = /(?=.*[a-z])/;
export const PASSWORD_UPPERCASE = /(?=.*[A-Z])/;
export const PASSWORD_NUMBER = /(?=.*\d)/;
export const PASSWORD_SPECIAL_CHAR = /(?=.*[@$!%*?&])/;

export const PHONE_LENGTH = 10;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 18;

export const LOGIN_ROUTE = "/login";

export const STRINGS = {
  REQUIRED_FIELD: "This field is required.",
  INVALID_EMAIL: "Invalid email format.",
  INVALID_PHONE: "Phone number can only contain digits.",
  PHONE_LENGTH: `Phone number must be ${PHONE_LENGTH} digits.`,
  PASSWORD_MIN: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
  PASSWORD_MAX: `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`,
  PASSWORD_LOWERCASE: "Password must include at least one lowercase letter.",
  PASSWORD_UPPERCASE: "Password must include at least one uppercase letter.",
  PASSWORD_NUMBER: "Password must include at least one number.",
  PASSWORD_SPECIAL:
    "Password must include at least one special character (@$!%*?&).",
  SIGNUP_SUCCESS: "Signup successful!",
  SIGNUP_FAILED: "Signup failed. Try again.",
  ALREADY_HAVE_ACCOUNT: "Already have an account?",
  SIGNUP_TITLE: "Sign Up",
  BUTTON_SIGNUP: "Sign Up",
  BUTTON_LOADING: "Signing up...",
};

export const ALERT_TIMEOUT = 2000; // milliseconds
