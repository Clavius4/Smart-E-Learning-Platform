# � Smart E-Learning Platform

Complete e-learning platform with Docker.

## � Quick Start

```bash
# Clone and run
git clone <your-repo>
cd smart-learning
docker-compose up --build
```

## 🌐 Access
- **Backend**: http://localhost:5000
- **Admin**: http://localhost:3000  
- **Instructor**: http://localhost:5173
- **Student Frontend**: http://localhost:5174

## 📝 Commands

```bash
docker-compose up --build    # Start all
docker-compose down          # Stop all
docker-compose logs -f       # View logs
```

## 🔧 Prerequisites
- Docker Desktop
- Internet connection (for MongoDB Atlas)

## 🐛 Troubleshooting

**Port in use:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Service issues:**
```bash
docker-compose logs backend
docker-compose down -v
docker-compose up --build
```

### Student Frontend (Port 5174)
- **Technology**: Vue.js + Vite + JavaScript  
- **Features**: Student course enrollment, learning interface
- **Hot Reload**: ✅ Enabled for development

**Environment:** Backend loads `.env` from `smart-elearning-backend/.env`