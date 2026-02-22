// import { useState } from "react"
// import { Chart, registerables } from "chart.js"
// import { Pie } from "react-chartjs-2"

// Chart.register(...registerables)

// export default function InstructorChart({ courses }) {
//   // State to keep track of the currently selected chart
//   const [currChart, setCurrChart] = useState("students")

//   // Function to generate random colors for the chart
//   const generateRandomColors = (numColors) => {
//     const colors = []
//     for (let i = 0; i < numColors; i++) {
//       const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
//         Math.random() * 256
//       )}, ${Math.floor(Math.random() * 256)})`
//       colors.push(color)
//     }
//     return colors
//   }

//   // Data for the chart displaying student information
//   const chartDataStudents = {
//     labels: courses.map((course) => course.courseName),
//     datasets: [
//       {
//         data: courses.map((course) => course.totalStudentsEnrolled),
//         backgroundColor: generateRandomColors(courses.length),
//       },
//     ],
//   }

//   // Data for the chart displaying income information
//   const chartIncomeData = {
//     labels: courses.map((course) => course.courseName),
//     datasets: [
//       {
//         data: courses.map((course) => course.totalAmountGenerated),
//         backgroundColor: generateRandomColors(courses.length),
//       },
//     ],
//   }

//   // Options for the chart
//   const options = {
//     maintainAspectRatio: false,
//   }

//  return (
//   <div className="flex flex-1 flex-col gap-y-4 rounded-md bg-richblack-800 p-6">
//     <p className="text-lg font-bold text-richblack-5">Visualize of instructors</p>

//     <div className="space-x-4 font-semibold">
//       <button
//         onClick={() => setCurrChart("students")}
//         className={`rounded-sm p-1 px-3 transition-all duration-200 ${
//           currChart === "students" ? "bg-richblack-700 text-yellow-50" : "text-yellow-400"
//         }`}
//       >
//         Students
//       </button>
//       <button
//         onClick={() => setCurrChart("income")}
//         className={`rounded-sm p-1 px-3 transition-all duration-200 ${
//           currChart === "income" ? "bg-richblack-700 text-yellow-50" : "text-yellow-400"
//         }`}
//       >
//         Progress
//       </button>
//     </div>

//     <div className="relative w-full h-[100px] sm:h-[150px] md:h-[400px] lg:h-[250px]">
//       <Pie
//         data={currChart === "students" ? chartDataStudents : chartIncomeData}
//         options={{
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               position: "bottom",
//             },
//           },
//         }}
//       />
//     </div>
    
//   </div>
// )

// }







import { useState } from "react";
import { Chart, registerables } from "chart.js";
import { Pie } from "react-chartjs-2";
import InstructorReportTable from "./InstructorReportTable";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
// import jsPDF from "jspdf";
// import "jspdf-autotable";


Chart.register(...registerables);

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students");

  const generateRandomColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`;
      colors.push(color);
    }
    return colors;
  };

  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: generateRandomColors(courses.length),
      },
    ],
  };

  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: generateRandomColors(courses.length),
      },
    ],
  };

  const mockReportData = [
    {
      courseName: "Reading Basics",
      totalStudents: 1203,
      avgProgress: 64,
      avgScore: 71,
      struggleAreas: "Vocabulary, Phonics",
    },
    {
      courseName: "Numbers & Math",
      totalStudents: 980,
      avgProgress: 59,
      avgScore: 65,
      struggleAreas: "Subtraction",
    },
    {
      courseName: "Reading Basics",
      totalStudents: 1203,
      avgProgress: 64,
      avgScore: 71,
      struggleAreas: "Vocabulary, Phonics",
    },
    {
      courseName: "Numbers & english",
      totalStudents: 980,
      avgProgress: 59,
      avgScore: 65,
      struggleAreas: "Subtraction",
    },
  ];

  // Optional dynamic summary
  const averageScore = Math.round(
    mockReportData.reduce((acc, cur) => acc + cur.avgQuizScore, 0) /
      mockReportData.length
  );

  const averageProgress = Math.round(
    mockReportData.reduce((acc, cur) => acc + parseInt(cur.completionRate), 0) /
      mockReportData.length
  );

  const commonDropOff = mockReportData
    .map((item) => item.progressDropOff)
    .sort(
      (a, b) =>
        mockReportData.filter((x) => x.progressDropOff === b).length -
        mockReportData.filter((x) => x.progressDropOff === a).length
    )[0];

 const downloadCSV = () => {
  const headers = [
    "Course Name",
    "Total Students",
    "Avg Progress",
    "Avg Score",
    "Struggle Areas",
  ];

  const rows = mockReportData.map(row => [
    row.courseName,
    row.totalStudents,
    row.avgProgress,
    row.avgScore,
    `"${row.struggleAreas}"`, // quotes in case of commas
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  saveAs(blob, "course_report.csv");
};

const downloadPDF = () => {
  try {
    const doc = new jsPDF();
    doc.text("Course Performance Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["Course Name", "Total Students", "Avg Progress", "Avg Score", "Struggle Areas"]],
      body: mockReportData.map(row => [
        row.courseName,
        row.totalStudents,
        row.avgProgress,
        row.avgScore,
        row.struggleAreas,
      ]),
    });
    doc.save("course_report.pdf");
  } catch (err) {
    console.error("PDF generation failed:", err);
  }
};



  return (
    <div className="flex flex-1 flex-col gap-y-4 rounded-md bg-richblack-800 p-6">
      <p className="text-lg font-bold text-richblack-5">
        Visualize of instructors
      </p>

      {/* Toggle Buttons */}
      <div className="space-x-4 font-semibold">
        <button
          onClick={() => setCurrChart("students")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "students"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setCurrChart("income")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "income"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Progress
        </button>
        <button
          onClick={() => setCurrChart("report")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "report"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Report
        </button>
      </div>

      {/* Chart / Report */}
      <div className="relative w-full">
        {(currChart === "students" || currChart === "income") && (
          <div className="h-[100px] sm:h-[150px] md:h-[400px] lg:h-[250px]">
            <Pie
              data={
                currChart === "students"
                  ? chartDataStudents
                  : chartIncomeData
              }
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        )}

        {currChart === "report" && (
          <div className="bg-richblack-800 p-6 rounded-md">
            <h2 className="text-xl font-bold text-richblack-5 mb-4">
              Course Performance Report
            </h2>

            {/* Download Buttons */}
            <div className="flex gap-4 pb-4">
              <button
                onClick={downloadCSV}
                className="rounded bg-yellow-400 px-4 py-2 text-black font-semibold hover:bg-yellow-300 transition"
              >
                Download CSV
              </button>

              <button
                onClick={downloadPDF}
                className="rounded bg-yellow-400 px-4 py-2 text-black font-semibold hover:bg-yellow-300 transition"
              >
                Download PDF
              </button>
            </div>

            {/* Summary Insights */}
            {/* <div className="bg-richblack-700 p-4 rounded-md mb-6 text-richblack-5">
              <h3 className="text-lg font-semibold mb-2">Overall Summary</h3>
              <ul className="space-y-1">
                <li>📊 <strong>Average Progress:</strong> {averageProgress}%</li>
                <li>🎯 <strong>Average Score:</strong> {averageScore}%</li>
                <li>⚠️ <strong>Common Struggles:</strong> {commonDropOff}</li>
              </ul>
            </div> */}

            {/* Report Table */}
            <InstructorReportTable reportData={mockReportData} />
          </div>
        )}
      </div>
    </div>
  );
}
