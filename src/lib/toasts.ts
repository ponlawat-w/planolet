import type { ToastSettings } from '@skeletonlabs/skeleton';

const defaultToastSettings: Partial<ToastSettings> = {
  timeout: 3000,
  hoverable: true
};

export const getToast = (message: string): ToastSettings => ({ ...defaultToastSettings, message });

export const getBackgroundToast = (message: string, background: string): ToastSettings => ({
  ...getToast(message), background
});

export const getPrimaryToast = (message:string) => getBackgroundToast(message, 'variant-filled-primary');
export const getSuccessToast = (message:string) => getBackgroundToast(message, 'variant-filled-success');
export const getWarningToast = (message:string) => getBackgroundToast(message, 'variant-filled-warning');
export const getErrorToast = (message:string) => getBackgroundToast(message, 'variant-filled-error');
export const getExceptionErrorToast = (message:string, ex: any|Error) => {
  if (!(ex instanceof Error)) {
    return getErrorToast(message);
  }
  return getErrorToast(message + ': ' + ex.message);
};
