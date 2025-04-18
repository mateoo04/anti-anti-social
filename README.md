# Anti-anti social

Full-stack <b>social media platform</b> built with modern web technologies to emulate core features of popular social media apps. It allows users to create and discover content, interact with others and build a personalized profile. The application supports secure authentication including authentication using GitHub.

## Table of contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Preview](#preview)
- [Getting Started](#getting-started)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)

## Features

- Secure login and registration using JWT, GitHub OAuth
- Create, read, update, and delete (CRUD) posts
- Like and comment functionality
- Follow and unfollow users
- Home feed and explore page
- Real-time notifications using Socket.IO
- Infinite scrolling using React Query
- Responsive interface for mobile and desktop users

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express, Socket.IO
- Database: Prisma ORM (PostgreSQL)
- Image storage: Supabase
- Authentication: JWT (JSON Web Token)
- Libraries: React Router, React Query, React Hook Form, Faker
- Styling: CSS, Bootstrap

## Preview

<p align="center">
<img src="./screenshots/profile.png" width="900">
</p>
<p align="center">
<img src="./screenshots/home.png" width="360" style="margin-left: 4px;margin-right: 4px;">
<img src="./screenshots/home_comment.png" width="360" style="margin-left: 4px;margin-right: 4px;">
<img src="./screenshots/search.png" width="360" style="margin-left: 4px;margin-right: 4px;">
</p>

## Getting Started

Ensure you have the following installed:

- Node.js
- npm

Clone the repository:

```
git clone https://github.com/mateoo04/anti-anti-social
cd anti-anti-social
```

## Frontend Setup

Navigate to the client folder and install dependencies:

```
cd client
npm install
```

To build the frontend:

```
npm run build
```

## Backend Setup

Navigate to the server folder and install dependencies:

```
cd ../server
npm install
npx prisma generate
npx prisma migrate dev
```

## Environment Variables

Create a .env file in the server directory and define the necessary variables:

```
DATABASE_URL=your_database_url
SECRET=your_secret
FRONTEND_URL
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_CALLBACK
```

For the frontend, create a .env file in the client directory:

```
VITE_API_URL=api_url
VITE_SUPABASE_URL
VITE_SUPABASE_API_KEY
```

## Running the Application

After setting up both frontend and backend, run the following in the server directory:

```
node server.js
```

The app will be running at http://localhost:4000/ for frontend and http://localhost:4000/api for backend.
