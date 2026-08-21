const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

interface ApiOptions extends RequestInit {
  token?: string;
  skipRefresh?: boolean;
}

interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Refresh token expired");
    }

    const data =
      (await response.json()) as RefreshResponse;

    const newAccessToken =
      data.data.accessToken;

    localStorage.setItem(
      "accessToken",
      newAccessToken,
    );

    if (data.data.refreshToken) {
      localStorage.setItem(
        "refreshToken",
        data.data.refreshToken,
      );
    }

    return newAccessToken;
  } catch {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    return null;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    token,
    skipRefresh = false,
    headers,
    ...fetchOptions
  } = options;

  const accessToken =
    token ||
    localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",

        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),

        ...headers,
      },
    },
  );

  /*
   * If the access token expired,
   * refresh it and retry the request once.
   */
  if (
    response.status === 401 &&
    accessToken &&
    !skipRefresh
  ) {
    if (!refreshPromise) {
      refreshPromise =
        refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
    }

    const newAccessToken =
      await refreshPromise;

    if (!newAccessToken) {
      throw new Error(
        "Your session has expired. Please log in again.",
      );
    }

    return apiClient<T>(endpoint, {
      ...options,
      token: newAccessToken,
      skipRefresh: true,
    });
  }

  const contentType =
    response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const text = await response.text();

    console.error(
      "API returned non-JSON response:",
      {
        url: `${API_URL}${endpoint}`,
        status: response.status,
        response: text,
      },
    );

    throw new Error(
      `API returned ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong",
    );
  }

  return data;
}