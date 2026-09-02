import { createContext, useCallback, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import authService from "../services/authService";
import { userKeys } from "../services/queryKeys";

const UserProfileContext = createContext(null);

export function UserProfileProvider({ children }) {
  const query = useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      try {
        const data = await authService.getProfile();
        return data.user ?? null;
      } catch (error) {
        if (error?.response?.status === 401) return null;
        throw error;
      }
    },
    retry: false,
  });

  const ensureLoaded = useCallback(() => {
    if (query.isFetched || query.isFetching) return;
    query.refetch();
  }, [query.isFetched, query.isFetching, query.refetch]);

  const user = query.data ?? null;

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing: query.isLoading && !query.isFetched,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isFetched: query.isFetched,
      isError: query.isError,
      error: query.error,
      ensureLoaded,
      refetch: query.refetch,
    }),
    [
      user,
      query.isLoading,
      query.isFetching,
      query.isFetched,
      query.isError,
      query.error,
      query.refetch,
      ensureLoaded,
    ]
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return context;
}

export default UserProfileContext;
