package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	connectMongoDB()
	mux := http.NewServeMux()
	mux.HandleFunc("/login", handleLogin)
	mux.HandleFunc("/search", handleSearchClasses)
	mux.HandleFunc("/saveTimesheet", handleSaveTimesheet)
	mux.HandleFunc("/checkPrereq", handleCheckPrereq)
	fmt.Println("Starting server at port 8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", enableCORS(logRequests(mux))))
}

func logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request: Method=%s, URL=%s, RemoteAddr=%s", r.Method, r.URL.String(), r.RemoteAddr)
		next.ServeHTTP(w, r)
	})
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("login")
}

func contains(results []bson.M, result bson.M) bool {
	resultJSON, err := json.Marshal(result)
	if err != nil {
		return false
	}
	for _, r := range results {
		rJSON, err := json.Marshal(r)
		if err != nil {
			continue
		}
		if string(resultJSON) == string(rJSON) {
			return true
		}
	}
	return false
}

func handleSearchClasses(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Query string `json:"query"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	queries := strings.Split(request.Query, " ")
	var results []bson.M
	for _, query := range queries {
		strQuery := string(query)
		var mongoResults []bson.M
		var mongoErr error
		if strings.HasPrefix(strQuery, "[") && strings.HasSuffix(strQuery, "]") {
			mongoResults, mongoErr = searchSBC(strQuery[1 : len(strQuery)-1])
		} else {
			mongoResults, mongoErr = searchClasses(query)
		}
		if mongoErr != nil {
			http.Error(w, "Error with mongo returning query results", http.StatusInternalServerError)
			return
		}
		for _, mongoResult := range mongoResults {
			if !contains(results, mongoResult) {
				results = append(results, mongoResult)
			}
		}
	}
	var responses []map[string]interface{}
	for _, result := range results {
		response := make(map[string]interface{})
		if course, ok := result["course"].(bson.M); ok {
			response["id"] = result["_id"]
			response["class"] = course["class"]
			response["code"] = course["code"]
			response["credits"] = course["credits"]
			response["title"] = course["title"]
			response["description"] = course["description"]
			response["prereq"] = course["prereq"]
			response["sbc"] = course["sbc"]
		} else {
			http.Error(w, "Invalid course data", http.StatusInternalServerError)
			return
		}
		response["section"] = result["section"]
		response["days"] = result["days"]
		response["timeStart"] = result["timeStart"]
		response["timeEnd"] = result["timeEnd"]
		response["instructor"] = result["instructor"]
		response["room"] = result["room"]
		responses = append(responses, response)
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(responses)
	if err != nil {
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}

func handleSaveTimesheet(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Timesheet []map[string]interface{} `json:"timesheet"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	var sheet []map[string]interface{}
	for _, entry := range request.Timesheet {
		temp := make(map[string]interface{})
		temp["status"] = entry["status"]
		timeIn, timeInErr := time.Parse(time.RFC3339, entry["timeIn"].(string))
		if timeInErr != nil {
			http.Error(w, "Error converting timeIn", http.StatusBadRequest)
		}
		temp["timeIn"] = timeIn
		timeOut, timeOutErr := time.Parse(time.RFC3339, entry["timeOut"].(string))
		if timeOutErr != nil {
			http.Error(w, "Error converting timeOut", http.StatusBadRequest)
		}
		temp["timeOut"] = timeOut
		sheet = append(sheet, temp)
	}
	err = updateTimeSheet(sheet, "114640750")
	if err != nil {
		http.Error(w, "Error updating timesheet to MongoDB", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func handleCheckPrereq(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Prereq string `json:"prereq"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	fmt.Println(request.Prereq)
	fmt.Println(checkMajors("CSE", "114640750"))
	fmt.Println(checkStanding("U3", "114640750"))
}
