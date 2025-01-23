import { useQuery } from "@tanstack/react-query";
import { bitbucketApi } from "#/api/bitbucket";

export function useBitbucketRepositories(
  page = 1,
  perPage = 10,
  sort = "updated_on",
  workspace?: string,
) {
  return useQuery({
    queryKey: ["bitbucket", "repositories", page, perPage, sort, workspace],
    queryFn: () => bitbucketApi.getRepositories(page, perPage, sort, workspace),
    select: (response) => response.data,
    enabled: !!localStorage.getItem("bitbucket_token"),
  });
}

export function useBitbucketUser() {
  return useQuery({
    queryKey: ["bitbucket", "user"],
    queryFn: () => bitbucketApi.getUser(),
    select: (response) => response.data,
    enabled: !!localStorage.getItem("bitbucket_token"),
  });
}

export function useBitbucketWorkspaces() {
  return useQuery({
    queryKey: ["bitbucket", "workspaces"],
    queryFn: () => bitbucketApi.getWorkspaces(),
    select: (response) => response.data,
    enabled: !!localStorage.getItem("bitbucket_token"),
  });
}

export function useSearchBitbucketRepositories(
  query: string,
  perPage = 5,
  sort = "updated_on",
) {
  return useQuery({
    queryKey: ["bitbucket", "search", query, perPage, sort],
    queryFn: () => bitbucketApi.searchRepositories(query, perPage, sort),
    select: (response) => response.data,
    enabled: !!query && !!localStorage.getItem("bitbucket_token"),
  });
}
