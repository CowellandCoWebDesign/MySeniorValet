import express from "express";
import request from "supertest";

const mockGetBakedResourceDirectory = jest.fn();

jest.mock("../../server/services/resource-directory-baked", () => ({
  getBakedResourceDirectory: (...args: unknown[]) => mockGetBakedResourceDirectory(...args),
}));

jest.mock("../../server/services/senior-resources-service", () => ({
  seniorResourcesService: {},
}));

import { setupSeniorResourcesRoutes } from "../../server/routes/seniorResourcesRoutes";

const directory = {
  categories: [{ id: "senior-centers", label: "Senior Centers", description: "Local help", icon: "Users" }],
  counties: [{ id: "shasta", label: "Shasta" }],
  situations: [{ label: "Find a senior center", categoryId: "senior-centers" }],
  listings: [{
    name: "Example Senior Center",
    category: "senior-centers",
    source: "Example source",
    verified: true,
    scope: "curated",
    phone: "530-555-0100",
  }],
  generatedAt: "2026-08-05T00:00:00.000Z",
};

describe("GET /api/senior-resources/directory-baked", () => {
  const app = express();
  setupSeniorResourcesRoutes(app);
  app.get("*", (_req, res) => res.type("html").send("<!doctype html><div id=\"root\"></div>"));

  beforeEach(() => {
    mockGetBakedResourceDirectory.mockReset();
  });

  it("returns structured JSON instead of falling through to the website shell", async () => {
    mockGetBakedResourceDirectory.mockResolvedValue(directory);

    const response = await request(app)
      .get("/api/senior-resources/directory-baked")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.categories).toHaveLength(1);
    expect(response.body.listings).toHaveLength(1);
    expect(response.text).not.toContain("<!doctype html>");
  });

  it("returns a JSON error when directory generation fails", async () => {
    mockGetBakedResourceDirectory.mockRejectedValue(new Error("unavailable"));

    const response = await request(app)
      .get("/api/senior-resources/directory-baked")
      .expect(500)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual({ error: "Failed to build resource directory" });
  });
});