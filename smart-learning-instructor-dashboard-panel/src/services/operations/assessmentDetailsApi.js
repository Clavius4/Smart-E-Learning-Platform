// assessmentDetailsApi.js
import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { assessmentEndpoints } from "../apis";

const {
  CREATE_ASSESSMENT,
  GET_ALL_ASSESSMENTS,
  GET_ALL_ASSESSMENTS_LEVEL,
  UPDATE_ASSESSMENT,
  DELETE_ASSESSMENT,
  SUBMIT_ASSESSMENT,
} = assessmentEndpoints;

// Create Assessment
export const createAssessment = async (token, data = {}) => {
  console.log("Token passed to createAssessment:", token);
  const toastId = toast.loading("Creating assessment...");
  let result = null;

  try {
    const response = await apiConnector(
      "POST",
      CREATE_ASSESSMENT,
      data,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) throw new Error("Could not create assessment");

    toast.success("Assessment created successfully");
    result = response.data.data;
  } catch (error) {
    toast.error(error.message || "Failed to create assessment");
    console.error("CREATE ASSESSMENT ERROR:", error);
  }

  toast.dismiss(toastId);
  return result;
};

// Get All Assessments by Instructor
export const getAllAssessmentsByInstructor = async (token) => {
  const toastId = toast.loading("Loading assessments...");
  let result = [];

  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_ASSESSMENTS,
      undefined,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) throw new Error("Could not fetch assessments");

    result = response.data.data;
  } catch (error) {
    toast.error(error.message || "Failed to load assessments");
    console.error("GET ALL ASSESSMENTS ERROR:", error);
  }

  toast.dismiss(toastId);
  return result;
};

// Get Assessment By Level (Student)
export const getAssessmentByLevel = async (level, token) => {
  
  const toastId = toast.loading("Fetching assessment...");
  let result = null;

  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_ASSESSMENTS_LEVEL.replace(":level", level),
      undefined,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) throw new Error("Could not fetch assessment for level");

    result = response.data.data;
  } catch (error) {
    toast.error(error.message || "Failed to fetch assessment");
    console.error("GET ASSESSMENT BY LEVEL ERROR:", error);
  }

  toast.dismiss(toastId);
  return result;
};

// Update Assessment
export const updateAssessment = async (assessmentId, token, data) => {
  const toastId = toast.loading("Updating assessment...");
  let result = null;

  try {
    const response = await apiConnector(
      "POST",
      UPDATE_ASSESSMENT.replace(":assessmentId", assessmentId),
      data,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) throw new Error("Could not update assessment");

    toast.success("Assessment updated successfully");
    result = response.data.data;
  } catch (error) {
    toast.error(error.message || "Failed to update assessment");
    console.error("UPDATE ASSESSMENT ERROR:", error);
  }

  toast.dismiss(toastId);
  return result;
};

// Delete Assessment
export const deleteAssessment = async (assessmentId, token) => {
  const toastId = toast.loading("Deleting assessment...");

  try {
    const response = await apiConnector(
      "POST",
      DELETE_ASSESSMENT.replace(":assessmentId", assessmentId),
      undefined,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) throw new Error("Could not delete assessment");

    toast.success("Assessment deleted successfully");
  } catch (error) {
    toast.error(error.message || "Failed to delete assessment");
    console.error("DELETE ASSESSMENT ERROR:", error);
  }

  toast.dismiss(toastId);
};

// Submit Assessment (Student)
export const submitAssessment = async (assessmentId, submissionData, token) => {
  const toastId = toast.loading("Submitting assessment...");
  let result = null;

  try {
    const response = await apiConnector(
      "POST",
      SUBMIT_ASSESSMENT.replace(":assessmentId", assessmentId),
      submissionData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) throw new Error("Could not submit assessment");

    toast.success("Assessment submitted successfully");
    result = response.data.data;
  } catch (error) {
    toast.error(error.message || "Failed to submit assessment");
    console.error("SUBMIT ASSESSMENT ERROR:", error);
  }

  toast.dismiss(toastId);
  return result;
};
