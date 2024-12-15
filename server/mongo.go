package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var dbClient *mongo.Client

// Connect to MongoDB
func connectMongoDB() {
	var err error
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbClient, err = mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Test the connection
	err = dbClient.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Could not ping MongoDB: %v", err)
	}
	fmt.Println("Connected to MongoDB successfully!")
}

// Handler to get all documents in a collection
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

// Handler to add a document to a collection
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

// Handler to delete a document by ID
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
