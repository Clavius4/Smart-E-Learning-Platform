import { useState } from "react";

export default function InstructorReportTable({ reportData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;

  const totalPages = Math.ceil(reportData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = reportData.slice(startIndex, startIndex + rowsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-richblack-5 border border-richblack-600">
        <thead className="bg-richblack-700 text-richblack-100 uppercase text-xs">
          <tr>
            <th className="px-4 py-2 border border-richblack-600">Course</th>
            <th className="px-4 py-2 border border-richblack-600">Total Students</th>
            <th className="px-4 py-2 border border-richblack-600">Avg. Progress</th>
            <th className="px-4 py-2 border border-richblack-600">Avg. Score</th>
            <th className="px-4 py-2 border border-richblack-600">Struggle Areas</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((course, index) => (
            <tr
              key={index}
              className={`${index % 2 === 0 ? "bg-richblack-800" : "bg-richblack-900"}`}
            >
              <td className="px-4 py-2 border border-richblack-600">{course.courseName}</td>
              <td className="px-4 py-2 border border-richblack-600">{course.totalStudents.toLocaleString()}</td>
              <td className="px-4 py-2 border border-richblack-600">{course.avgProgress}%</td>
              <td className="px-4 py-2 border border-richblack-600">{course.avgScore}</td>
              <td className="px-4 py-2 border border-richblack-600">{course.struggleAreas}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="flex items-center justify-end mt-1 gap-1 text-sm text-richblack-100">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
