export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  errorCode: string;
  message: string;
  details?: string[];
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function success<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return { success: true, data, message };
}

export function failure(errorCode: string, message: string, details?: string[]): ApiErrorResponse {
  return details?.length ? { success: false, errorCode, message, details } : { success: false, errorCode, message };
}
