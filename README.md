# Power's To-Do List

A to-do list application where you write your daily tasks while being tormented by Power from Chainsaw Man. She's trapped in this silly to-do app and isn't happy about serving you.

## Features

- Create, complete, and delete tasks with smooth animations
- Drag and drop to reorder tasks
- AI-powered chatbot with Power's personality
- Light and dark themes with smooth circular transition animations
- Real-time data persistence with Firebase
- Mobile-friendly touch support

## Tech Stack

- React 19
- Vite
- JavaScript / TypeScript
- Tailwind CSS 3
- Firebase Firestore
- next-themes (theme management)
- View Transitions API (theme animations)
- dnd-kit (drag and drop)
- GSAP (animations)
- Groq AI (chatbot)
- Google reCAPTCHA v3

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Groq API key
- Google reCAPTCHA v3 site keys

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd my-project
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Get your Firebase configuration from Project Settings

4. Set up Groq API:
   - Get your API key from https://console.groq.com

5. Set up Google reCAPTCHA:
   - Create reCAPTCHA v3 keys at https://www.google.com/recaptcha/admin

6. Create a `.env` file in the `server` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

7. Update Firebase configuration in `src/hooks/useFirestore.js`:
```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_auth_domain",
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
};
```

8. Update reCAPTCHA site key in `src/hooks/useRecaptcha.js`:
```javascript
const RECAPTCHA_SITE_KEY = "your_recaptcha_site_key_here";
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm install
npm start
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
my-project/
├── server/              # Backend API for chatbot
│   ├── routes/         # API routes
│   └── groqClient.js   # Groq AI client
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   └── assets/         # Images and static files
└── public/             # Public assets
```

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
