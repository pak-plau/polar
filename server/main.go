package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
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
	mux.HandleFunc("/getTimesheet", handleGetTimesheet)
	mux.HandleFunc("/checkPrereq", handleCheckPrereq)
	mux.HandleFunc("/saveCart", handleSaveCart)
	mux.HandleFunc("/getCart", handleGetCart)
	mux.HandleFunc("/getUnofficialTranscript", handleGetUnofficialTranscript)
	mux.HandleFunc("/getGPA", handleGetGPA)
	mux.HandleFunc("/getRecords", handleGetRecords)
	mux.HandleFunc("/getRecord", handleGetRecord)
	mux.HandleFunc("/putRecord", handlePutRecord)
	mux.HandleFunc("/getEnrollmentDate", handleGetEnrollmentDate)
	mux.HandleFunc("/getHousingDate", handleGetHousingDate)
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
		Id        string                   `json:"id"`
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
	err = updateTimesheet(sheet, request.Id)
	if err != nil {
		http.Error(w, "Error updating timesheet to MongoDB", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func handleGetTimesheet(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Id string `json:"id"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	timesheet, err := getTimesheet(request.Id)
	if err != nil {
		http.Error(w, "Error with getting cart", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(timesheet)
	if err != nil {
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}

func handleCheckPrereq(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Prereq string `json:"prereq"`
		Id     string `json:"id"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON request body", http.StatusBadRequest)
		return
	}
	prereqs := strings.Split(request.Prereq, ";")
	for _, req := range prereqs {
		if strings.HasPrefix(req, "major") {
			temp, err := checkMajors(strings.Split(req, " ")[1], request.Id)
			if err != nil {
				http.Error(w, "Error checking major", http.StatusInternalServerError)
				return
			}
			if !temp {
				sendConflict(w, "You do not fit the major prerequisite of this class")
				return
			}
		} else if strings.HasPrefix(req, "standing") {
			temp, err := checkStanding(strings.Split(req, " ")[1], request.Id)
			if err != nil {
				http.Error(w, "Error checking standing", http.StatusInternalServerError)
				return
			}
			if !temp {
				sendConflict(w, "You do not fit the standing prerequisite of this class")
				return
			}
		} else if strings.HasPrefix(req, ">") {
			temp, err := checkGrade(strings.Split(req, " ")[0][1:], strings.Split(req, " ")[1], request.Id)
			if err != nil {
				http.Error(w, "Error checking minimum grade", http.StatusInternalServerError)
				return
			}
			if !temp {
				sendConflict(w, "You do not fit the minimum grade prerequisite of this class")
				return
			}
		} else {
			temp, err := checkGrade("D", req, request.Id)
			if err != nil {
				http.Error(w, "Error checking grade credit", http.StatusInternalServerError)
				return
			}
			if !temp {
				sendConflict(w, "You do not fit the class prerequisite of this class")
				return
			}
		}
	}
	w.WriteHeader(http.StatusOK)
}

func sendConflict(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusConflict)
	response := map[string]string{
		"error": message,
	}
	json.NewEncoder(w).Encode(response)
}

func handleSaveCart(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Classes []map[string]interface{} `json:"classes"`
		Id      string                   `json:"id"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	var classes []string
	fmt.Println(request.Classes)
	for _, clas := range request.Classes {
		classes = append(classes, clas["class"].(string)+" "+clas["code"].(string)+"-"+clas["section"].(string))
	}
	err = updateCart(classes, request.Id)
	if err != nil {
		fmt.Println(err)
		sendConflict(w, err.Error())
	} else {
		w.WriteHeader(http.StatusOK)
	}
}

func handleGetCart(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Id string `json:"id"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	cart, err := getCurrent(request.Id)
	if err != nil {
		http.Error(w, "Error with getting cart", http.StatusInternalServerError)
		return
	}
	var responses []map[string]interface{}
	for _, result := range cart {
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

func handleGetUnofficialTranscript(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Id string `json:"id"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	transcript, err := getClasses(request.Id)
	if err != nil {
		http.Error(w, "Error with getting transcript", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(transcript)
	if err != nil {
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}

func handleGetGPA(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Id string `json:"id"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	gpa, err := getGPA(request.Id)
	if err != nil {
		http.Error(w, "Error with getting transcript", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(gpa)
	if err != nil {
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}

func handleGetRecords(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Id string `json:"id"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	files, err := os.ReadDir("./user_records/" + request.Id)
	if err != nil {
		http.Error(w, "Error reading directory", http.StatusInternalServerError)
		return
	}
	var response []string
	for _, file := range files {
		response = append(response, file.Name())
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}

func handleGetRecord(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Id       string `json:"id"`
		Filename string `json:"filename"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	file, err := os.Open("./user_records/" + request.Id + "/" + request.Filename + ".pdf")
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment")
	w.WriteHeader(http.StatusOK)

	_, err = io.Copy(w, file)
	if err != nil {
		http.Error(w, "Error sending file", http.StatusInternalServerError)
		return
	}
}

func handlePutRecord(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}
	id := r.FormValue("id")
	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Unable to retrieve file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	filename := r.FormValue("filename")
	if filename == "" {
		http.Error(w, "Filename is required", http.StatusBadRequest)
		return
	}
	dir := fmt.Sprintf("./user_records/%s", id)
	filePath := filepath.Join(dir, filename+".pdf")
	outFile, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Failed to create file", http.StatusInternalServerError)
		return
	}
	defer outFile.Close()
	_, err = io.Copy(outFile, file)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func handleGetEnrollmentDate(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Id string `json:"id"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	enrollment, err := getEnrollmentDate(request.Id)
	if err != nil {
		http.Error(w, "Error with getting cart", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(enrollment)
	if err != nil {
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}

func handleGetHousingDate(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Id string `json:"id"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	housing, err := getHousingDate(request.Id)
	if err != nil {
		http.Error(w, "Error with getting cart", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(housing)
	if err != nil {
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}
