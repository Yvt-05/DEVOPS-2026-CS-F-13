import { describe, it, expect } from "vitest";
import projects, { extraPhotos } from "../data/projects.js";

describe("Projects Data Suite", () => {
  it("should contain exactly 5 active construction projects", () => {
    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBe(5);
  });

  it("should have unique IDs for all projects", () => {
    const ids = projects.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(projects.length);
  });

  it("should enforce required schema fields on every project", () => {
    projects.forEach((project) => {
      expect(typeof project.id).toBe("number");
      expect(typeof project.title).toBe("string");
      expect(project.title.trim().length).toBeGreaterThan(0);

      expect(typeof project.location).toBe("string");
      expect(project.location.trim().length).toBeGreaterThan(0);

      expect(typeof project.type).toBe("string");
      expect(project.type.trim().length).toBeGreaterThan(0);

      expect(typeof project.year).toBe("string");
      expect(typeof project.status).toBe("string");

      expect(typeof project.description).toBe("string");
      expect(project.description.length).toBeGreaterThan(20);

      expect(typeof project.image).toBe("string");
      expect(project.image.startsWith("/images/")).toBe(true);

      expect(Array.isArray(project.gallery)).toBe(true);
    });
  });

  it("should provide an extraPhotos archive with 20 documented worksite photos", () => {
    expect(Array.isArray(extraPhotos)).toBe(true);
    expect(extraPhotos.length).toBe(20);
    extraPhotos.forEach((path) => {
      expect(path).toMatch(/^\/images\/projects\/extra-\d+\.jpg$/);
    });
  });

  it("should include extra photos in Project 4 gallery", () => {
    const project4 = projects.find((p) => p.id === 4);
    expect(project4).toBeDefined();
    expect(project4.gallery.length).toBeGreaterThanOrEqual(20);
  });
});
