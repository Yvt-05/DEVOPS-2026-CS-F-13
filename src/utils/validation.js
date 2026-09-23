/*
  Form Validation Utilities for Shivakriti Constructions
  ───────────────────────────────────────────────────────
  Validates enquiry submission payloads before sending to Express API.
*/

export const VALID_PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Renovation",
];

export const VALID_BUDGETS = [
  "",
  "Under ₹25 Lakh",
  "₹25L – ₹50L",
  "₹50L – ₹1 Crore",
  "₹1Cr – ₹5 Crore",
  "Above ₹5 Crore",
];

export function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validateEnquiryForm(form) {
  const errors = {};

  if (!form.name || form.name.trim().length === 0) {
    errors.name = "Name is required.";
  }

  if (!form.email || !validateEmail(form.email)) {
    errors.email = "A valid email address is required.";
  }

  if (!form.message || form.message.trim().length < 5) {
    errors.message = "Message must be at least 5 characters.";
  }

  if (form.projectType && !VALID_PROJECT_TYPES.includes(form.projectType)) {
    errors.projectType = "Invalid project type.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
