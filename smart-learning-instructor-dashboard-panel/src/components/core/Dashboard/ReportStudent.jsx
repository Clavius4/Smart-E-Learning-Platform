import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../../services/apis";

export default function ReportStudent() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/report/student`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReportData(response.data.report || []);
      } catch (err) {
        console.error("Error fetching student report:", err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReport();
    } else {
      setError("No authentication token found");
      setLoading(false);
    }
  }, [token]);

  const handleDownload = async (type) => {
    try {
      const endpoint = type === 'pdf' ? 'pdf' : 'excel';
      const extension = type === 'pdf' ? 'pdf' : 'xlsx';

      const response = await axios.get(
        `${BASE_URL}/api/report/student/${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Student_Report.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(`Error downloading ${type}:`, err);
      // You might want to show a toast or error message here
    }
  };

  if (loading) return <p className="p-4 text-white">Loading comprehensive student analysis...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 text-white bg-richblack-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-yellow-50">Student Performance Report</h2>
        <div className="flex gap-4">
          <button
            onClick={() => handleDownload('pdf')}
            className="px-4 py-2 bg-yellow-50 text-richblack-900 font-bold rounded hover:scale-95 transition-all"
          >
            Export PDF
          </button>
          <button
            onClick={() => handleDownload('excel')}
            className="px-4 py-2 bg-caribbeangreen-200 text-richblack-900 font-bold rounded hover:scale-95 transition-all"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-richblack-700">
        <table className="min-w-full text-sm text-left text-richblack-25">
          <thead className="bg-richblack-800 text-richblack-5 uppercase font-semibold">
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
            {reportData.map((student, index) => (
              <tr key={index} className="hover:bg-richblack-800 transition-colors">
                <td className="px-6 py-4 font-medium">{student.studentName}</td>
                <td className="px-6 py-4">{student.level}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded ${student.quizMarks >= 80 ? 'bg-caribbeangreen-200 text-caribbeangreen-900' :
                    student.quizMarks >= 50 ? 'bg-yellow-200 text-yellow-900' : 'bg-pink-200 text-pink-900'
                    }`}>
                    {student.quizMarks}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  {student.strugglingCourses && student.strugglingCourses.length > 0 ? (
                    student.strugglingCourses.map((item, i) => (
                      <div key={`${item.subject}-${item.course}-${i}`}>
                        {item.subject}: {item.course}
                      </div>
                    ))
                  ) : student.strugglingAreas && student.strugglingAreas.length > 0 ? (
                    student.strugglingAreas.join(", ")
                  ) : (
                    <span className="text-caribbeangreen-300">None detected</span>
                  )}
                </td>
                <td className="px-6 py-4 text-richblack-100 italic">
                  {student.specificChallengesDetailed && student.specificChallengesDetailed.length > 0 ? (
                    student.specificChallengesDetailed.map((item, i) => (
                      <div key={`${item.course}-${item.challenge}-${i}`}>
                        {item.course}: {item.challenge}
                      </div>
                    ))
                  ) : student.specificChallenges && student.specificChallenges.length > 0 ? (
                    student.specificChallenges.join(", ")
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${student.status === 'Good' ? 'text-caribbeangreen-300' :
                    student.status === 'Average' ? 'text-yellow-100' : 'text-pink-300'
                    }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs">
                  <ul className="list-disc pl-4 space-y-1">
                    {student.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-6 bg-richblack-800 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-richblack-5">Performance Summary</h3>
        <p className="text-richblack-100 leading-relaxed">
          The table above provides a detailed analysis of student performance based on recent quiz results and activity.
          Students with quiz marks below 80% have been flagged with specific struggling areas (Reading, Mathematics)
          and targeted challenges. Actionable recommendations are provided to help instructors intervene effectively.
          Overall status indicates the urgency of support needed.
        </p>
      </div>
    </div>
  );
}
