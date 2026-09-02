/**
 * hooks/useHandleError.js
 * Centralized API / user-facing error toasts.
 */

import { useCallback } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../utils/helpers";

export const showErrorToast = (error, customMessage = null) => {
  const message = customMessage || getApiErrorMessage(error);
  toast.error(message);
};

export const showSuccessToast = (message) => {
  toast.success(message);
};

export const useHandleError = () => {
  const handleError = useCallback((error, customMessage = null) => {
    showErrorToast(error, customMessage);
  }, []);

  return { handleError, showErrorToast, showSuccessToast };
};

export default useHandleError;
