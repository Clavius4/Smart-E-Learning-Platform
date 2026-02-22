# smart-elearning-backend

## 📚 Executive Summary

After thoroughly analyzing the codebase, this backend system powers the
Smart E-Learning Platform's core functionality, including RESTful APIs,
database models, user authentication, and comprehensive reporting
capabilities.

The architecture supports role-based access for students, instructors,
and administrators with personalized learning paths, gamification, and
detailed analytics.

This repository houses the **Node.js/Express-based backend** code that
manages server-side operations, handles content delivery to front-end
applications, and implements sophisticated reporting features for all
actors in the system.

------------------------------------------------------------------------

## 🚀 Key Features

-   👨‍🎓 Student Management (Authentication, profiles, progress tracking,
    gamification)
-   👨‍🏫 Instructor Tools (Course creation, quiz management, analytics)
-   👨‍💼 Admin Dashboard (User management, system monitoring)
-   📊 Comprehensive Reporting (PDF / Excel / CSV exports)
-   🎯 Personalized Learning Engine
-   🏆 Gamification System
-   📹 Video Progress Tracking

------------------------------------------------------------------------

# 🚀 Running Instructions

## Local Development

``` bash
# 1. Clone repository
git clone https://github.com/suleiman309/smart-learning-platform-docker.git
cd smart-learning-platform-docker

# 2. Navigate to backend
cd smart-elearning-backend

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env

# 5. Initialize database
node scripts/createAdmin.js
node scripts/init-reporting.js
node scripts/add-report-indexes.js

# 6. Start development server
npm run dev
```

**Access URLs** - Backend API: http://localhost:5000\
- Swagger Docs: http://localhost:5000/api-docs\
- Health Check: http://localhost:5000/api/health

------------------------------------------------------------------------

## Docker Deployment

``` bash
git clone https://github.com/suleiman309/smart-learning-platform-docker.git
cd smart-learning-platform-docker

cp .env.example .env

docker-compose up --build
# OR
docker-compose up -d --build
```

**Access URLs** - Backend API: http://localhost:5000 - Admin Dashboard:
http://localhost:3000 - Instructor Dashboard: http://localhost:5175 -
Student Frontend: http://localhost:5174

------------------------------------------------------------------------

## Production Deployment

``` bash
cp .env.production .env

docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

docker-compose exec backend node scripts/createAdmin.js
docker-compose exec backend node scripts/init-reporting.js
```

------------------------------------------------------------------------

# 🌐 Access URLs Summary

  ----------------------------------------------------------------------------------------------
Service                 Local                            Production
  ----------------------- -------------------------------- -------------------------------------
Backend API             http://localhost:5000            https://api.yourdomain.com

Swagger Docs            http://localhost:5000/api-docs   https://api.yourdomain.com/api-docs

Admin                   http://localhost:3000            https://admin.yourdomain.com

Instructor              http://localhost:5175            https://instructor.yourdomain.com

Student                 http://localhost:5174            https://app.yourdomain.com
----------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 🗄 MongoDB Configuration

## Local

    DATABASE_URL=mongodb://esmart_learning:esmart_learning@mongodb:27017/smart-elearning?authSource=admin

## Production (Atlas)

    DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart-elearning?retryWrites=true&w=majority

------------------------------------------------------------------------

# 🛠 Useful Docker Commands

``` bash
docker-compose ps
docker-compose logs backend
docker-compose exec backend npm test
docker-compose restart backend
docker stats
docker system prune -a
```

------------------------------------------------------------------------

# 🔧 Troubleshooting

``` bash
# Port in use
lsof -i :5000
kill -9 <PID>

# Reset everything
docker-compose down -v
docker system prune -a --volumes
npm install
docker-compose up --build
```

------------------------------------------------------------------------

# 📊 Reporting System Overview

## Student Reports

-   Personal progress dashboard
-   Badge showcase
-   Performance trends
-   Milestone prediction

## Instructor Reports

-   Course analytics
-   Comparative analytics
-   Question-level analysis
-   At-risk identification

## Admin Reports

-   Platform overview
-   User growth trends
-   Engagement analytics
-   System health monitoring

------------------------------------------------------------------------

# 📝 Environment Variables

``` env
PORT=5000
NODE_ENV=development

DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart-elearning

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret
```

------------------------------------------------------------------------

# 📁 Project Structure

    smart-elearning-backend/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── scripts/
    ├── services/
    ├── utils/
    ├── server.js
    ├── swagger.js
    └── package.json

------------------------------------------------------------------------

# 🔒 Authentication

Include JWT token in request header:

    Authorization: Bearer <your_token>

### Roles

-   Student
-   Instructor
-   Admin

------------------------------------------------------------------------

# 📚 API Documentation

Available at:

    /api-docs

------------------------------------------------------------------------

# 📈 Performance Optimization

-   Report caching (TTL)
-   Optimized indexes
-   Aggregation pipelines
-   Pagination
-   Background processing

------------------------------------------------------------------------

# 🤝 Contributing

``` bash
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

------------------------------------------------------------------------

# 📄 License

MIT License

------------------------------------------------------------------------

# 📞 Support

-   Email: support@smartlearning.com
-   Documentation: https://docs.smartlearning.com
-   Issues: GitHub Issues

------------------------------------------------------------------------

Built with ❤️ for inclusive education
