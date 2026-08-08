import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import SeniorResources from "./senior-resources";

jest.mock("@/components/ProfessionalNavbar", () => ({
  ProfessionalNavbar: () => null,
}));

const directory = {
  categories: [{ id: "senior-centers", label: "Senior Centers", description: "Local gathering places", icon: "Users" }],
  counties: [{ id: "shasta", label: "Shasta" }],
  situations: [{ label: "Find a senior center", categoryId: "senior-centers" }],
  listings: [{
    name: "Redding Senior Center",
    category: "senior-centers",
    source: "City of Redding",
    verified: true,
    scope: "curated" as const,
    phone: "(530) 555-0100",
    counties: ["shasta"],
  }],
  generatedAt: "2026-08-05T00:00:00.000Z",
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: 0 } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <SeniorResources />
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json; charset=utf-8" }),
    json: async () => body,
  } as Response;
}

describe("SeniorResources directory loading", () => {
  beforeEach(() => {
    document.getElementById("__RESOURCE_DIRECTORY__")?.remove();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    document.getElementById("__RESOURCE_DIRECTORY__")?.remove();
    jest.restoreAllMocks();
  });

  it("renders the embedded hard-load payload immediately without fetching", () => {
    const payload = document.createElement("script");
    payload.id = "__RESOURCE_DIRECTORY__";
    payload.type = "application/json";
    payload.textContent = JSON.stringify(directory);
    document.body.appendChild(payload);

    renderPage();

    expect(screen.getByRole("heading", { name: "Senior Centers" })).toBeInTheDocument();
    expect(screen.getByText("Redding Senior Center")).toBeInTheDocument();
    expect(screen.getByTestId("button-county-shasta")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("loads listings through the JSON endpoint on client-side navigation", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse(directory));

    renderPage();

    expect(await screen.findByText("Redding Senior Center")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/senior-resources/directory-baked",
      { headers: { Accept: "application/json" } },
    );
    expect(screen.queryByText("Loading the resource directory…")).not.toBeInTheDocument();
  });

  it("rejects an HTML shell response and lets visitors retry successfully", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
        json: async () => {
          throw new Error("should not parse HTML");
        },
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
        json: async () => {
          throw new Error("should not parse HTML");
        },
      } as Response)
      .mockResolvedValueOnce(jsonResponse(directory));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load the resource directory.");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(screen.getByText("Redding Senior Center")).toBeInTheDocument());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});