package main

import (
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

var (
	dbClient  *mongo.Client
	dbName    = "polarDB"
	errNoUser = errors.New("user not found")
)

func connectMongoDB() {
	var err error
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	dbClient, err = mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	err = dbClient.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Could not ping MongoDB: %v", err)
	}
	fmt.Println("Connected to MongoDB successfully!")

	db := dbClient.Database(dbName)

	ensureCollectionExists(ctx, db, "users")
	ensureCollectionExists(ctx, db, "courses")
	ensureCollectionExists(ctx, db, "classes")
	// Uncomment if there are updates to courses.csv
	err = parseCSVAndInsertIntoCourses("courses.csv")
	if err != nil {
		log.Printf("%v", err)
	}
	// Uncomment if there are updates to classes.csv
	err = parseCSVAndInsertIntoClasses("classes.csv")
	if err != nil {
		log.Printf("%v", err)
	}
	// Uncomment if there are updates to users.csv
	err = parseCSVAndInsertIntoUsers("users.csv")
	if err != nil {
		log.Printf("%v", err)
	}
}

func ensureCollectionExists(ctx context.Context, db *mongo.Database, collectionName string) {
	collections, err := db.ListCollectionNames(ctx, bson.M{})
	if err != nil {
		log.Fatalf("Failed to list collections: %v", err)
	}
	for _, name := range collections {
		if name == collectionName {
			fmt.Printf("Collection '%s' already exists.\n", collectionName)
			return
		}
	}
	fmt.Printf("Creating collection '%s'...\n", collectionName)
	err = dbClient.Database(dbName).CreateCollection(ctx, collectionName)
	if err != nil {
		log.Fatalf("Failed to create collection '%s': %v", collectionName, err)
	}
	fmt.Printf("Collection '%s' created successfully.\n", collectionName)
}

func parseCSVAndInsertIntoCourses(csvFilePath string) error {
	deleteErr := deleteAllDocumentsInCollection("courses")
	if deleteErr != nil {
		return deleteErr
	}
	file, err := os.Open(csvFilePath)
	if err != nil {
		return fmt.Errorf("failed to open CSV file: %v", err)
	}
	defer file.Close()
	reader := csv.NewReader(file)
	rows, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read CSV file: %v", err)
	}
	if len(rows) < 2 {
		return fmt.Errorf("CSV file is empty or does not have a header row")
	}
	headers := rows[0]
	collection := dbClient.Database(dbName).Collection("courses")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var documents []interface{}
	for _, row := range rows[1:] {
		if len(row) != len(headers) {
			return fmt.Errorf("row length does not match header length: %v", row)
		}
		document := bson.M{}
		for i, value := range row {
			if headers[i] == "credits" {
				credits, convErr := strconv.ParseFloat(value, 64)
				if convErr != nil {
					return fmt.Errorf("failed to convert 'credits' to a number: %v", convErr)
				}
				document[headers[i]] = credits
			} else if headers[i] == "class" || headers[i] == "sbc" {
				document[headers[i]] = strings.Split(value, "/")
			} else {
				document[headers[i]] = value
			}
		}
		documents = append(documents, document)
	}
	_, err = collection.InsertMany(ctx, documents)
	if err != nil {
		return fmt.Errorf("failed to insert documents: %v", err)
	}
	fmt.Printf("Successfully inserted %d rows into the 'courses' collection.\n", len(documents))
	return nil
}

