package api

import (
	"encoding/json"
	"net/http"

	"github.com/markfijneman/gowitness/pkg/log"
	"github.com/markfijneman/gowitness/pkg/models"
)

type tagListResponse struct {
	Value []string `json:"tags"`
}

// TagListHandler lists tags
//
//	@Summary		Get tag results
//	@Description	Get all unique tags.
//	@Tags			Results
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	tagListResponse
//	@Router			/results/tag [get]
func (h *ApiHandler) TagListHandler(w http.ResponseWriter, r *http.Request) {
	var results = &tagListResponse{}

	if err := h.DB.Model(&models.Tag{}).Distinct("value").
		Find(&results.Value).Error; err != nil {

		log.Error("could not find distinct tags", "err", err)
		return
	}

	jsonData, err := json.Marshal(results)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(jsonData)
}
