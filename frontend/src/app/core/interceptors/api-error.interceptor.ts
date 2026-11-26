import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let displayMessage = 'An unexpected error occurred.';

      if (error.status === 0) {
        displayMessage = 'Cannot connect to backend server. Please verify Spring Boot is running on port 8080.';
      } else if (error.error && typeof error.error === 'object') {
        const errorObj = error.error;
        if (errorObj.validationErrors && Object.keys(errorObj.validationErrors).length > 0) {
          const details = Object.entries(errorObj.validationErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ');
          displayMessage = `${errorObj.message || 'Validation error'} (${details})`;
        } else if (errorObj.message) {
          displayMessage = errorObj.message;
        } else if (error.statusText) {
          displayMessage = `HTTP ${error.status}: ${error.statusText}`;
        }
      } else if (typeof error.error === 'string') {
        displayMessage = error.error;
      } else {
        displayMessage = `HTTP ${error.status}: ${error.message}`;
      }

      // Mutate or ensure error.error has normalized message
      if (!error.error || typeof error.error !== 'object') {
        (error as any).error = { message: displayMessage };
      } else {
        error.error.message = displayMessage;
      }

      return throwError(() => error);
    })
  );
};
