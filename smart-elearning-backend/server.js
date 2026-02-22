const express = require('express');
const app = express();
const path = require('path');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');

// DB and Cloudinary
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');
const { swaggerUi, specs } = require('./swagger');

// Routes
const StudentRoutes = require('./routes/StudentRoutes.js');
const InstructorRoutes = require('./routes/InstructorRoutes.js');
const adminRoutes = require('./routes/admin.js');
const profileRoutes = require('./routes/profile');
const courseRoutes = require('./routes/course');
const quizRoutes = require('./routes/quiz');
const AssessmentRote = require('./routes/assessmentRoutes.js');
const reportRoute = require('./routes/reportRoutes.js');
const studentReportRoutes = require('./routes/studentReport');
const enhancedInstructorReportRoutes = require('./routes/enhancedInstructorReport');
const adminReportRoutes = require('./routes/adminReport');
const exportRoutes = require('./routes/exportRoutes');

app.use(express.json());
app.use(cookieParser());

// Define allowed origins explicitly
const allowedOrigins = [
  'http://206.189.112.134:5173',
  'http://206.189.112.134:5174',
  'http://206.189.112.134:5175',
  'http://206.189.112.134:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://smartmtn.ac.tz'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'Authorization',
    'X-CSRF-Token',
    'Content-Disposition'
  ],
  optionsSuccessStatus: 204,
  maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Debugging middleware
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Origin:', req.headers.origin);
  next();
});

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  limits: {
    fileSize: process.env.MAX_VIDEO_SIZE || 524288000 // 500MB default
  },
  abortOnLimit: false,
  uploadTimeout: 900000 // 15 minutes
}));

// Create tmp directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'tmp'))) {
  fs.mkdirSync(path.join(__dirname, 'tmp'), { recursive: true });
}

// API Documentation with custom theme
const swaggerCustomOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .scheme-container { margin: 0; padding: 15px; background: #f8f9fa; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .btn.authorize { background-color: #1f3b87; border-color: #1f3b87; }
    .swagger-ui .btn.authorize svg { fill: white; }
    /* Remove dark mode - force light theme */
    .swagger-ui { background-color: white; color: #3b4151; }
    .swagger-ui .opblock-tag { color: #1f3b87; }
    .swagger-ui .opblock .opblock-summary-path { color: #0a0a0a; }
  `,
  customSiteTitle: "Smart E-learning API Docs",
  customfavIcon: "https://smartlearning.com/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    syntaxHighlight: {
      activate: true,
      theme: 'agate'
    }
  }
};

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerCustomOptions));

// Mount Routes
app.use('/api', StudentRoutes);
app.use('/api', InstructorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assessments', AssessmentRote);
app.use('/api/report', reportRoute);
app.use('/api/report/student', studentReportRoutes);
app.use('/api/report/instructor', enhancedInstructorReportRoutes);
app.use('/api/report/admin', adminReportRoutes);
app.use('/api/export', exportRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cloudinary: 'configured'
    }
  });
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Smart Learning API</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #1f3b87; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .badge { background: #1f3b87; color: white; padding: 5px 10px; border-radius: 3px; }
        a { color: #1f3b87; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Smart Learning Platform API</h1>
        <div class="card">
          <h2>Environment: <span class="badge">${process.env.NODE_ENV || 'development'}</span></h2>
          <p>Server is running successfully!</p>
        </div>
        <div class="card">
          <h3>📚 Documentation</h3>
          <ul>
            <li><a href="/api-docs">Interactive API Documentation (Swagger UI)</a></li>
            <li><a href="/api/health">Health Check</a></li>
          </ul>
        </div>
        <div class="card">
          <h3>🔧 Available Routes</h3>
          <ul>
            <li><strong>Authentication:</strong> /api/auth/*</li>
            <li><strong>Students:</strong> /api/student/*</li>
            <li><strong>Instructors:</strong> /api/instructor/*</li>
            <li><strong>Admin:</strong> /api/admin/*</li>
            <li><strong>Courses:</strong> /api/course/*</li>
            <li><strong>Reports:</strong> /api/report/*</li>
            <li><strong>Exports:</strong> /api/export/*</li>
          </ul>
        </div>
        <div class="card">
          <h3>📊 Reporting System</h3>
          <ul>
            <li><strong>Student:</strong> My Progress, Badges, Course Details</li>
            <li><strong>Instructor:</strong> Enhanced Dashboard, Comparative Analytics, Question Analysis</li>
            <li><strong>Admin:</strong> Platform Overview, User Analytics, System Health</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    cloudinaryConnect();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server started on PORT ${PORT}`);
      console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
      console.log(`🛡️  CORS configured for: ${allowedOrigins.join(', ')}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;