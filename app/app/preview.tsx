import { View, Image, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "expo-router";
import { uploadImage } from "@/lib/api";
import { useState } from "react";
import { Submission } from "@/lib/types";

export default function PreviewScreen() {
  const { selectedImage, setSelectedImage, addSubmission } = useAppContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedImage) return null;

  const handleSubmit = async () => {
    if (!selectedImage) return;

    setIsSubmitting(true);
    try {
      const serverResponse = await uploadImage(selectedImage);
      // serverResponse matches your new SubmissionUploadResponse:
      // { id, status, extractedText, extractionSuccess, quality, processedAt, thumbnailUrl?, message?, approach? }

      const submission: Submission = {
        id: serverResponse.id,
        status: serverResponse.status === "error" ? "failed" : serverResponse.status,
        extractedText: serverResponse.extractedText ?? null,
        extractionSuccess: serverResponse.extractionSuccess,
        quality: serverResponse.quality ?? null,
        thumbnailUrl: serverResponse.thumbnailUrl ?? null,
        createdAt: serverResponse.processedAt,
        localImageUri: selectedImage,
      };

      addSubmission(submission);

      router.replace({
        pathname: "/results",
        params: {
          id: submission.id,
          status: submission.status,
          extractedText: submission.extractedText ?? "",
          extractionSuccess: String(serverResponse.extractionSuccess),
          quality: submission.quality ?? "",
          processedAt: submission.createdAt,
          thumbnailUrl: serverResponse.thumbnailUrl ?? "",
          localImageUri: selectedImage,
          // Optional debug params if your Results screen wants them:
          // approach: serverResponse.approach ?? "",
          // message: serverResponse.message ?? "",
        },
      });
    } catch (err) {
      console.error("Upload failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      Alert.alert("Upload Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="contain" />

      {!isSubmitting && (
        <View style={styles.buttonContainer}>
          <Button title="Retake" onPress={handleClose} color="white" />
          <Button title="Submit" onPress={handleSubmit} color="white" />
        </View>
      )}

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" },
  image: { flex: 1, width: "100%" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 0,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});