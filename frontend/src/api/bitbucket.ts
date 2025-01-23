import { AxiosResponse } from "axios";
import { bitbucketAxiosInstance } from "./bitbucket-axios-instance";

export interface BitBucketRepository {
  uuid: string;
  full_name: string;
  name: string;
  workspace: {
    slug: string;
  };
  watchers_count: number;
}

export interface BitBucketUser {
  uuid: string;
  username: string;
  display_name: string;
}

export interface BitBucketWorkspace {
  slug: string;
  name: string;
  uuid: string;
}

export interface BitBucketPaginatedResponse<T> {
  values: T[];
  page: number;
  pagelen: number;
  size: number;
  next?: string;
  previous?: string;
}

export const bitbucketApi = {
  getRepositories: async (
    page = 1,
    perPage = 10,
    sort = "updated_on",
    workspace?: string,
  ): Promise<
    AxiosResponse<BitBucketPaginatedResponse<BitBucketRepository>>
  > => {
    const params = {
      page,
      per_page: perPage,
      sort,
      workspace,
    };

    return bitbucketAxiosInstance.get("/repositories", { params });
  },

  getUser: async (): Promise<AxiosResponse<BitBucketUser>> =>
    bitbucketAxiosInstance.get("/user"),

  getWorkspaces: async (): Promise<AxiosResponse<string[]>> =>
    bitbucketAxiosInstance.get("/workspaces"),

  searchRepositories: async (
    query: string,
    perPage = 5,
    sort = "updated_on",
  ): Promise<
    AxiosResponse<BitBucketPaginatedResponse<BitBucketRepository>>
  > => {
    const params = {
      query,
      per_page: perPage,
      sort,
    };

    return bitbucketAxiosInstance.get("/search/repositories", { params });
  },
};
