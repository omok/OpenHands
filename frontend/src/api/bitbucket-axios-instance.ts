import axios from "axios";
import { getBackendUrl } from "#/utils/get-backend-url";

export const bitbucketAxiosInstance = axios.create({
  baseURL: `${getBackendUrl()}/api/bitbucket`,
});

bitbucketAxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("bitbucket_token");
  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        "X-BitBucket-Token": token,
      },
    };
  }
  return config;
});
