export const NOTIFY_COLOR = {
  SUCCESS: "#2ecc71",
  ERROR: "#e63946",
  INFO: "#007bff",
};

export const MESSAGES = {
  LOGIN_FIRST: "⚠️ Please login first",
  LOGIN_TO_ADD: "⚠️ Please login to add items",
  LOGIN_TO_BUY: "⚠️ Please login to buy",
  PRODUCT_ADDED: "✅ Product added to cart!",
  ORDER_PLACED: "🎉 Order placed successfully!",
};

export const PAYMENT_METHODS = ["Cash on Delivery", "Online Payment"];
export const DEFAULT_PAYMENT = "Cash on Delivery";

export const FORM_ERRORS = {
  NAME_REQUIRED: "Name is required",
  EMAIL_REQUIRED: "Email is required",
  INVALID_EMAIL: "Invalid email format",
  ADDRESS_REQUIRED: "Address is required",
  PHONE_REQUIRED: "Phone is required",
  INVALID_PHONE: "Phone number must be 10 digits",
};

export const IMAGE_BASE_URL = "http://localhost:8083/images/";

export const NOTIFY_DURATION = 4000;

export const EXCLUDED_FIELDS = [
  "id",
  "name",
  "image",
  "offerPrice",
  "originalPrice",
  "offers",
  "rating",
  "description",
];
