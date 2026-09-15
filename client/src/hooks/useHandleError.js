import { useCallback } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../utils/helper";

export const showErrorToast = (error, customMessage = null) => {
  const message =
    (typeof customMessage === "string" && customMessage.trim()) ||
    (typeof error === "string" ? error : getApiErrorMessage(error));
  toast.error(typeof message === "string" ? message : getApiErrorMessage(error));
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
