# Travel Diaries

A web application for documenting and sharing travel experiences — upload photos, write descriptions, add travel dates, and browse other travellers' posts in one place.

Built for the IU course *Project: Java and Web Development* (CSEBCSPJWD01).

## Features

- User registration and login (session-based authentication)
- Create, edit, and delete your own travel posts (photo, description, travel date)
- Public homepage feed of all travel posts, newest first
- Profile page listing your own posts with edit/delete controls
- Personalized homepage greeting, live weather, and live location for the logged-in visitor (via Open-Meteo and BigDataCloud, both free/keyless APIs)
- Responsive layout (desktop, tablet, and mobile)

## Tech stack

- **Frontend:** HTML, CSS, JavaScript (no framework)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **File uploads:** Multer
- **Auth:** express-session + bcrypt (password hashing)

## Prerequisites

Before installing, make sure you have:

- [Node.js](https://nodejs.org) (v18 or later — includes npm)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally (default port `27017`)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/mufaroemhlanga-max/Travel-Diaries-Application.git
   cd Travel-Diaries-Application
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root with the following two values:
   ```
   MONGODB_URI=mongodb://localhost:27017/travel-diaries
   SESSION_SECRET=replace-with-any-random-string
   ```
   - `MONGODB_URI` is the connection address for your local MongoDB database (it's created automatically the first time the app saves data — no manual setup needed).
   - `SESSION_SECRET` can be any random string of your choosing — it's used to securely sign login sessions. It should not be shared publicly.

4. Create the folder used to store uploaded photos (this folder is intentionally excluded from the repository, since uploaded content shouldn't be version-controlled):
   ```
   mkdir public/uploads
   ```

## Running the app

Make sure your local MongoDB server is running, then start the app:

```
node server.js
```

You should see:
```
Server is running at http://localhost:3000
Connected to MongoDB
```

Open **http://localhost:3000** in your browser.

## Usage

1. Register an account (or log in if you already have one)
2. Click **+ New Post** to share a travel memory (photo, description, and travel date)
3. View all posts on the homepage
4. Click **Profile** to view, edit, or delete your own posts

## Project structure

```
├── public/              Frontend (HTML, CSS, client-side JS, uploaded photos)
│   ├── css/
│   ├── js/
│   └── uploads/         Uploaded photos (created on setup, not tracked in git)
├── routes/               Express route handlers (auth, posts, weather)
├── models/               Mongoose schemas (User, Post)
├── server.js             App entry point
└── .env                  Local environment variables (not tracked in git)
```

## Testing

A Postman collection covering every route (`Travel-Diaries.postman_collection.json`, in the project root) is included as test-case evidence. Import it into Postman, run **Register** then **Login** first (Postman will keep the session cookie automatically), then try the rest of the requests. For routes that need a post ID (`Get single post`, `Update post`, `Delete post`), copy an `_id` from the **Get all posts** response into the collection's `postId` variable.

## API overview

| Method | Route | Description | Requires login |
|--------|-------|-------------|-----------------|
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Log in | No |
| GET | `/api/auth/me` | Get the current logged-in user | Yes |
| POST | `/api/auth/logout` | Log out | Yes |
| GET | `/api/posts` | Get all travel posts | No |
| GET | `/api/posts/mine` | Get the logged-in user's own posts | Yes |
| GET | `/api/posts/:id` | Get a single post by ID | No |
| POST | `/api/posts` | Create a post (photo upload) | Yes |
| PUT | `/api/posts/:id` | Edit a post (owner only) | Yes |
| DELETE | `/api/posts/:id` | Delete a post (owner only) | Yes |
| GET | `/api/weather?lat=&lon=` | Get weather and place name for coordinates | No |
