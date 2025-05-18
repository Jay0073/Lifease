# Workelate Backend

Workelate Backend is a modular, scalable backend system built with Node.js and Express. It supports features like Kanban boards, AI assistants, whiteboards, risk management, cron jobs, and more.

---

## 📁 Folder Structure
```
workelate-backend/
├── .github/      # GitHub workflows & actions
├── assets/       # Static assets and templates
├── config/       # App configuration files
├── controllers/  # Controllers for different routes
├── cron/         # Cron job handlers
├── lib/          # AI prompts and utilities
├── middleware/   # Express middlewares
├── models/       # Mongoose models
├── routes/       # Express routes
├── services/     # External service integrations (e.g. aws)
├── socket/       # Socket.IO setup
├── utility/      # Utility functions
├── .env.         # Environment variables
├── .eslintrc.json # ESLint configuration
├── .gitignore    # Git ignore rules
├── app.js        # Entry point of the application
├── package.json  # Project metadata and dependencies
└── README.md.    # Project documentation
```
---

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- .env file

### Installation

```bash
git clone https://github.com/workelate/workelate-backend.git
cd workelate-backend
npm install
```
### Add the .env file
Add the .env file to the worelate-backend directory and run the command.
### Running the app
```bash
npm start
```
---
## 🛠️ Available Scripts

| Script            | Description                            |
|-------------------|----------------------------------------|
| `npm start`       | Starts the backend using nodemon       |
| `npm run test`    | Runs Jest tests                        |
| `npm run prepare` | Installs Husky hooks for Git           |
| `npm run lint`    | Runs ESLint across the project         |
| `npm run pretty`  | Formats code using Prettier            |

---

## 🧠 Features

- 🔐 **JWT-based Authentication**
- 🧠 **AI Integrations** with OpenAI / Google APIs
- 📋 **Kanban Boards, Tasks, and Forms**
- 📅 **Cron and Scheduled Jobs**
- 📁 **File Upload** (GridFS / Cloudinary)
- 📊 **Risk Management and Analytics**
- 💬 **Real-time Communication** via Socket.IO
- 📨 **Email Integrations** using SendGrid, Nodemailer, Mailjet
- 🔧 **Modular Code** with Controller-Service pattern

---
---
## 🤝 Contributing

We welcome contributions! Please follow the steps below to create a pull request.

---
---
### 📌 How to Create a Pull Request

```bash
# 1. Clone the repository (ensure you have access)
git clone https://github.com/your-org/workelate-backend.git
cd workelate-backend

# 2. Create a new branch for your feature or bugfix
git checkout -b feature/your-feature-name
# or for a bugfix
git checkout -b fix/your-bug-description

# 3. Make your changes in the codebase

# 4. Stage and commit your changes with a clear message
git add .
git commit -m "feat: add [detailed explanation of your change]"

# Examples:
# git commit -m "feat: add user role middleware for admin access"
# git commit -m "fix: resolve crash on invalid email format during login"

# 5. Push your branch to the remote repository
git push origin feature/your-feature-name

# 6. Open GitHub and create a Pull Request from your branch to the `main` branch
#    → Provide a clear title and description
#    → Explain the changes you made and why
#    → Reference related issues if applicable (e.g., closes #123)
```
---
---
### 📝 Commit Message Convention

Use conventional commit prefixes to keep commit history readable and meaningful:

| Prefix     | Purpose                             |
|------------|-------------------------------------|
| `feat:`    | ✨ New feature                       |
| `fix:`     | 🐛 Bug fix                          |
| `refactor:`| 🧹 Code restructuring/improvement   |
| `docs:`    | 📝 Documentation updates            |
| `test:`    | ✅ Add or update tests              |
| `chore:`   | 🔧 Tooling/config/build changes     |


### ✅ Example:
```bash
git commit -m "feat: add task creation API"
git commit -m "fix: correct task status update bug"
git commit -m "docs: update README with new instructions"
```
---
---
## 📬 Contact

For feedback, support, or feature requests, reach out to the WorkElate team.

---

> **Tip:** Add screenshots, diagrams, or deployment instructions to further improve this README.