func parseCSVAndInsertIntoClasses(csvFilePath string) error {
	deleteErr := deleteAllDocumentsInCollection("classes")
	if deleteErr != nil {
		return deleteErr
	}
	file, err := os.Open(csvFilePath)
	if err != nil {
		return fmt.Errorf("failed to open CSV file: %v", err)
	}
	defer file.Close()
	reader := csv.NewReader(file)
	rows, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read CSV file: %v", err)
	}
	if len(rows) < 2 {
		return fmt.Errorf("CSV file is empty or does not have a header row")
	}
	headers := rows[0]
	classesCollection := dbClient.Database(dbName).Collection("classes")
	coursesCollection := dbClient.Database(dbName).Collection("courses")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var documents []interface{}
	for _, row := range rows[1:] {
		if len(row) != len(headers) {
			return fmt.Errorf("row length does not match header length: %v", row)
		}
		classArray := strings.Split(row[0], "/")
		code := row[1]
		filter := bson.M{"class": bson.M{"$in": classArray}, "code": code}
		var course bson.M
		err = coursesCollection.FindOne(ctx, filter).Decode(&course)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				fmt.Printf("Warning: No matching course found for class '%s' and code '%s'.\n", classArray, code)
			} else {
				return fmt.Errorf("failed to query courses collection: %v", err)
			}
		}
		document := bson.M{}
		if course != nil {
			document["course"] = course
		}
		for i, value := range row {
			if i > 1 {
				if headers[i] == "timeStart" || headers[i] == "timeEnd" {
					time, timeErr := convertTimeToDate(value)
					if timeErr != nil {
						return timeErr
					}
					document[headers[i]] = time
				} else if headers[i] == "maxSize" || headers[i] == "size" {
					number, numberErr := strconv.Atoi(value)
					if numberErr != nil {
						return numberErr
					}
					document[headers[i]] = number
				} else {
					document[headers[i]] = value
				}
			}
		}
		documents = append(documents, document)
	}
	_, err = classesCollection.InsertMany(ctx, documents)
	if err != nil {
		return fmt.Errorf("failed to insert documents into classes collection: %v", err)
	}
	fmt.Printf("Successfully inserted %d rows into the 'classes' collection.\n", len(documents))
	return nil
}

func parseCSVAndInsertIntoUsers(csvFilePath string) error {
	deleteErr := deleteAllDocumentsInCollection("users")
	if deleteErr != nil {
		return deleteErr
	}
	file, err := os.Open(csvFilePath)
	if err != nil {
		return fmt.Errorf("failed to open CSV file: %v", err)
	}
	defer file.Close()
	reader := csv.NewReader(file)
	rows, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read CSV file: %v", err)
	}
	if len(rows) < 2 {
		return fmt.Errorf("CSV file is empty or does not have a header row")
	}
	headers := rows[0]
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var documents []interface{}
	for _, row := range rows[1:] {
		if len(row) != len(headers) {
			return fmt.Errorf("row length does not match header length: %v", row)
		}
		document := bson.M{}
		var userId string
		for i, value := range row {
			if headers[i] == "credits" || headers[i] == "gpa" {
				credits, convErr := strconv.ParseFloat(value, 64)
				if convErr != nil {
					return fmt.Errorf("failed to convert 'credits' to a number: %v", convErr)
				}
				document[headers[i]] = credits
			} else if headers[i] == "classes" && value != "" {
				var grades = make(map[string]string)
				classes := strings.Split(value, ";")
				for _, class := range classes {
					temp := strings.Split(class, ":")
					grades[temp[0]] = temp[1]
				}
				document[headers[i]] = grades
			} else if headers[i] == "timesheet" {
				var temp []map[string]interface{}
				document[headers[i]] = temp
			} else if headers[i] == "current" {
				var temp []map[string]string
				document[headers[i]] = temp
			} else if headers[i] == "enrollment" || headers[i] == "housing" {
				parts := strings.Split(value, "/")
				month, err := strconv.Atoi(parts[0])
				if err != nil {
					return fmt.Errorf("error parsing month: %v", err)
				}
				day, err := strconv.Atoi(parts[1])
				if err != nil {
					return fmt.Errorf("error parsing day: %v", err)
				}
				year, err := strconv.Atoi(parts[2])
				if err != nil {
					return fmt.Errorf("error parsing year: %v", err)
				}
				timeParts := strings.Split(parts[3], ":")
				hour, err := strconv.Atoi(timeParts[0])
				if err != nil {
					return fmt.Errorf("error parsing hour %v", err)
				}
				minute, err := strconv.Atoi(timeParts[1])
				if err != nil {
					return fmt.Errorf("error parsing minute: %v", err)
				}
				document[headers[i]] = time.Date(year, time.Month(month), day, hour, minute, 0, 0, time.UTC)
			} else {
				document[headers[i]] = value
				if headers[i] == "id" {
					userId = value
				}
			}
		}
		if userId != "" {
			folderPath := "./user_records/" + userId
			err := os.MkdirAll(folderPath, os.ModePerm)
			if err != nil {
				return fmt.Errorf("failed to create folder for user %s: %v", userId, err)
			}
		}
		documents = append(documents, document)
	}
	_, err = collection.InsertMany(ctx, documents)
	if err != nil {
		return fmt.Errorf("failed to insert documents: %v", err)
	}
	fmt.Printf("Successfully inserted %d rows into the 'users' collection.\n", len(documents))
	return nil
}

