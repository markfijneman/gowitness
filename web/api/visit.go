package api

import (
	"encoding/json"
	"net/http"

	"github.com/markfijneman/gowitness/pkg/log"
	"github.com/markfijneman/gowitness/pkg/models"
)

type visitResultRequest struct {
	ID int `json:"id"`
}

// VisitResultHandler keeps track if results from the database are visited via the report server
//
//	@Summary		Set result as visited
//	@Description	Sets result as visited by id.
//	@Tags			Results
//	@Accept			json
//	@Produce		json
//	@Param			query	body		visitResultRequest	true	"The result ID to set as visited"
//	@Success		200		{string}	string				"ok"
//	@Router			/results/visit [post]
func (h *ApiHandler) VisitResultHandler(w http.ResponseWriter, r *http.Request) {
	var request visitResultRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		log.Error("failed to read json request", "err", err)
		http.Error(w, "Error reading JSON request", http.StatusInternalServerError)
		return
	}

	if err := h.DB.Model(&models.Result{}).Where("id = ?", request.ID).Update("visited", true).Error; err != nil {
		log.Error("failed to set result as visited", "err", err)
		return
	}

	response := `ok`
	jsonData, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}

	w.Write(jsonData)
}
