import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL, reportEndpoints } from "../../../services/apis";
import Loader from "../../common/Loader";

export default function Report() {
  const [courseReports, setCourseReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(reportEndpoints.INSTRUCTOR_DASHBOARD, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourseReports(response.data.data || []);
      } catch (err) {
        console.error("Error fetching course reports:", err);
        setError("Failed to load course reports");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchReports();
    else {
      setError("No authentication token found");
      setLoading(false);
    }
  }, [token]);

  const handleGeneratePDF = async () => {
    setExporting(true);
    try {
      const response = await axios.get(reportEndpoints.INSTRUCTOR_PDF, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
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
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-pink-200 text-center p-6">{error}</p>;

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-50 to-yellow-200 bg-clip-text text-transparent">
          Course Reports
        </h1>
        <button
          onClick={handleGeneratePDF}
          disabled={exporting}
          className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {exporting ? (
            <>
              <span className="animate-spin">⚡</span> Generating...
            </>
          ) : (
            "📄 Generate PDF Report"
          )}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-richblack-700 bg-richblack-800 shadow-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-richblack-700 text-richblack-200 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Course Name</th>
              <th className="px-6 py-4">Total Students</th>
              <th className="px-6 py-4">Completion Rate (%)</th>
              <th className="px-6 py-4">Avg Quiz Score</th>
              <th className="px-6 py-4">Avg Time Spent (Min)</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-richblack-700">
            {courseReports.map((course, index) => (
              <tr
                key={index}
                className="hover:bg-richblack-700 transition-colors group"
              >
                <td className="px-6 py-4 font-medium text-richblack-5">
                  {course.courseName}
                </td>
                <td className="px-6 py-4">{course.totalStudents}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span>{course.completionRate}%</span>
                    <div className="w-16 h-1.5 bg-richblack-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${course.completionRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{course.avgQuizScore}%</td>
                <td className="px-6 py-4">{course.avgTimeSpent}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      course.status === "Advanced"
                        ? "bg-purple-500/20 text-purple-200"
                        : course.status === "Intermediate"
                        ? "bg-blue-500/20 text-blue-200"
                        : "bg-green-500/20 text-green-200"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
              </tr>
            ))}
            {courseReports.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-richblack-400">
                  No course data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}