const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart E-learning Platform API",
      version: "2.0.0",
      description: `
# Smart E-learning Platform API Documentation

Complete API documentation for the Smart E-learning platform with hearing impairment support.

## Features
- 👨‍🎓 Student Management (Authentication, Profiles, Progress)
- 👨‍🏫 Instructor Management (Courses, Quizzes, Reports)
- 👨‍💼 Admin Dashboard (Platform Overview, User Management)
- 📊 Comprehensive Reporting System
- 📈 Analytics & Exports (PDF, Excel, CSV)
- 🎯 Gamification & Badges
- 📹 Video Progress Tracking
- 📝 Quiz & Assessment System

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\`Authorization: Bearer <your_jwt_token>\`

## Base URL
- Development: \`http://localhost:5000/api\`
- Production: \`https://your-domain.com/api\`

## Response Format
All responses follow this structure:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": { "fromCache": false, "generatedAt": "2024-01-01T00:00:00Z" }
}
\`\`\`
      `,
      contact: {
        name: "Smart Learning Support",
        email: "support@smartlearning.com",
        url: "https://smartlearning.com"
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server"
      },
      {
        url: "https://api.smartlearning.com/api",
        description: "Production server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token"
        }
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
            error: { type: "string", example: "Detailed error" }
          }
        },
        Student: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d21b4667d0d8992e610c85" },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            email: { type: "string", example: "john@example.com" },
            learningStyle: { type: "string", enum: ["visual", "text", "literacy", "numeracy"] },
            difficultyPreference: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
            stars: { type: "number", example: 45 },
            onboardingComplete: { type: "boolean", example: true }
          }
        },
        CourseProgress: {
          type: "object",
          properties: {
            courseID: { type: "string" },
            completedVideos: { type: "array" },
            quizAttempts: { type: "array" },
            totalTimeSpent: { type: "number" },
            isCourseCompleted: { type: "boolean" }
          }
        },
        Badge: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            icon: { type: "string" },
            earnedAt: { type: "string", format: "date-time" },
            type: { type: "string" }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      { name: "Authentication", description: "Student authentication endpoints" },
      { name: "Student", description: "Student profile and progress" },
      { name: "Instructor", description: "Instructor management" },
      { name: "Admin", description: "Admin dashboard and management" },
      { name: "Courses", description: "Course management" },
      { name: "Quizzes", description: "Quiz creation and submission" },
      { name: "Assessments", description: "Level assessments" },
      { name: "Reports - Student", description: "Student progress reports" },
      { name: "Reports - Instructor", description: "Instructor analytics" },
      { name: "Reports - Admin", description: "Platform-wide analytics" },
      { name: "Exports", description: "Report export endpoints" },
      { name: "System", description: "System health and utilities" }
    ]
  },
  apis: [
    "./routes/*.js",
    "./routes/studentReport.js",
    "./routes/enhancedInstructorReport.js",
    "./routes/adminReport.js",
    "./routes/exportRoutes.js"
  ],
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  specs
};