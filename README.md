# Nxt Round - Interview Preparation Platform

[![Nxt Round](https://img.shields.io/badge/Nxt%20Round-Interview%20Prep-blue)](https://nxtround.tech)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0.0-green)](https://www.mongodb.com/)

A comprehensive interview preparation platform where job seekers can share real interview experiences, get company-specific questions, and access expert answers and insider tips.

## 🌟 Features

### Core Functionality
- **Question & Answer System**: Share and discover interview questions by company and category
- **Company Profiles**: Browse companies and their interview questions
- **Real-time Collaboration**: Live updates with Socket.io for dynamic interactions
- **User Authentication**: Secure login/register with Google OAuth support
- **Admin Panel**: Comprehensive admin interface for platform management
- **Search & Filter**: Advanced search capabilities across questions and companies

### User Experience
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Real-time Notifications**: Instant updates for new answers and comments
- **Voting System**: Upvote/downvote questions and answers
- **Comment System**: Engage in discussions on questions and answers
- **Profile Management**: User profiles with activity history

### Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **RESTful API**: Well-structured Express.js backend
- **MongoDB**: Scalable NoSQL database with Mongoose ODM
- **File Upload**: Image upload support with Cloudinary
- **Email Integration**: Automated email notifications
- **Security**: JWT authentication, bcrypt password hashing

## 🚀 Live Demo

Visit the live application: [https://nxtround.tech](https://nxtround.tech)

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **Passport.js** - Authentication middleware
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud image management
- **Nodemailer** - Email service

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
Nxt_Round/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── companies/     # Company-related components
│   │   ├── layout/        # Layout components (Navbar, Footer)
│   │   └── questions/     # Question-related components
│   ├── context/           # React context providers
│   ├── pages/             # Page components
│   ├── utils/             # Utility functions
│   └── config.ts          # Configuration
├── server/                # Backend Node.js application
│   ├── config/            # Database and service configurations
│   ├── middleware/        # Express middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route handlers
│   ├── scripts/           # Utility scripts
│   └── utils/             # Backend utilities
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nxt-round.git
   cd nxt-round
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Setup**
   
   Create `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # CORS
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - User logout

### Questions Endpoints
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get specific question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/questions/top-voted` - Get top voted questions

### Companies Endpoints
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create new company
- `GET /api/companies/:id` - Get specific company
- `PUT /api/companies/:id` - Update company

### Answers & Comments
- `GET /api/answers` - Get answers for a question
- `POST /api/answers` - Create new answer
- `GET /api/comments` - Get comments
- `POST /api/comments` - Create new comment

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Configure build command: `npm install`
4. Configure start command: `npm start`

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CORS_ORIGIN=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code linting
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Socket.io](https://socket.io/) - Real-time communication
- [Cloudinary](https://cloudinary.com/) - Image management

## 📞 Support

- **Website**: [https://nxtround.tech](https://nxtround.tech)
---
