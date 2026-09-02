/**
 * hooks/useReduxErrorToast.js
 * Watches Redux slice error state and shows toast once, then clears.
 */

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { showErrorToast } from "./useHandleError";

export const useReduxErrorToast = (error, clearAction) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!error) return;

    showErrorToast(error);
    dispatch(clearAction());
  }, [error, dispatch, clearAction]);
};

export default useReduxErrorToast;
