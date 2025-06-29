package logger

import (
	"context"
	"os"

	"github.com/sirupsen/logrus"
	"github.com/google/uuid"
)

type Logger struct {
	*logrus.Logger
}

type contextKey string

const (
	RequestIDKey contextKey = "request_id"
	UserIDKey    contextKey = "user_id"
)

func New(level, format string) *Logger {
	log := logrus.New()

	// Set log level
	switch level {
	case "debug":
		log.SetLevel(logrus.DebugLevel)
	case "info":
		log.SetLevel(logrus.InfoLevel)
	case "warn":
		log.SetLevel(logrus.WarnLevel)
	case "error":
		log.SetLevel(logrus.ErrorLevel)
	default:
		log.SetLevel(logrus.InfoLevel)
	}

	// Set formatter
	if format == "json" {
		log.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: "2006-01-02 15:04:05",
		})
	} else {
		log.SetFormatter(&logrus.TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05",
		})
	}

	log.SetOutput(os.Stdout)

	return &Logger{Logger: log}
}

func (l *Logger) WithContext(ctx context.Context) *logrus.Entry {
	entry := l.Logger.WithContext(ctx)

	if requestID := ctx.Value(RequestIDKey); requestID != nil {
		entry = entry.WithField("request_id", requestID)
	}

	if userID := ctx.Value(UserIDKey); userID != nil {
		entry = entry.WithField("user_id", userID)
	}

	return entry
}

func (l *Logger) WithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, RequestIDKey, requestID)
}

func (l *Logger) WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, UserIDKey, userID)
}

func (l *Logger) GenerateRequestID() string {
	return uuid.New().String()
}

func (l *Logger) LogRequest(ctx context.Context, method, path, userAgent, clientIP string, statusCode int, duration float64) {
	l.WithContext(ctx).WithFields(logrus.Fields{
		"method":      method,
		"path":        path,
		"user_agent":  userAgent,
		"client_ip":   clientIP,
		"status_code": statusCode,
		"duration_ms": duration,
		"type":        "request",
	}).Info("HTTP Request")
}

func (l *Logger) LogError(ctx context.Context, err error, message string, fields map[string]interface{}) {
	entry := l.WithContext(ctx).WithError(err)
	
	if fields != nil {
		entry = entry.WithFields(fields)
	}
	
	entry.Error(message)
}

func (l *Logger) LogInfo(ctx context.Context, message string, fields map[string]interface{}) {
	entry := l.WithContext(ctx)
	
	if fields != nil {
		entry = entry.WithFields(fields)
	}
	
	entry.Info(message)
}

func (l *Logger) LogWarning(ctx context.Context, message string, fields map[string]interface{}) {
	entry := l.WithContext(ctx)
	
	if fields != nil {
		entry = entry.WithFields(fields)
	}
	
	entry.Warn(message)
}

func (l *Logger) LogDebug(ctx context.Context, message string, fields map[string]interface{}) {
	entry := l.WithContext(ctx)
	
	if fields != nil {
		entry = entry.WithFields(fields)
	}
	
	entry.Debug(message)
}