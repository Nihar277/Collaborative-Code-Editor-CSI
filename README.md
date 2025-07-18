# Collaborative Code Editor

This is a web-based collaborative code editor built as part of my internship project. The platform allows multiple users to edit code in real-time, chat with collaborators, and maintain version control — similar to Google Docs but for coding.

## Features

- Real-time collaborative code editing
- Syntax highlighting for popular languages
- JWT-based user authentication (signup, login, logout)
- Version control with code history
- Chat functionality for collaborators
- Code session sharing via link (optional)

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT, bcrypt
- **Editor**: CodeMirror / Monaco Editor
- **Deployment**: Render / Railway / MongoDB Atlas

## Installation

```bash
git clone https://github.com/yourusername/collab-code-editor.git
cd collab-code-editor
npm install
npm run dev
