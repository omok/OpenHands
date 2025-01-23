import { render, screen, fireEvent } from "@testing-library/react";
import { BitBucketRepositorySelector } from "#/components/features/bitbucket/bitbucket-repo-selector";
import { Provider } from "react-redux";
import { store } from "#/state/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";

const queryClient = new QueryClient();

const mockUserRepositories = [
  {
    uuid: "1",
    full_name: "user/repo1",
    name: "repo1",
    workspace: { slug: "user" },
    watchers_count: 10,
  },
];

const mockPublicRepositories = [
  {
    uuid: "2",
    full_name: "org/repo2",
    name: "repo2",
    workspace: { slug: "org" },
    watchers_count: 20,
  },
];

describe("BitBucketRepositorySelector", () => {
  const mockOnInputChange = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BitBucketRepositorySelector
            onInputChange={mockOnInputChange}
            onSelect={mockOnSelect}
            userRepositories={mockUserRepositories}
            publicRepositories={mockPublicRepositories}
          />
        </QueryClientProvider>
      </Provider>,
    );
  });

  it("renders user repositories", () => {
    const dropdowns = screen.getAllByRole("button", { name: "Show suggestions" });
    const dropdown = dropdowns.find(btn => btn.querySelector('svg[viewBox="0 0 24 24"]'));
    fireEvent.click(dropdown);
    expect(screen.getByText("user/repo1")).toBeInTheDocument();
  });

  it("renders public repositories", () => {
    const dropdowns = screen.getAllByRole("button", { name: "Show suggestions" });
    const dropdown = dropdowns.find(btn => btn.querySelector('svg[viewBox="0 0 24 24"]'));
    fireEvent.click(dropdown);
    expect(screen.getByText("org/repo2")).toBeInTheDocument();
  });

  it("calls onInputChange when input changes", () => {
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "test" } });
    expect(mockOnInputChange).toHaveBeenCalledWith("test");
  });

  it("calls onSelect when a repository is selected", () => {
    const dropdowns = screen.getAllByRole("button", { name: "Show suggestions" });
    const dropdown = dropdowns.find(btn => btn.querySelector('svg[viewBox="0 0 24 24"]'));
    fireEvent.click(dropdown);
    const repo = screen.getByText("user/repo1");
    fireEvent.click(repo);
    expect(mockOnSelect).toHaveBeenCalled();
  });
});