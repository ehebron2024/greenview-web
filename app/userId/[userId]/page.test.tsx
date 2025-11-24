import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserProjectsPage from "./page"; // Import the component
import { getDoc, getDocs } from "firebase/firestore";

// Mock Firestore functions
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  collection: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
}));

describe("UserProjectsPage", () => {
  it("renders user email, userId, and projects for a demo user", async () => {
    // Mock Firestore data
    const mockUserId = "4lbTxJkri2ZEAd1EWalQdnSd06u1";
    const mockUserEmail = "edendemo@gmail.com";
    const mockProjects = [
      { id: "project1", name: "Project Alpha", number: "12345" },
      { id: "project2", name: "Project Beta", number: "67890" },
    ];

    // Mock `getDoc` to return user datan
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ email: mockUserEmail }),
    });

    // Mock `getDocs` to return project data
    (getDocs as jest.Mock).mockResolvedValueOnce({
      forEach: (callback: (doc: any) => void) => {
        mockProjects.forEach((project) =>
          callback({ id: project.id, data: () => project })
        );
      },
    });

    // Render the component
    render(<UserProjectsPage params={{ userId: mockUserId }} />);

    // Wait for the email and projects to load
    await waitFor(() => {
      expect(
        screen.getByText(`Welcome to Your Projects, ${mockUserEmail}!`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Your User ID: ${mockUserId}`)
      ).toBeInTheDocument();
      expect(screen.getByText("Project Alpha")).toBeInTheDocument();
      expect(screen.getByText("Project Beta")).toBeInTheDocument();
    });
  });

  it("shows 'No projects found' if the user has no projects", async () => {
    // Mock Firestore data
    const mockUserId = "demoUserId";
    const mockUserEmail = "demo@example.com";

    // Mock `getDoc` to return user data
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ email: mockUserEmail }),
    });

    // Mock `getDocs` to return no project data
    (getDocs as jest.Mock).mockResolvedValueOnce({
      forEach: () => {}, // No projects
    });

    // Render the component
    render(<UserProjectsPage params={{ userId: mockUserId }} />);

    // Wait for the email and projects to load
    await waitFor(() => {
      expect(
        screen.getByText(`Welcome to Your Projects, ${mockUserEmail}!`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Your User ID: ${mockUserId}`)
      ).toBeInTheDocument();
      expect(screen.getByText("No projects found.")).toBeInTheDocument();
    });
  });

  it("shows an error if the user document does not exist", async () => {
    // Mock Firestore data
    const mockUserId = "demoUserId";

    // Mock `getDoc` to return no user data
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => false,
    });

    // Render the component
    render(<UserProjectsPage params={{ userId: mockUserId }} />);

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith(
        "User document does not exist."
      );
    });
  });
});
