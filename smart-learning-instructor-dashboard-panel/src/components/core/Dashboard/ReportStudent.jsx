import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { IoArrowBack, IoCheckmarkCircle, IoTime, IoFilter } from "react-icons/io5";
import { BASE_URL, reportEndpoints, courseEndpoints } from "../../../services/apis";
import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI";
import { fetchInstructorCourseProgress } from "../../../services/reportService";
import Loader from "../../common/Loader";

export default function ReportStudent() {
  const { token } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("analysis");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Analysis data
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  // Courses data
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseProgressData, setCourseProgressData] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Export loading
  const [exporting, setExporting] = useState({ pdf: false, excel: false });

  // Modal state – now stores the selected student with passed quizzes
  const [modalStudent, setModalStudent] = useState(null);

  // Helper: determine category from course name
  const getCourseCategory = (courseName) => {
    const lower = courseName.toLowerCase();
    if (lower.includes("math") || lower.includes("hesabu") || lower.includes("arithmetic") || lower.includes("namba") || lower.includes("count")) {
      return "Kuhesabu";
    }
    return "Kusoma";
  };

  // Fetch analysis data
  useEffect(() => {
    if (activeTab === "analysis" && reportData.length === 0 && !loadingReport) {
      setLoadingReport(true);
      axios.get(reportEndpoints.STUDENT_REPORT, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setReportData(res.data.report || []))
        .catch(err => console.error("Error fetching report:", err))
        .finally(() => setLoadingReport(false));
    }
  }, [activeTab, token, reportData.length, loadingReport]);

  // Fetch courses list
  useEffect(() => {
    if (activeTab === "courses" && courses.length === 0 && !loadingCourses) {
      setLoadingCourses(true);
      fetchInstructorCourses(token)
        .then(res => setCourses(res || []))
        .catch(err => console.error("Error fetching courses:", err))
        .finally(() => setLoadingCourses(false));
    }
  }, [activeTab, token, courses.length, loadingCourses]);

  // Fetch course progress when course selected
  useEffect(() => {
    if (selectedCourseId) {
      setLoadingProgress(true);
      fetchInstructorCourseProgress(selectedCourseId)
        .then(data => setCourseProgressData(data))
        .catch(err => console.error("Error fetching progress:", err))
        .finally(() => setLoadingProgress(false));
    } else {
      setCourseProgressData(null);
    }
  }, [selectedCourseId]);

  // Export handlers
  const handleDownload = async (type) => {
    setExporting(prev => ({ ...prev, [type]: true }));
    try {
      const endpoint = type === 'pdf' ? reportEndpoints.STUDENT_PDF : reportEndpoints.STUDENT_EXCEL;
      const extension = type === 'pdf' ? 'pdf' : 'xlsx';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Student_Report.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Error downloading ${type}:`, err);
    } finally {
      setExporting(prev => ({ ...prev, [type]: false }));
    }
  };

  // Render analysis tab
  const renderAnalysis = () => {
    if (loadingReport) return <Loader />;
    const filteredData = reportData.filter(student => {
      if (selectedCategory === "All") return true;
      return student.strugglingAreas?.includes(selectedCategory);
    });

    return (
      <>
        <div className="flex justify-end gap-4 mb-6">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={exporting.pdf}
            className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {exporting.pdf ? "⏳ Exporting PDF..." : "📄 Export PDF"}
          </button>
          <button
            onClick={() => handleDownload('excel')}
            disabled={exporting.excel}
            className="px-4 py-2 bg-caribbeangreen-200 text-richblack-900 font-semibold rounded-lg hover:bg-caribbeangreen-300 transition disabled:opacity-50"
          >
            {exporting.excel ? "⏳ Exporting Excel..." : "📊 Export Excel"}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-richblack-700 bg-richblack-800 shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-richblack-700 text-richblack-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Quiz Marks</th>
                <th className="px-6 py-4">Struggling Areas</th>
                <th className="px-6 py-4">Specific Challenges</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Recommendations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-700">
              {filteredData.length > 0 ? (
                filteredData.map((student, index) => (
                  <tr key={index} className="hover:bg-richblack-700 transition-colors">
                    <td className="px-6 py-4 font-medium text-richblack-5">{student.studentName}</td>
                    <td className="px-6 py-4">{student.level}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded ${
                        student.quizMarks >= 80 ? 'bg-caribbeangreen-200 text-caribbeangreen-900' :
                        student.quizMarks >= 50 ? 'bg-yellow-200 text-yellow-900' :
                        'bg-pink-200 text-pink-900'
                      }`}>
                        {student.quizMarks}%
                      </span>
                    </td>
                    <td className="px-6 py-4">{student.strugglingAreas?.join(", ") || "-"}</td>
                    <td className="px-6 py-4">{student.specificChallenges?.join(", ") || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'Good' ? 'bg-green-500/20 text-green-200' :
                        student.status === 'Average' ? 'bg-yellow-500/20 text-yellow-200' :
                        'bg-pink-500/20 text-pink-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <ul className="list-disc pl-4 space-y-1">
                        {student.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                      </ul>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-richblack-400">
                    No students found for category "{selectedCategory}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // Render courses tab
  const renderCourses = () => {
    if (!selectedCourseId) {
      if (loadingCourses) return <Loader />;
      const filteredCourses = courses.filter(course => {
        if (selectedCategory === "All") return true;
        return getCourseCategory(course.courseName) === selectedCategory;
      });

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <div
                key={course._id}
                onClick={() => setSelectedCourseId(course._id)}
                className="bg-gradient-to-br from-richblack-800 to-richblack-900 p-6 rounded-xl border border-richblack-700 hover:border-yellow-500 transition-all cursor-pointer group shadow-lg"
              >
                <h3 className="text-xl font-bold text-richblack-5 mb-2 group-hover:text-yellow-500">{course.courseName}</h3>
                <p className="text-richblack-300 text-sm mb-4 line-clamp-2">{course.courseDescription}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-richblack-400">{course.studentsEnrolled?.length || 0} Students</span>
                  <span className="bg-richblack-700 px-2 py-1 rounded-full text-xs uppercase text-richblack-200">
                    {course.level || "Beginner"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-richblack-400 col-span-3 text-center py-8">
              No courses found for category "{selectedCategory}".
            </p>
          )}
        </div>
      );
    }

    // Course detail view
    if (loadingProgress) return <Loader />;
    if (!courseProgressData) return <p className="text-pink-200 text-center">Failed to load data.</p>;

    return (
      <div>
        <button
          onClick={() => setSelectedCourseId(null)}
          className="flex items-center gap-2 text-yellow-500 mb-6 hover:underline"
        >
          <IoArrowBack /> Back to Courses
        </button>

        <h2 className="text-2xl font-bold text-richblack-5 mb-4">
          Progress: <span className="text-yellow-500">{courseProgressData.courseName}</span>
        </h2>

        <div className="overflow-x-auto rounded-xl border border-richblack-700 bg-richblack-800 shadow-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-richblack-700 text-richblack-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Current Level</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Last Accessed</th>
                <th className="px-6 py-4 text-center">Passed Quizzes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-700">
              {courseProgressData.students?.map((student) => (
                <tr
                  key={student.studentId}
                  onClick={() => setModalStudent(student)}
                  className="hover:bg-richblack-700 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-richblack-5">{student.name}</td>
                  <td className="px-6 py-4 text-richblack-300">{student.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-richblack-700 px-2 py-1 rounded-full text-xs">
                      {student.currentLevel || "Beginner"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-richblack-50">{student.percentage}%</span>
                      <div className="w-20 h-1.5 bg-richblack-600 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: `${student.percentage}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-richblack-300">
                    {student.lastAccessed ? new Date(student.lastAccessed).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-richblack-700 px-2 py-1 rounded-full text-xs">
                      {student.passedLevelQuiz?.length || 0}
                    </span>
                  </td>
                </tr>
              ))}
              {(!courseProgressData.students || courseProgressData.students.length === 0) && (
                <tr><td colSpan="6" className="text-center py-8 text-richblack-400">No students enrolled.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-50 to-yellow-200 bg-clip-text text-transparent">
          Student Reports & Progress
        </h1>

        <div className="flex items-center gap-2 bg-richblack-800 p-2 rounded-lg border border-richblack-700">
          <IoFilter className="text-yellow-500" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedCourseId(null);
            }}
            className="bg-transparent text-richblack-5 outline-none cursor-pointer font-semibold"
          >
            <option value="All">All Categories</option>
            <option value="Kusoma">Kusoma (Reading)</option>
            <option value="Kuhesabu">Kuhesabu (Math)</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-richblack-700 mb-6">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`pb-2 px-4 font-semibold transition-colors ${
            activeTab === "analysis"
              ? "text-yellow-500 border-b-2 border-yellow-500"
              : "text-richblack-400 hover:text-richblack-200"
          }`}
        >
          Performance Analysis
        </button>
        <button
          onClick={() => setActiveTab("courses")}
          className={`pb-2 px-4 font-semibold transition-colors ${
            activeTab === "courses"
              ? "text-yellow-500 border-b-2 border-yellow-500"
              : "text-richblack-400 hover:text-richblack-200"
          }`}
        >
          Course Progress
        </button>
      </div>

      {activeTab === "analysis" ? renderAnalysis() : renderCourses()}

      {/* Modal – shows passed quizzes */}
      {modalStudent && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
          <div className="w-11/12 max-w-lg bg-richblack-800 p-6 rounded-xl border border-richblack-700 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-richblack-5">{modalStudent.name}</h3>
                <p className="text-richblack-300 text-sm mt-1">
                  Level: {modalStudent.currentLevel || "Beginner"} | Progress: {modalStudent.percentage}%
                </p>
              </div>
              <button
                onClick={() => setModalStudent(null)}
                className="text-richblack-400 hover:text-white text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="border-t border-richblack-700 pt-4">
              <h4 className="flex items-center gap-2 text-yellow-500 font-bold mb-3">
                <IoCheckmarkCircle className="text-xl" /> Passed Quizzes
              </h4>
              {modalStudent.passedLevelQuiz && modalStudent.passedLevelQuiz.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {modalStudent.passedLevelQuiz.map((quiz, i) => (
                    <li key={i} className="text-sm bg-richblack-700 px-3 py-2 rounded border border-richblack-600">
                      {quiz.quizId?.title || `Quiz ${i+1}`} – {quiz.percentage}% (Passed at {new Date(quiz.passedAt).toLocaleDateString()})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-richblack-400 italic">No quizzes passed yet.</p>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setModalStudent(null)}
                className="px-4 py-2 bg-richblack-700 text-richblack-50 rounded hover:bg-richblack-600 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}