const defaultApiHost = "http://localhost:3001";

const getApiHost = () =>
  (process.env.NEXT_PUBLIC_API_HOST || defaultApiHost).replace(/\/+$/, "");

export const request = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const response = await fetch(`${getApiHost()}${url}`, {
    ...options,
    credentials: "include",
    signal: AbortSignal.timeout(5_000),
  });
  const body = [204, 205, 304].includes(response.status)
    ? null
    : await response.text();
  const data = body ? JSON.parse(body) : undefined;

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
