package errors

import (
	"errors"
	"fmt"
	"net/http"
)

type AppErrorType string

const (
	ValidationError    AppErrorType = "VALIDATION_ERROR"
	NotFoundError      AppErrorType = "NOT_FOUND_ERROR"
	ConflictError      AppErrorType = "CONFLICT_ERROR"
	UnauthorizedError  AppErrorType = "UNAUTHORIZED_ERROR"
	ForbiddenError     AppErrorType = "FORBIDDEN_ERROR"
	InternalError      AppErrorType = "INTERNAL_ERROR"
	BadRequestError    AppErrorType = "BAD_REQUEST_ERROR"
	ServiceUnavailable AppErrorType = "SERVICE_UNAVAILABLE_ERROR"
)

type AppError struct {
	Type       AppErrorType `json:"type"`
	Message    string       `json:"message"`
	Details    string       `json:"details,omitempty"`
	StatusCode int          `json:"-"`
	Err        error        `json:"-"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s - %v", e.Type, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Type, e.Message)
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func NewAppError(errorType AppErrorType, message, details string, err error) *AppError {
	appErr := &AppError{
		Type:    errorType,
		Message: message,
		Details: details,
		Err:     err,
	}

	switch errorType {
	case ValidationError:
		appErr.StatusCode = http.StatusBadRequest
	case NotFoundError:
		appErr.StatusCode = http.StatusNotFound
	case ConflictError:
		appErr.StatusCode = http.StatusConflict
	case UnauthorizedError:
		appErr.StatusCode = http.StatusUnauthorized
	case ForbiddenError:
		appErr.StatusCode = http.StatusForbidden
	case BadRequestError:
		appErr.StatusCode = http.StatusBadRequest
	case ServiceUnavailable:
		appErr.StatusCode = http.StatusServiceUnavailable
	default:
		appErr.StatusCode = http.StatusInternalServerError
	}

	return appErr
}

func NewValidationError(message, details string) *AppError {
	return NewAppError(ValidationError, message, details, nil)
}

func NewNotFoundError(resource string) *AppError {
	return NewAppError(NotFoundError, fmt.Sprintf("%s not found", resource), "", nil)
}

func NewConflictError(message string) *AppError {
	return NewAppError(ConflictError, message, "", nil)
}

func NewUnauthorizedError(message string) *AppError {
	return NewAppError(UnauthorizedError, message, "", nil)
}

func NewForbiddenError(message string) *AppError {
	return NewAppError(ForbiddenError, message, "", nil)
}

func NewBadRequestError(message, details string) *AppError {
	return NewAppError(BadRequestError, message, details, nil)
}

func NewInternalError(message string, err error) *AppError {
	return NewAppError(InternalError, message, "", err)
}

func NewServiceUnavailableError(message string) *AppError {
	return NewAppError(ServiceUnavailable, message, "", nil)
}

func IsAppError(err error) (*AppError, bool) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr, true
	}
	return nil, false
}

func GetStatusCode(err error) int {
	if appErr, ok := IsAppError(err); ok {
		return appErr.StatusCode
	}
	return http.StatusInternalServerError
}

func GetErrorType(err error) AppErrorType {
	if appErr, ok := IsAppError(err); ok {
		return appErr.Type
	}
	return InternalError
}

func WrapValidationError(err error, message string) *AppError {
	return NewAppError(ValidationError, message, err.Error(), err)
}

func WrapInternalError(err error, message string) *AppError {
	return NewAppError(InternalError, message, "", err)
}