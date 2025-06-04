
# Venue Finder Nigeria
VenueFindeNG is an event management solution, that addresses key challenges in the event management industry. The application focuses on solving major problems like complex registration processes, communication gaps between venue owners and prospective customers, scheduling conflicts, and feedback collection.

# Features
•	Easy Signup (
•	Search for venue availability (Location, capacity, price range, and date filters)
•	Calendar Sync
•	Direct Contact (Owners add phone/email/social handles for seamless booking)
•	Verified Listings (Community feedback ensures trust)
•	Safe Payment



# Tech Stack
Layer	Technology
Backend	Node.js (ESM), Express.js
Database	MySQL or PostgreSQL
ORM	Sequelize
Authentication	JWT + Role-based Authorization
Environment	dotenv for environment variables




# Project Structure

venuefinderNG-backend/
├── package.json	#
├── .env.example	# Environment variables
├── .gitignore		#
├── server.js		# Main server file
|──README.md	# README
├── config/
│   ├── database.js	# Database connection setup
│   └── jwt.js		#Authentication/validation
├── models/
│   ├── User.js		# Organizer/Vendor/Guest
│   ├── Event.js		#Events
│   ├── Registration.js	#Registration
│   ├── Session.js	#Sessions
│   └── Feedback.js	#Feedbacks
├── routes/
│   ├── auth.js		# Routes for login/signup
│   ├── events.js	# Routes for event management
│   ├── registrations.js	# Routes for registration
│   ├── sessions.js	# routes for sessions
│   └── feedback.js	#Routes for feedback
├── middleware/
│   ├── auth.js		# JWT verification
│   ├── validation.js	# JWT verification
│   └── errorHandler.js	# Error handling middleware
├── controllers/
│   ├── authController.js 	# Login, signup, authentication logic
│   ├── eventController.js	# Create/edit/delete events
│   ├── registrationController.js	# Registration logic
│   ├── sessionController.js	# Session logic
│   └── feedbackController.js	# Feedback logic
├── utils/
│   ├── email.js		# Utility to send emails
│   ├── generateToken.js    # JWT token generation
└── tests/
    ├── auth.test.js
    ├── events.test.js
    └── registrations.test.js
    

![Screenshot 2025-06-04 070158](https://github.com/user-attachments/assets/7c4fd2b3-3626-4303-8906-af3d2cccf52d)


# Perequisites
•  Node.js 18+ and npm
•  PostgreSQL 13+
•  Redis 6+
•  Git


# Installation
•	Clone the repository: ```bash git clone cd ```

•	Install dependencies: ```bash npm install ```

•	Create a PostgressSQL database

•	Configure environment variables:
o	Copy .env.example to .env
o	Update the values in .env with your configuration

•	Start the server: ```bash


# Development
npm run dev


# Production
npm start

