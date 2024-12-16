package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	dbClient *mongo.Client
	dbName   = "polarDB"
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

	err = parseCSVAndInsertIntoClasses("classes.csv")
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
					return fmt.Errorf("failed to covnert 'credits' to a number: %v", convErr)
				}
				document[headers[i]] = credits
			} else if headers[i] == "class" {
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
	fmt.Printf("Successfully inserted %d rows into the '%s' collection.\n", len(documents), "courses")
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
			document["courseId"] = course["_id"]
		}
		for i, value := range row {
			if i > 1 {
				document[headers[i]] = value
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

func getAllDocuments(collectionName string, w http.ResponseWriter) {
	collection := dbClient.Database("polar").Collection(collectionName)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch documents", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		http.Error(w, "Failed to parse documents", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func addDocument(collectionName string, w http.ResponseWriter, r *http.Request) {
	collection := dbClient.Database("polar").Collection(collectionName)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var document map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&document); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	document["_id"] = primitive.NewObjectID()
	res, err := collection.InsertOne(ctx, document)
	if err != nil {
		http.Error(w, "Failed to insert document", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func deleteDocument(collectionName string, w http.ResponseWriter, r *http.Request) {
	collection := dbClient.Database("polar").Collection(collectionName)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "ID parameter is required", http.StatusBadRequest)
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	_, err = collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		http.Error(w, "Failed to delete document", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Document deleted successfully"))
}
