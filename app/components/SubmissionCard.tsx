import React from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Submission } from "@/lib/types";
import { QRStatusIndicator } from "./QRStatusIndicator"; // You might later rename this to StatusIndicator
import { BASE_URL } from "@/constants";

export const SubmissionCard = ({ submission }: { submission: Submission }) => {
  const imageUri = submission.thumbnailUrl
    ? `${BASE_URL}/uploads/${submission.thumbnailUrl}`
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {submission.status === "pending" ? (
          <ActivityIndicator />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]} />
        )}
      </View>

      <View style={styles.infoContainer}>
        {/* Replace QR code display with extracted text */}
        <Text style={styles.textLabel}>
          Extracted Text:{" "}
          <Text style={styles.textValue}>
            {submission.extractedText || "N/A"}
          </Text>
        </Text>

        <Text style={styles.detailText}>
          Quality: {submission.quality || "..."}
        </Text>

        <Text style={styles.dateText}>
          {new Date(submission.createdAt).toLocaleString()}
        </Text>
      </View>

      <QRStatusIndicator status={submission.status} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    backgroundColor: "white",
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  textLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  textValue: {
    fontWeight: "400",
    color: "#333",
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
});