func convertTimeToDate(timeString string) (time.Time, error) {
	const layout = "15:04"
	parsedTime, err := time.Parse(layout, timeString)
	if err != nil {
		return time.Time{}, err
	}
	dateWithTime := time.Date(
		2003,
		time.January,
		30,
		parsedTime.Hour(),
		parsedTime.Minute(),
		0,
		0,
		time.Now().Location(),
	)
	return dateWithTime, nil
}

func deleteAllDocumentsInCollection(collectionName string) error {
	collection := dbClient.Database(dbName).Collection(collectionName)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	result, err := collection.DeleteMany(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to delete documents: %v", err)
	}
	fmt.Printf("Deleted %d documents from the '%s' collection.\n", result.DeletedCount, collectionName)
	return nil
}

func searchClasses(query string) ([]bson.M, error) {
	collection := dbClient.Database(dbName).Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"$or": []bson.M{
			{"course.class": bson.M{"$in": []string{query}}},
			{"course.class": bson.M{"$regex": "(?i)" + query}},
			{"course.code": query},
		},
		"size": bson.M{"$gt": 0},
	}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to search classes: %v", err)
	}
	defer cursor.Close(ctx)
	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("failed to decode results: %v", err)
	}
	return results, nil
}

func searchSBC(query string) ([]bson.M, error) {
	collection := dbClient.Database(dbName).Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"$or": []bson.M{
			{"course.sbc": bson.M{"$in": []string{query}}},
			{"course.sbc": bson.M{"$regex": "(?i)" + query}},
		},
		"size": bson.M{"$gt": 0},
	}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to search sbc: %v", err)
	}
	defer cursor.Close(ctx)
	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("failed to decode results: %v", err)
	}
	return results, nil
}

func updateTimesheet(timesheet []map[string]interface{}, id string) error {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{"id": id}
	update := bson.M{
		"$set": bson.M{"timesheet": timesheet},
	}
	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update timesheet for user with id %s: %v", id, err)
	}
	if result.MatchedCount == 0 {
		return fmt.Errorf("no user found with id %v", id)
	}
	if result.ModifiedCount == 0 {
		return fmt.Errorf("timesheet could not be added to %v", id)
	}
	return nil
}

func getTimesheet(id string) ([]bson.M, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var result struct {
		Timesheet []bson.M `bson:"timesheet"`
	}
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to fetch 'timesheet': %v", err)
	}
	return result.Timesheet, nil
}

func checkMajors(majors string, id string) (bool, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var userMap map[string]interface{}
	err := collection.FindOne(ctx, filter).Decode(&userMap)
	if err != nil {
		return false, err
	}
	return arraysShareCommonValue(strings.Split(majors, "/"), strings.Split(userMap["major"].(string), "/")), nil
}

func arraysShareCommonValue(arr1, arr2 []string) bool {
	valueMap := make(map[string]bool)
	for _, value := range arr1 {
		valueMap[value] = true
	}
	for _, value := range arr2 {
		if valueMap[value] {
			return true
		}
	}
	return false
}

func checkStanding(standing string, id string) (bool, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var userMap map[string]interface{}
	err := collection.FindOne(ctx, filter).Decode(&userMap)
	if err != nil {
		return false, err
	}
	index, err := strconv.Atoi(string(standing[1]))
	if err != nil {
		return false, err
	}
	standings := [3]int{23, 56, 84}
	return userMap["credits"].(float64) > float64(standings[index-1]), nil
}

func checkGrade(grade string, classes string, id string) (bool, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var userMap map[string]interface{}
	err := collection.FindOne(ctx, filter).Decode(&userMap)
	if err != nil {
		return false, err
	}
	userClasses := userMap["classes"].(map[string]interface{})
	grades := [11]string{"A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"}
	gradeSlice := grades[:]
	for _, req := range strings.Split(classes, "/") {
		if userClasses[strings.Replace(req, ",", " ", 1)] != nil && indexInArray(userClasses[strings.Replace(req, ",", " ", 1)].(string), gradeSlice) <= indexInArray(grade, gradeSlice) {
			return true, nil
		}
	}
	return false, nil
}

