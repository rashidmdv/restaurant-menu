package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"restaurant-menu-api/internal/domain/entities"
	"restaurant-menu-api/internal/domain/repositories"
	appErrors "restaurant-menu-api/pkg/errors"
	"restaurant-menu-api/pkg/logger"
	"restaurant-menu-api/pkg/response"
)

type ReservationHandler struct {
	repository repositories.ReservationRepository
	logger     *logger.Logger
}

func NewReservationHandler(repository repositories.ReservationRepository, logger *logger.Logger) *ReservationHandler {
	return &ReservationHandler{
		repository: repository,
		logger:     logger,
	}
}

// CreateReservation creates a new reservation
// @Summary Create a reservation
// @Description Create a new table reservation
// @Tags Reservations
// @Accept json
// @Produce json
// @Param reservation body entities.CreateReservationRequest true "Reservation data"
// @Success 201 {object} entities.Reservation
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/reservations [post]
func (h *ReservationHandler) CreateReservation(c *gin.Context) {
	ctx := c.Request.Context()

	var req entities.CreateReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, appErrors.WrapValidationError(err, "Invalid reservation data"))
		return
	}

	// Parse the date string to datatypes.Date
	parsedDate, err := time.Parse("2006-01-02", req.ReservationDate)
	if err != nil {
		response.Error(c, appErrors.NewBadRequestError("Invalid date format. Use YYYY-MM-DD", err.Error()))
		return
	}

	reservation := &entities.Reservation{
		FullName:        req.FullName,
		Email:           req.Email,
		Phone:           req.Phone,
		ReservationDate: entities.CustomDate{Time: parsedDate},
		ReservationTime: req.ReservationTime,
		NumberOfGuests:  req.NumberOfGuests,
		SpecialRequests: req.SpecialRequests,
		Status:          entities.ReservationStatusPending,
	}

	if err := h.repository.Create(ctx, reservation); err != nil {
		h.logger.LogError(ctx, err, "Failed to create reservation", nil)
		response.Error(c, err)
		return
	}

	// TODO: Send confirmation email to customer
	// TODO: Send notification email to restaurant staff

	response.Created(c, reservation)
}

// GetReservation retrieves a reservation by ID
// @Summary Get a reservation
// @Description Get reservation details by ID
// @Tags Reservations
// @Accept json
// @Produce json
// @Param id path int true "Reservation ID"
// @Success 200 {object} entities.Reservation
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/reservations/{id} [get]
func (h *ReservationHandler) GetReservation(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, appErrors.NewBadRequestError("Invalid reservation ID", ""))
		return
	}

	reservation, err := h.repository.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get reservation", map[string]interface{}{"id": id})
		response.Error(c, err)
		return
	}

	if reservation == nil {
		response.Error(c, appErrors.NewNotFoundError("Reservation"))
		return
	}

	response.Success(c, reservation)
}

// ListReservations retrieves a list of reservations
// @Summary List reservations
// @Description Get a paginated list of reservations with optional filters
// @Tags Reservations
// @Accept json
// @Produce json
// @Param status query string false "Filter by status (pending, confirmed, cancelled, completed)"
// @Param date_from query string false "Filter by date from (YYYY-MM-DD)"
// @Param date_to query string false "Filter by date to (YYYY-MM-DD)"
// @Param search query string false "Search by name, email, or phone"
// @Param limit query int false "Limit number of results" default(20)
// @Param offset query int false "Offset for pagination" default(0)
// @Success 200 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/reservations [get]
func (h *ReservationHandler) ListReservations(c *gin.Context) {
	ctx := c.Request.Context()

	filter := &entities.ReservationFilter{
		IncludeCount: true,
		Limit:        20,
		Offset:       0,
	}

	// Parse query parameters
	if status := c.Query("status"); status != "" {
		st := entities.ReservationStatus(status)
		filter.Status = &st
	}

	if dateFrom := c.Query("date_from"); dateFrom != "" {
		filter.DateFrom = &dateFrom
	}

	if dateTo := c.Query("date_to"); dateTo != "" {
		filter.DateTo = &dateTo
	}

	filter.Search = c.Query("search")

	if limit := c.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 {
			filter.Limit = l
		}
	}

	if offset := c.Query("offset"); offset != "" {
		if o, err := strconv.Atoi(offset); err == nil && o >= 0 {
			filter.Offset = o
		}
	}

	filter.OrderBy = c.DefaultQuery("order_by", "created_at")
	filter.OrderDir = c.DefaultQuery("order_dir", "DESC")

	reservations, total, err := h.repository.List(ctx, filter)
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to list reservations", nil)
		response.Error(c, err)
		return
	}

	response.Success(c, map[string]interface{}{
		"reservations": reservations,
		"total":        total,
		"limit":        filter.Limit,
		"offset":       filter.Offset,
	})
}

