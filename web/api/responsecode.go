package api

import (
	"encoding/json"
	"net/http"

	"github.com/markfijneman/gowitness/pkg/log"
	"github.com/markfijneman/gowitness/pkg/models"
)

type responseCodeListResponse struct {
	ResponseCodes []int `json:"response_codes"`
}

// ResponseCodeListHandler lists response codes
//
//	@Summary		Get response codes
//	@Description	Get all unique response codes.
//	@ResponseCodes	Results
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	responseCodeListResponse
//	@Router			/results/responsecode [get]
func (h *ApiHandler) ResponseCodeListHandler(w http.ResponseWriter, r *http.Request) {
	var results = &responseCodeListResponse{}

	if err := h.DB.Model(&models.Result{}).Distinct("response_code").
		Pluck("response_code", &results.ResponseCodes).Error; err != nil {

		log.Error("could not find distinct response codes", "err", err)
		return
	}

	jsonData, err := json.Marshal(results)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(jsonData)
}
