package api

import (
	"encoding/json"
	"net/http"
)

type runnersResponse struct {
	ID          int      `json:"id"`
	TargetCount int      `json:"target_count"`
	Completed   int      `json:"completed"`
	Threads     int      `json:"threads"`
	Tags        []string `json:"tags"`
}

// RunnersHandler returns runner statistics
//
//	@Summary		Runner statistics
//	@Description	Get runner statistics.
//	@Tags			Results
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	runnersResponse
//	@Router			/runners [get]
func (h *ApiHandler) RunnersHandler(w http.ResponseWriter, r *http.Request) {
	response := []*runnersResponse{}

	for id, runner := range h.Runners { // id, runner
		response = append(response, &runnersResponse{
			ID:          id,
			TargetCount: runner.TargetCount,
			Completed:   runner.Completed,
			Threads:     runner.Options.Scan.Threads,
			Tags:        runner.Options.Scan.Tags,
		})
	}

	jsonData, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(jsonData)
}
