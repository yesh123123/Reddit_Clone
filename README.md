# Reddit Clone

Reddit-like platform built with Express, MongoDB, and EJS templates, enabling users to share posts, upload images, like a post, form communities, and engage with comments on each post . Incorporating user authentication and authorization features using Passport.js for ensuring only the authorized people can perform certain tasks having authority.

## Prerequisites

Ensure you have the following installed:

- Node.js
- npm (Node Package Manager)
- MongoDB

## Installation

1. Clone the repository:
git clone https://github.com/Adityapatwari193/Reddit-Clone.git
cd Reddit-Clone


2. Install the required npm packages:
npm install


3. Set up the MongoDB database:

Start the MongoDB server:
mongod --dbpath /path/to/your/mongodb/data


In a new terminal, start the MongoDB shell:
mongo
Create the `reddit_clone` database by running:
use reddit_clone


4. Configure the MongoDB connection:

Update the MongoDB connection details in your `app.js` file if necessary.


const mongoose = require('mongoose');
const dburl = 'mongodb://127.0.0.1:27017/reddit_clone';

mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connection open");
})
.catch((err) => {
    console.log("ERROR");
    console.log(err);
});


## Running the Application

1. Start the server:
node app.js


2. Open your browser and navigate to:
http://localhost:3000


## Features

### User Authentication
- Secure user registration and login using Passport.js.
- Session management to keep users logged in.

### Posts
- Create, read, update, and delete posts.
- View a list of all posts on the home page.

### Comments
- Add comments to posts.
- View all comments related to a specific post.

### Flash Messages
- Inform users about the success or failure of their actions using flash messages.

## Routes

- `/` - Home page showing all posts.
- `/register` - User registration.
- `/login` - User login.
- `/posts/new` - Form to create a new post (requires login).
- `/posts/:id` - View a specific post with comments.
- `/posts/:id/comments/new` - Form to add a comment to a post (requires login).

## Middleware

- `isLoggedIn` - Middleware to check if the user is logged in.

## Error Handling

If an error occurs, the server will log the error stack and return a 500 status code with a message "Something Broke".

## Contributing

Feel free to submit issues or pull requests for any features or improvements.

---

For more details, visit the repository: [Reddit Clone](https://github.com/Adityapatwari193/Reddit-Clone).