// UpdateReservation updates a reservation
// @Summary Update a reservation
// @Description Update reservation details
// @Tags Reservations
// @Accept json
// @Produce json
// @Param id path int true "Reservation ID"
// @Param reservation body entities.UpdateReservationRequest true "Reservation data"
// @Success 200 {object} entities.Reservation
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/reservations/{id} [put]
func (h *ReservationHandler) UpdateReservation(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, appErrors.NewBadRequestError("Invalid reservation ID", ""))
		return
	}

	var req entities.UpdateReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, appErrors.WrapValidationError(err, "Invalid reservation data"))
		return
	}

	reservation, err := h.repository.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get reservation for update", map[string]interface{}{"id": id})
		response.Error(c, err)
		return
	}

	if reservation == nil {
		response.Error(c, appErrors.NewNotFoundError("Reservation"))
		return
	}

	// Update fields
	if req.FullName != nil {
		reservation.FullName = *req.FullName
	}
	if req.Email != nil {
		reservation.Email = *req.Email
	}
	if req.Phone != nil {
		reservation.Phone = *req.Phone
	}
	if req.ReservationDate != nil {
		parsedDate, err := time.Parse("2006-01-02", *req.ReservationDate)
		if err != nil {
			response.Error(c, appErrors.NewBadRequestError("Invalid date format. Use YYYY-MM-DD", err.Error()))
			return
		}
		reservation.ReservationDate = entities.CustomDate{Time: parsedDate}
	}
	if req.ReservationTime != nil {
		reservation.ReservationTime = *req.ReservationTime
	}
	if req.NumberOfGuests != nil {
		reservation.NumberOfGuests = *req.NumberOfGuests
	}
	if req.SpecialRequests != nil {
		reservation.SpecialRequests = *req.SpecialRequests
	}
	if req.Status != nil {
		reservation.Status = *req.Status
	}

	if err := h.repository.Update(ctx, reservation); err != nil {
		h.logger.LogError(ctx, err, "Failed to update reservation", map[string]interface{}{"id": id})
		response.Error(c, err)
		return
	}

	response.Success(c, reservation)
}

// DeleteReservation deletes a reservation
// @Summary Delete a reservation
// @Description Delete a reservation by ID
// @Tags Reservations
// @Accept json
// @Produce json
// @Param id path int true "Reservation ID"
// @Success 204 "No Content"
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/reservations/{id} [delete]
func (h *ReservationHandler) DeleteReservation(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, appErrors.NewBadRequestError("Invalid reservation ID", ""))
		return
	}

	reservation, err := h.repository.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get reservation for deletion", map[string]interface{}{"id": id})
		response.Error(c, err)
		return
	}

	if reservation == nil {
		response.Error(c, appErrors.NewNotFoundError("Reservation"))
		return
	}

	if err := h.repository.Delete(ctx, uint(id)); err != nil {
		h.logger.LogError(ctx, err, "Failed to delete reservation", map[string]interface{}{"id": id})
		response.Error(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// UpdateReservationStatus updates reservation status
// @Summary Update reservation status
// @Description Update the status of a reservation
// @Tags Reservations
// @Accept json
// @Produce json
// @Param id path int true "Reservation ID"
// @Param status body map[string]string true "Status object"
// @Success 200 {object} entities.Reservation
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /v1/reservations/{id}/status [patch]
func (h *ReservationHandler) UpdateReservationStatus(c *gin.Context) {
	ctx := c.Request.Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, appErrors.NewBadRequestError("Invalid reservation ID", ""))
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=pending confirmed cancelled completed"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, appErrors.WrapValidationError(err, "Invalid status data"))
		return
	}

	if err := h.repository.UpdateStatus(ctx, uint(id), entities.ReservationStatus(req.Status)); err != nil {
		h.logger.LogError(ctx, err, "Failed to update reservation status", map[string]interface{}{"id": id})
		response.Error(c, err)
		return
	}

	reservation, err := h.repository.GetByID(ctx, uint(id))
	if err != nil {
		h.logger.LogError(ctx, err, "Failed to get updated reservation", map[string]interface{}{"id": id})
		response.Error(c, err)
		return
	}

	response.Success(c, reservation)
}
