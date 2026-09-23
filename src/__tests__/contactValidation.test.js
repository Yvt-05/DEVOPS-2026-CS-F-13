import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validateEnquiryForm,
  VALID_PROJECT_TYPES,
  VALID_BUDGETS,
} from "../utils/validation.js";

describe("Contact Form Validation Suite", () => {
  it("should validate standard email addresses correctly", () => {
    expect(validateEmail("client@example.com")).toBe(true);
    expect(validateEmail("name.surname@company.co.in")).toBe(true);
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("test@.com")).toBe(false);
    expect(validateEmail(null)).toBe(false);
  });

  it("should pass validation with complete valid payload", () => {
    const validForm = {
      name: "Ramesh Sharma",
      email: "ramesh@example.com",
      phone: "+91 9876543210",
      projectType: "Residential",
      location: "Jaipur, Rajasthan",
      budget: "₹50L – ₹1 Crore",
      message: "Looking for turnkey residential villa construction.",
    };

    const result = validateEnquiryForm(validForm);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it("should reject submissions with missing name, email, or short message", () => {
    const invalidForm = {
      name: "",
      email: "invalid-email",
      message: "Hi",
    };

    const result = validateEnquiryForm(invalidForm);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.message).toBeDefined();
  });

  it("should enforce allowed project categories and budget ranges", () => {
    expect(VALID_PROJECT_TYPES).toContain("Residential");
    expect(VALID_PROJECT_TYPES).toContain("Commercial");
    expect(VALID_PROJECT_TYPES).toContain("Industrial");
    expect(VALID_PROJECT_TYPES).toContain("Renovation");

    expect(VALID_BUDGETS).toContain("Under ₹25 Lakh");
    expect(VALID_BUDGETS).toContain("₹25L – ₹50L");
    expect(VALID_BUDGETS).toContain("₹50L – ₹1 Crore");
    expect(VALID_BUDGETS).toContain("₹1Cr – ₹5 Crore");
    expect(VALID_BUDGETS).toContain("Above ₹5 Crore");
  });
});
