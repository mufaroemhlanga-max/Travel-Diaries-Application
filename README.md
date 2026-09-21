# Travel Diaries

A web application for documenting and sharing travel experiences—upload photos, write descriptions, add travel dates, and browse other travellers' posts.

## Features

- User registration and session-based login
- Create, edit, and delete personal travel posts
- Upload travel photos and descriptions
- Add travel dates
- Public homepage feed, newest posts first
- Personal profile with post controls
- Live weather and location
- Responsive desktop, tablet, and mobile layout

## Tech stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js and Express.js
- **Database:** MongoDB with Mongoose
- **File uploads:** Multer
- **Authentication:** express-session and bcrypt

## Prerequisites

Install the following:

- [Node.js](https://nodejs.org) version 18 or later
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)

MongoDB must be running locally on port `27017`.

## Installation

Clone the repository and install its dependencies:

```powershell
git clone https://github.com/mufaroemhlanga-max/Travel-Diaries-Application.git
cd Travel-Diaries-Application
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/travel-diaries
SESSION_SECRET=replace-with-a-secure-random-string
```

Create the uploads folder:

```powershell
mkdir public\uploads
```

Do not commit the `.env` file or uploaded photos to GitHub.

## Running the application

Ensure MongoDB is running, then start the application:

```powershell
npm start
```

For development with automatic server restarting:

```powershell
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

## Usage

1. Register an account or log in.
2. Select **+ New Post**.
3. Upload a photo, description, and travel date.
4. Browse posts on the homepage.
5. Open **Profile** to edit or delete your posts.

## Project structure

```text
├── public/
│   ├── css/
│   ├── js/
│   └── uploads/         Created locally for uploaded photos
├── routes/              Express route handlers
├── models/              Mongoose schemas
├── server.js            Application entry point
├── package.json         Dependencies and run scripts
├── package-lock.json    Locked dependency versions
└── .env.example         Environment-variable template
```

## Testing

A Postman collection named `Travel-Diaries.postman_collection.json` is included in the project root.

Import it into Postman and run:

1. **Register**
2. **Login**
3. The remaining requests

For requests requiring a post ID, copy an `_id` from the **Get all posts** response into the collection's `postId` variable.

## API overview

| Method | Route | Description | Requires login |
|---|---|---|---|
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Log in | No |
| GET | `/api/auth/me` | Get the current user | Yes |
| POST | `/api/auth/logout` | Log out | Yes |
| GET | `/api/posts` | Get all travel posts | No |
| GET | `/api/posts/mine` | Get the user's posts | Yes |
| GET | `/api/posts/:id` | Get a single post | No |
| POST | `/api/posts` | Create a travel post | Yes |
| PUT | `/api/posts/:id` | Edit a post | Yes |
| DELETE | `/api/posts/:id` | Delete a post | Yes |
| GET | `/api/weather?lat=&lon=` | Get weather and location | No |