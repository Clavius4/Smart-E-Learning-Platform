import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../services/apis";

const mockStudentReports = ({ courseId }) => {
  const [studentReports, setStudentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        import { BASE_URL } from "../../../services/apis";

        // ... inside the component
        const res = await axios.get(
          `${BASE_URL}/api/course/instructor-course-progress/${courseId}`,
          // If you use token auth, uncomment below and comment the line above
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setStudentReports(res.data);
      } catch (err) {
        console.error("Error fetching student reports:", err);
        setError("Failed to fetch student reports.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchReports();
  }, [courseId]);

  if (loading) return <p>Loading student progress...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Student Progress Report</h2>
      {studentReports.length === 0 ? (
        <p>No student data found for this course.</p>
      ) : (
        studentReports.map((student, i) => (
          <div
            key={student._id || i}
            className="border rounded-xl p-4 shadow-sm bg-white"
          >
            <h3 className="text-lg font-semibold">
              {student.name}{" "}
              <span className="text-gray-500">({student.email})</span>
            </h3>
            <div className="mt-3 space-y-3">
              {student.enrolledCourses?.map((course, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded bg-gray-50 space-y-1"
                >
                  <p className="font-medium">📘 {course.courseName}</p>
                  <p>Progress: {course.progress}%</p>
                  <p>Average Score: {course.averageScore}%</p>
                  <p>
                    Last Active:{" "}
                    {new Date(course.lastActive).toLocaleDateString()}
                  </p>
                  {course.struggles?.length > 0 ? (
                    <p>
                      Struggles:{" "}
                      <span className="text-red-600">
                        {course.struggles.join(", ")}
                      </span>
                    </p>
                  ) : (
                    <p className="text-green-600">No struggles reported.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default mockStudentReports;
