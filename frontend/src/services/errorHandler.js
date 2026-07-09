import { HTTP_STATUS } from '../constants/appConstants';

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

const STATUS_MESSAGES = {
  [HTTP_STATUS.BAD_REQUEST]: 'The request was invalid.',
  [HTTP_STATUS.UNAUTHORIZED]: 'You are not authorized. Please sign in again.',
  [HTTP_STATUS.FORBIDDEN]: 'You do not have permission to do this.',
  [HTTP_STATUS.NOT_FOUND]: 'The requested resource was not found.',
  [HTTP_STATUS.SERVER_ERROR]: 'Server error. Please try again later.',
};

export function parseApiError(error) {
  if (error?.response) {
    const status = error.response.status;
    const backendMessage =
      error.response.data?.message || error.response.data?.error;
    return {
      status,
      message: backendMessage || STATUS_MESSAGES[status] || DEFAULT_MESSAGE,
    };
  }

  if (error?.request) {
    return { status: null, message: 'Unable to reach the server. Check your connection.' };
  }

  return { status: null, message: error?.message || DEFAULT_MESSAGE };
}