func indexInArray(target string, arr []string) int {
	for index, str := range arr {
		if str == target {
			return index
		}
	}
	return -1
}

func setCurrentNull(id string) error {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{"id": id}
	update := bson.M{
		"$set": bson.M{
			"current": nil,
		},
	}
	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil || result.MatchedCount == 0 {
		return fmt.Errorf("failed to set current null")
	}
	return nil
}

func updateCart(classes []string, id string) error {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err := setCurrentNull(id)
	if err != nil {
		return err
	}
	var failed []string
	for _, clas := range classes {
		course := strings.Split(clas, " ")[0]
		code := strings.Split(strings.Split(clas, " ")[1], "-")[0]
		section := strings.Split(strings.Split(clas, " ")[1], "-")[1]
		err := updateClassSize(course, code, section)
		if err != nil {
			failed = append(failed, clas)
			continue
		}
		temp, err := searchClass(course, code, section)
		if err != nil {
			failed = append(failed, clas)
			continue
		}
		filter := bson.M{"id": id}
		var existingUser bson.M
		err = collection.FindOne(ctx, filter).Decode(&existingUser)
		if err != nil {
			failed = append(failed, clas)
			continue
		}
		current := existingUser["current"]
		var update bson.M
		if current == nil {
			update = bson.M{
				"$set": bson.M{
					"current": []interface{}{temp},
				},
			}
		} else {
			update = bson.M{
				"$push": bson.M{
					"current": temp,
				},
			}
		}
		result, err := collection.UpdateOne(ctx, filter, update)
		if err != nil || result.MatchedCount == 0 || result.ModifiedCount == 0 {
			failed = append(failed, clas)
		}
	}
	if len(failed) > 0 {
		return fmt.Errorf("failed to add class(es): %v", strings.Join(failed, ", "))
	}
	return nil
}

func updateClassSize(course string, code string, section string) error {
	collection := dbClient.Database(dbName).Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"course.class": strings.Split(course, "/"),
		"course.code":  code,
		"section":      section,
		"size":         bson.M{"$gt": 0},
	}
	update := bson.M{
		"$inc": bson.M{
			"size": -1,
		},
	}
	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("failed to update class size: %v", err)
	}
	if result.MatchedCount == 0 {
		return fmt.Errorf("class size is already at 0 or the class does not exist")
	}
	return nil
}

func searchClass(course string, code string, section string) (bson.M, error) {
	collection := dbClient.Database(dbName).Collection("classes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"course.class": strings.Split(course, "/"),
		"course.code":  code,
		"section":      section,
	}
	var result bson.M
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("class not found")
		}
		return nil, fmt.Errorf("failed to search class: %v", err)
	}
	return result, nil
}

func getCurrent(id string) ([]bson.M, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var result struct {
		Current []bson.M `bson:"current"`
	}
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to fetch 'current': %v", err)
	}
	return result.Current, nil
}

func getClasses(id string) (map[string]string, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var result struct {
		Classes map[string]string `bson:"classes"`
	}
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to fetch 'current': %v", err)
	}
	return result.Classes, nil
}

func getGPA(id string) (float64, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var result struct {
		Gpa float64 `bson:"gpa"`
	}
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return 0, fmt.Errorf("user not found")
		}
		return 0, fmt.Errorf("failed to fetch 'current': %v", err)
	}
	return result.Gpa, nil
}

func getEnrollmentDate(id string) (time.Time, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var result struct {
		Enrollment time.Time `bson:"enrollment"`
	}
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return time.Time{}, fmt.Errorf("user not found")
		}
		return time.Time{}, fmt.Errorf("failed to fetch 'enrollment': %v", err)
	}
	return result.Enrollment, nil
}

func getHousingDate(id string) (time.Time, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var result struct {
		Housing time.Time `bson:"housing"`
	}
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return time.Time{}, fmt.Errorf("user not found")
		}
		return time.Time{}, fmt.Errorf("failed to fetch 'housing': %v", err)
	}
	return result.Housing, nil
}

func checkLogin(id string, pass string) (bool, error) {
	collection := dbClient.Database(dbName).Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	filter := bson.M{
		"id": id,
	}
	var result struct {
		Passhash string `bson:"passHash"`
	}
	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		return false, errNoUser
	}
	err = bcrypt.CompareHashAndPassword([]byte(result.Passhash), []byte(pass))
	return err == nil, err
}
