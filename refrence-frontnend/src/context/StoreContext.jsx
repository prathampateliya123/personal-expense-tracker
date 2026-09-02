import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import userService from "../services/userService";

import { campaignKeys, dashboardKeys, reportKeys, ruleKeys, storeKeys, userKeys } from "../services/queryKeys";
import { getCookie, TOKEN_NAME } from "../utils/cookie";
import { getSelectedStoreId, normalizeStoreListResponse, setSelectedStoreId } from "../utils/storage";

const StoreContext = createContext(null);
const EMPTY_STORES = [];

export function StoreProvider({ children }) {
  const queryClient = useQueryClient();

  const token = getCookie(TOKEN_NAME);
  const [selectedStoreId, setSelectedId] = useState(() => getSelectedStoreId());

  const storesQuery = useQuery({
    queryKey: [...storeKeys.list(), token],
    queryFn: async () => {
      const data = await userService.listAmazonStores(getCookie(TOKEN_NAME));
      return normalizeStoreListResponse(data);
    },
    enabled: Boolean(token),
    retry: false
  });

  const stores = storesQuery.data ?? EMPTY_STORES;

  useEffect(() => {
    if (!stores.length) return;

    const stillExists = stores.some((item) => String(item.id) === String(selectedStoreId));
    if (selectedStoreId && stillExists) return;

    const nextId = String(stores[0].id);
    setSelectedId(nextId);
    setSelectedStoreId(nextId);
  }, [stores, selectedStoreId]);

  const selectedStore = useMemo(
    () => stores.find((item) => String(item.id) === String(selectedStoreId)) || stores[0] || null,
    [stores, selectedStoreId]
  );

  const selectStore = useCallback(
    async (storeId) => {
      const nextId = String(storeId);
      if (String(selectedStoreId) === nextId) return;

      setSelectedId(nextId);
      setSelectedStoreId(nextId);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: storeKeys.all }),
        queryClient.invalidateQueries({ queryKey: userKeys.getUser() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
        queryClient.invalidateQueries({ queryKey: campaignKeys.all }),
        queryClient.invalidateQueries({ queryKey: reportKeys.all }),
        queryClient.invalidateQueries({ queryKey: ruleKeys.all })
      ]);
    },
    [queryClient, selectedStoreId]
  );

  const ensureLoaded = useCallback(() => {
    if (!getCookie(TOKEN_NAME)) return;
    if (storesQuery.isFetched || storesQuery.isFetching) return;
    storesQuery.refetch();
  }, [storesQuery.isFetched, storesQuery.isFetching, storesQuery.refetch]);

  const refetchStores = useCallback(() => storesQuery.refetch(), [storesQuery.refetch]);

  const value = useMemo(
    () => ({
      stores,
      selectedStore,
      // Prefer resolved store object id; fall back to cookie/state id so
      // consumers do not briefly see storeId=0 while stores are loading.
      selectedStoreId: selectedStore?.id || selectedStoreId || null,
      selectStore,
      ensureLoaded,
      refetchStores,
      isLoading: storesQuery.isLoading,
      isFetching: storesQuery.isFetching,
      isFetched: storesQuery.isFetched,
      isError: storesQuery.isError
    }),
    [
      stores,
      selectedStore,
      selectedStoreId,
      selectStore,
      ensureLoaded,
      refetchStores,
      storesQuery.isLoading,
      storesQuery.isFetching,
      storesQuery.isFetched,
      storesQuery.isError
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}