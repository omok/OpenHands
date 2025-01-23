import { describe, expect, it, vi } from "vitest";
import { bitbucketApi } from "#/api/bitbucket";
import { bitbucketAxiosInstance } from "#/api/bitbucket-axios-instance";

vi.mock("#/api/bitbucket-axios-instance", () => ({
  bitbucketAxiosInstance: {
    get: vi.fn(),
  },
}));

describe("BitBucket API", () => {
  it("should get repositories", async () => {
    const mockResponse = {
      data: {
        values: [
          {
            uuid: "1",
            full_name: "user/repo1",
            name: "repo1",
            workspace: { slug: "user" },
            watchers_count: 10,
          },
        ],
      },
    };

    vi.mocked(bitbucketAxiosInstance.get).mockResolvedValueOnce(mockResponse);

    const response = await bitbucketApi.getRepositories();
    expect(response).toEqual(mockResponse);
    expect(bitbucketAxiosInstance.get).toHaveBeenCalledWith("/repositories", {
      params: {
        page: 1,
        per_page: 10,
        sort: "updated_on",
        workspace: undefined,
      },
    });
  });

  it("should get user", async () => {
    const mockResponse = {
      data: {
        uuid: "1",
        username: "testuser",
        display_name: "Test User",
      },
    };

    vi.mocked(bitbucketAxiosInstance.get).mockResolvedValueOnce(mockResponse);

    const response = await bitbucketApi.getUser();
    expect(response).toEqual(mockResponse);
    expect(bitbucketAxiosInstance.get).toHaveBeenCalledWith("/user");
  });

  it("should get workspaces", async () => {
    const mockResponse = {
      data: ["workspace1", "workspace2"],
    };

    vi.mocked(bitbucketAxiosInstance.get).mockResolvedValueOnce(mockResponse);

    const response = await bitbucketApi.getWorkspaces();
    expect(response).toEqual(mockResponse);
    expect(bitbucketAxiosInstance.get).toHaveBeenCalledWith("/workspaces");
  });

  it("should search repositories", async () => {
    const mockResponse = {
      data: {
        values: [
          {
            uuid: "1",
            full_name: "user/repo1",
            name: "repo1",
            workspace: { slug: "user" },
            watchers_count: 10,
          },
        ],
      },
    };

    vi.mocked(bitbucketAxiosInstance.get).mockResolvedValueOnce(mockResponse);

    const response = await bitbucketApi.searchRepositories("test");
    expect(response).toEqual(mockResponse);
    expect(bitbucketAxiosInstance.get).toHaveBeenCalledWith(
      "/search/repositories",
      {
        params: {
          query: "test",
          per_page: 5,
          sort: "updated_on",
        },
      },
    );
  });
});