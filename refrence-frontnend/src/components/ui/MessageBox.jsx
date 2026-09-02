import { toast } from 'react-toastify';

const toastOptions = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  draggable: true,
  className: 'set-message-box'
};

export const MessageBox = (type, message) => {
  if (type && message) {
    const options = { ...toastOptions, toastId: message };
    if (type === 'success') toast.success(message, options);
    if (type === 'error') toast.error(message, options);
    if (type === 'warn') toast.warn(message, options);
    if (type === 'info') toast.info(message, options);
  }
};