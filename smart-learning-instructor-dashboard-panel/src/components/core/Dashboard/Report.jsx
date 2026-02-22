import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../../services/apis";

export default function ReportDashboard() {
  const [courseReports, setCourseReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Get token at top level
  const { token } = useSelector((state) => state.auth);

  // Fetch course statistics
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/report/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCourseReports(response.data.data || []);
      } catch (err) {
        console.error("Error fetching course reports:", err);
        setError("Failed to load course reports");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReports();
    } else {
      setError("No authentication token found");
      setLoading(false);
    }
  }, [token]);

  // Generate PDF
  const handleGeneratePDF = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/report/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",

      });

      // Create blob and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "course_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to generate PDF", err);

    }
  };

  if (loading) return <p className="text-white p-6">Loading course reports...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Instructor Dashboard - Course Reports
      </h1>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-richblack-700 text-richblack-200">
            <tr>
              <th className="p-2">Course Name</th>
              <th className="p-2">Total Students</th>
              <th className="p-2">Completion Rate (%)</th>
              <th className="p-2">Avg Quiz Score</th>
              <th className="p-2">Avg Time Spent (Min)</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {courseReports.map((course, index) => (
              <tr key={index} className="border-b border-richblack-600">
                <td className="p-2">{course.courseName}</td>
                <td className="p-2">{course.totalStudents}</td>
                <td className="p-2">{course.completionRate}</td>
                <td className="p-2">{course.avgQuizScore}</td>
                <td className="p-2">{course.avgTimeSpent}</td>
                <td className="p-2">{course.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleGeneratePDF}
        className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-400"
      >
        Generate PDF Report
      </button>
    </div>
  );
}
