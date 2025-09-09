# 🚀 AdaptiLearn - AI-Powered Adaptive Learning Platform

A modern, intelligent learning platform that adapts lessons and quizzes to your progress and preferred learning style, helping you master topics faster.

## ✨ Features

### 🔐 Authentication System
- **User Registration & Login**: Secure sign-up and sign-in with JWT tokens
- **Profile Management**: User profiles with learning preferences
- **Session Management**: Persistent authentication with secure token storage

### 🧠 Adaptive Learning
- **Learning Style Detection**: Personalized content based on your learning preferences
- **Progress Tracking**: Monitor your learning journey across different subjects
- **Dynamic Content**: Content adapts based on your performance and style

### 🎨 Modern UI/UX
- **Beautiful Design**: Modern, responsive interface with gradient effects
- **Interactive Elements**: Spotlight effects and smooth animations
- **Mobile Responsive**: Works seamlessly across all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Shadcn/ui** components for consistent design

### Backend
- **Java 17** with Spring Boot 3.2.0
- **Spring Security** for authentication
- **Spring Data MongoDB** for data persistence
- **JWT** for stateless authentication
- **Maven** for dependency management

### Database
- **MongoDB Atlas** for cloud-hosted, scalable data storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Java 17+
- Maven 3.6+
- MongoDB Atlas account

### 1. MongoDB Atlas Setup
First, set up your MongoDB Atlas database:

1. **Create MongoDB Atlas Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose the FREE tier (M0)
3. **Set Up Database User**: Create a username and password
4. **Configure Network Access**: Allow access from your IP (or 0.0.0.0/0 for development)
5. **Get Connection String**: Copy your MongoDB Atlas connection string

📖 **Detailed Setup Guide**: See [MongoDB Atlas Setup Guide](backend/MONGODB_ATLAS_SETUP.md)

### 2. Environment Configuration

#### Frontend Setup
```bash
# Copy environment template
cp env.frontend .env

# Edit .env file with your backend URL
VITE_API_BASE_URL=http://localhost:8080/api
```

#### Backend Setup
```bash
cd backend

# Copy environment template
cp env.backend .env

# Edit .env file with your MongoDB Atlas connection string
MONGODB_ATLAS_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/adaptilearn?retryWrites=true&w=majority
```

### 3. Start the Application

#### Backend
```bash
cd backend

# Install dependencies
mvn clean install

# Start the application
mvn spring-boot:run
```

#### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
adapti-learn-genius/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── auth/                # Authentication components
│   │   ├── ui/                  # UI components
│   │   └── ...                  # Other components
│   ├── contexts/                # React contexts
│   ├── pages/                   # Page components
│   └── types/                   # TypeScript type definitions
├── backend/                      # Spring Boot backend
│   ├── src/main/java/           # Java source code
│   │   └── com/adaptilearn/
│   │       ├── config/          # Configuration classes
│   │       ├── controller/      # REST controllers
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── model/          # Entity models
│   │       ├── repository/     # Data access layer
│   │       ├── security/       # Security utilities
│   │       └── service/        # Business logic
│   ├── src/main/resources/     # Configuration files
│   ├── MONGODB_ATLAS_SETUP.md  # MongoDB Atlas setup guide
│   └── pom.xml                 # Maven configuration
├── env.frontend                 # Frontend environment template
└── README.md                    # This file
```

## 🔐 Authentication Flow

1. **Registration**: Users create accounts with username, email, and password
2. **Login**: Users authenticate with username/email and password
3. **JWT Token**: Secure token-based authentication for API requests
4. **Protected Routes**: Learning content requires authentication
5. **Session Persistence**: Tokens stored securely in localStorage

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/validate` - Token validation
- `GET /api/auth/health` - Health check

### Learning
- `GET /api/learn/levels` - Get learning levels
- `POST /api/learn/progress` - Update learning progress
- `GET /api/learn/style` - Get user learning style

## 🎯 Learning Features

### Learning Styles
- **Visual**: Diagrams, charts, and visual aids
- **Auditory**: Audio explanations and discussions
- **Reading**: Text-based content and written materials
- **Kinesthetic**: Interactive exercises and hands-on activities

### Adaptive Content
- Content adjusts based on your learning style
- Difficulty levels adapt to your progress
- Personalized recommendations and feedback

## 🔧 Development

### Frontend Development
```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Backend Development
```bash
cd backend

# Run with hot reload
mvn spring-boot:run

# Run tests
mvn test

# Build JAR
mvn clean package
```

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend
```bash
cd backend
mvn clean package
# Deploy the generated JAR file
```

### Database
- **MongoDB Atlas**: Your database is already cloud-hosted
- **Backup**: MongoDB Atlas provides automatic backups
- **Scaling**: Easily scale your database as needed

## 🔒 Security

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique passwords for database access
- Generate secure JWT secrets for production

### MongoDB Atlas Security
- Use IP whitelisting for production
- Enable MongoDB Atlas monitoring
- Set up alerts for unusual activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the README files in each directory
- **MongoDB Atlas Setup**: See [MongoDB Atlas Setup Guide](backend/MONGODB_ATLAS_SETUP.md)
- **Issues**: Create an issue in the repository
- **Email**: support@adaptilearn.com

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by adaptive learning principles
- Designed for optimal user experience
- Powered by MongoDB Atlas for reliable data storage

---

**Happy Learning! 🎓✨**
