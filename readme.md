# Quiz App Project with Node.js and Azure Cosmos DB

This project is a web application built with Node.js, Express, and Azure Cosmos DB, allowing you to create, edit, view, and delete interactive quizzes. The application includes a front-end in HTML, CSS, and JavaScript, utilizing Bootstrap for styling, and implements basic authentication with password protection.

## Table of Contents

- [Resources Used](#resources-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)
  - [Front-end](#front-end)
  - [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Security Considerations](#security-considerations)
- [Known Issues and Solutions](#known-issues-and-solutions)
- [License](#license)
- [Contact](#contact)

---

## Resources Used

- **Node.js**: Server-side JavaScript runtime environment.
- **Express**: Web framework for Node.js.
- **Azure Cosmos DB**: Fully managed NoSQL database used to store the quizzes.
- **Bootstrap**: Front-end library for responsive styling.
- **jQuery**: JavaScript library for DOM manipulation and AJAX requests.
- **dotenv**: Load environment variables from a `.env` file.
- **cookie-parser**: Middleware to parse cookies in HTTP requests.
- **@azure/cosmos**: Azure Cosmos DB SDK for Node.js.

---

## Prerequisites

- **Node.js** installed (version 12 or higher).
- **NPM** (usually installed with Node.js).
- An **Azure** account with access to **Cosmos DB** or **Azure Cosmos DB Emulator** installed locally.
- **Git** (optional, to clone the repository).

---

## Installation

1. **Clone the repository or download the project files**:

   ```bash
   git clone https://github.com/your-username/your-repository.git
   ```

2. **Navigate to the project directory**:

   ```bash
   cd your-repository
   ```

3. **Install the project dependencies**:

   ```bash
   npm install
   ```

---

## Configuration

1. **Configure Azure Cosmos DB**:

   - Create an account on the [Azure portal](https://portal.azure.com) if you don't have one.
   - Create an instance of **Azure Cosmos DB** with the **Core (SQL)** API.
   - Note the **URI** and **Primary Key** of the Cosmos DB.

2. **Create the `.env` file at the root of the project**:

   Create a file named `.env` and add the following environment variables:

   ```env
   COSMOSDB_URI=<YOUR_COSMOSDB_URI>
   COSMOSDB_KEY=<YOUR_COSMOSDB_PRIMARY_KEY>
   COSMOSDB_DATABASE=QuizDatabase
   COSMOSDB_CONTAINER=Quizzes
   PASSWORD=<YOUR_DESIRED_PASSWORD>
   PORT=3000
   ```

   - Replace `<YOUR_COSMOSDB_URI>` with your Cosmos DB URI.
   - Replace `<YOUR_COSMOSDB_PRIMARY_KEY>` with your Cosmos DB primary key.
   - Replace `<YOUR_DESIRED_PASSWORD>` with the password you wish to use for application protection.

3. **Ensure that the `.env` file is in the `.gitignore`** to avoid versioning sensitive information.

---

## Running the Application

Start the server with the command:

```bash
node index.js
```

You will see the message:

```
Server running on port 3000
```

---

## Usage

### Front-end

1. **Access the application in the browser**:

   ```
   http://localhost:3000/
   ```

2. **Login**:

   - You will be redirected to the login page.
   - Enter the password defined in the `.env` file.
   - After a successful login, you will be redirected to the main page.

3. **Create a Quiz**:

   - Click the **"Create Quiz"** button.
   - Fill in the quiz name.
   - Add questions and answers dynamically.
     - For each question, you can add multiple answers.
     - Check the **"Is True"** box to indicate the correct answers.
   - Click **"Save Quiz"** to save.

4. **View Quizzes**:

   - Below the "Create Quiz" button, you will see a table listing all quizzes with **ID**, **Name**, and **Actions**.

5. **Edit a Quiz**:

   - Click the **"Edit"** button corresponding to the quiz you want to edit.
   - A new tab will open with the form pre-filled with the current data.
   - Make the desired changes and click **"Save Quiz"**.

6. **Delete a Quiz**:

   - Click the **"Delete"** button corresponding to the quiz you want to delete.
   - Confirm the action in the confirmation window.
   - The quiz will be removed from the list.

### API Endpoints

The application exposes the following endpoints:

- **Register a Quiz**:

  ```
  POST /api/quiz/register
  ```

  - Request body (JSON):

    ```json
    {
      "quizName": "Quiz Name",
      "questions": [
        {
          "question": "Question Text",
          "answers": [
            {
              "answer": "Answer Text",
              "isTrue": true
            }
          ]
        }
      ]
    }
    ```

- **Get All Quizzes**:

  ```
  GET /api/quiz/all
  ```

- **Search a Quiz by ID or Name**:

  ```
  GET /api/quiz/search?id={id}
  GET /api/quiz/search?name={name}
  ```

- **Edit a Quiz**:

  ```
  PUT /api/quiz/edit/{id}
  ```

  - Request body (JSON): Same format as quiz registration.

- **Delete a Quiz**:

  ```
  DELETE /api/quiz/delete/{id}
  ```

---

## Project Structure

```
├── api
│   └── quiz-register.js       # API routes for quiz management
├── middlewares
│   └── passwordProtect.js     # Middleware for password protection
├── public
│   ├── index.html             # Main page
│   ├── edit.html              # Quiz editing page
│   ├── login.html             # Login page
│   ├── css
│   │   └── styles.css         # (Optional) Custom styles file
│   └── js
│       ├── main.js            # Script for the main page
│       ├── edit.js            # Script for the edit page
│       └── login.js           # Script for the login page (if necessary)
├── .env                       # Environment variables (not versioned)
├── index.js                   # Main server file
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation
```

---

## Authentication

The application implements simple password protection using HTTP cookies.

- **`passwordProtect` Middleware**:

  - Intercepts all requests and checks if the user is authenticated.
  - Allows access without authentication to the routes `/login.html`, `/login`, and any routes starting with `/chat`.
  - Redirects to `/login.html` if the user is not authenticated.

- **Route `/login`**:

  - Processes the login form.
  - Checks if the provided password matches the password defined in the `.env` file.
  - Sets an `authToken` cookie with the password upon success.

- **Logout**:

  - To implement logout, simply clear the `authToken` cookie on the client or create a `/logout` route that removes the cookie.

---

## Security Considerations

- **Do not use this implementation in production without improvements**:

  - **Plain Text Password**: The password is compared in plain text and stored in a cookie. In production, use secure hashes and never store passwords in plain text.
  - **HTTPS**: Use HTTPS to ensure communications are encrypted.
  - **Secure Cookies**: Mark cookies as `Secure` and `HttpOnly` to prevent attacks.
  - **Authentication Libraries**: Consider using libraries like `passport` for more robust authentication.

---

## License

This project is licensed under the terms of the MIT license.

---

## Contact

For more information or questions, contact [caio@caiohv.com](mailto:caio@caiohv.com).

---

**Note**: This project was developed as an educational example and may require adjustments for use in production environments.