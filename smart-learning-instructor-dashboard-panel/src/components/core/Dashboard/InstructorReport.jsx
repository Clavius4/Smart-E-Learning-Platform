import React, { useEffect, useState } from 'react';
//import { fetchInstructorCourseProgress } from '../services/reportService';
import { fetchInstructorCourseProgress } from '../../../services/reportService';

const InstructorReport = ({ courseId }) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getReport = async () => {
      try {
        const data = await fetchInstructorCourseProgress(courseId);
        setReportData(data.students); // adjust based on API structure
      } catch (err) {
        console.error("Failed to fetch course progress:", err);
      } finally {
        setLoading(false);
      }
    };

    getReport();
  }, [courseId]);

  if (loading) return <p>Loading report... here</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Student Progress Report</h2>
      <ul className="space-y-4">
        {reportData.map((student) => (
          <li key={student.id} className="border p-4 rounded">
            <h3 className="font-bold">{student.name} ({student.email})</h3>
            {student.enrolledCourses.map((course, i) => (
              <div key={i} className="ml-4 mt-2">
                <p><strong>Course:</strong> {course.courseName}</p>
                <p><strong>Progress:</strong> {course.progress}%</p>
                <p><strong>Average Score:</strong> {course.averageScore}%</p>
                <p><strong>Last Active:</strong> {course.lastActive}</p>
                {course.struggles.length > 0 ? (
                  <p><strong>Struggles:</strong> {course.struggles.join(', ')}</p>
                ) : (
                  <p><strong>Struggles:</strong> None</p>
                )}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstructorReport;
