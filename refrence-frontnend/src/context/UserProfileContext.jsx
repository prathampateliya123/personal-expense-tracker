import { createContext, useCallback, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import userService from "../services/userService";
import { userKeys } from "../services/queryKeys";
import { getCookie, TOKEN_NAME } from "../utils/cookie";

const UserProfileContext = createContext(null);

const resolveProfile = (payload) => {
  const profile = payload?.data;
  if (!profile || typeof profile !== "object") return null;
  return profile;
};

export function UserProfileProvider({ children }) {
  const token = getCookie(TOKEN_NAME);

  const query = useQuery({
    queryKey: [...userKeys.getUser(), token],
    queryFn: () => userService.getUser(getCookie(TOKEN_NAME)),
    enabled: Boolean(token),
    retry: false
  });

  const ensureLoaded = useCallback(() => {
    if (!getCookie(TOKEN_NAME)) return;
    if (query.isFetched || query.isFetching) return;
    query.refetch();
  }, [query.isFetched, query.isFetching, query.refetch]);

  const userData = resolveProfile(query.data);
  const email = String(userData?.email || "").trim();
  const name = String(userData?.name || "").trim();
  const isPassword = Boolean(userData?.is_password);
  const isSpConnected = userData?.is_sp_connected ?? null;
  const isAdsConnected = userData?.is_ads_connected ?? null;

  const value = useMemo(
    () => ({
      userData,
      email,
      name,
      isPassword,
      isSpConnected,
      isAdsConnected,
      isLoading: Boolean(token) && query.isLoading && !query.isFetched,
      isFetching: query.isFetching,
      isFetched: query.isFetched,
      isError: query.isError,
      error: query.error,
      ensureLoaded,
      refetch: query.refetch,
      raw: query.data || null
    }),
    [
      userData,
      email,
      name,
      isPassword,
      isSpConnected,
      isAdsConnected,
      token,
      query.isLoading,
      query.isFetching,
      query.isFetched,
      query.isError,
      query.error,
      query.refetch,
      query.data,
      ensureLoaded
    ]
  );

  return (
    <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return context;
}