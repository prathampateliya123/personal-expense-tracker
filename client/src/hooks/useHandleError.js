/**
 * hooks/useHandleError.js
 * Centralized API / user-facing error toasts.
 */

import { useCallback } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../utils/helper";

export const showErrorToast = (error, customMessage = null) => {
  const message =
    customMessage ||
    (typeof error === "string" ? error : getApiErrorMessage(error));
  toast.error(message);
};

export const showSuccessToast = (message) => {
  toast.success(message);
};

export const handleApiError = (error, customMessage = null) => {
  showErrorToast(error, customMessage);
};

export const useHandleError = () => {
  const handleError = useCallback((error, customMessage = null) => {
    handleApiError(error, customMessage);
  }, []);

  return { handleError, showErrorToast, showSuccessToast, handleApiError };
};

export default useHandleError;
