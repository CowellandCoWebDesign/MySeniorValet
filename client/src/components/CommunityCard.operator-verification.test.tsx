/// <reference types="jest" />
import { render, screen } from "@testing-library/react";
import { CommunityCard, type CommunityCardData } from "./CommunityCard";

jest.mock("wouter", () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

const base: CommunityCardData = {
  id: 1,
  name: "Serenity Gardens Assisted Living and Memory Care",
  city: "Redding",
  state: "CA",
  photos: [],
};

describe("CommunityCard trust labels", () => {
  it("does not accept legacy claim flags as Operator-Verified", () => {
    render(<CommunityCard community={{ ...base, isClaimed: true, claimVerified: true } as any} />);
    expect(screen.queryByText("Operator-Verified")).toBeNull();
  });

  it("shows Operator-Verified only from the server-derived field", () => {
    render(<CommunityCard community={{ ...base, operatorVerified: true }} />);
    expect(screen.getByText("Operator-Verified")).not.toBeNull();
  });

  it("keeps featured and government labels distinct", () => {
    const { rerender } = render(<CommunityCard community={{ ...base, featured: true }} />);
    expect(screen.getByText("Featured")).not.toBeNull();
    expect(screen.queryByText("Operator-Verified")).toBeNull();

    rerender(<CommunityCard community={{ ...base, hudPropertyId: "HUD-123" }} />);
    expect(screen.getByText("Government-Verified")).not.toBeNull();
    expect(screen.queryByText("Operator-Verified")).toBeNull();
  });
});
