# CodeMorph Lite - Compiler Design Project

CodeMorph Lite is a full-stack compiler design project that converts JavaScript to TypeScript and visualizes core compiler phases.

The project includes:
- A React frontend with Monaco editor and result visualization
- A Node.js/Express backend implementing compiler pipeline components
- Test execution and code optimization support

## Features

- Convert JavaScript code to TypeScript
- Display AST (Abstract Syntax Tree)
- Generate semantic symbol table
- Generate IR (Intermediate Representation)
- Build a basic CFG (Control Flow Graph)
- Run custom test cases against user code
- Perform optimization and show before/after code comparison
- Download generated TypeScript output

## Project Structure

```text
code-conversion/
|- backend/
|  |- src/
|  |  |- compiler/
|  |  |- executor/
|  |  |- routes/
|  |  `- index.js
|  `- package.json
|- frontend/
|  |- src/
|  |- public/
|  `- package.json
`- README.md
```

## Tech Stack

### Frontend
- React
- Monaco Editor (`@monaco-editor/react`)
- Axios
- React Hot Toast
- React JSON Tree

### Backend
- Node.js
- Express
- CORS
- Babel parser/traverse/types
- VM2

## API Endpoints

Base URL: `http://localhost:5000/api`

- `POST /convert` - Converts JavaScript to TypeScript and returns compiler outputs
- `POST /optimize` - Runs optimization flow for code
- `POST /run-tests` - Executes provided test cases
- `POST /test-cases` - Stores/retrieves in-memory test cases

## Local Setup

### 1) Clone repository
```bash
git clone https://github.com/khushwantsingh007/compiler-design-project.git
cd compiler-design-project
```

### 2) Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

### 3) Run backend
```bash
cd ../backend
npm run dev
```
Backend runs on `http://localhost:5000`.

### 4) Run frontend
```bash
cd ../frontend
npm start
```
Frontend runs on `http://localhost:3000`.

## Environment Configuration (Optional)

Frontend uses:
- `REACT_APP_API_URL` (default: `http://localhost:5000/api`)

Create `frontend/.env` if needed:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## How to Use

1. Open the app in browser.
2. Write or paste JavaScript code in the input editor.
3. Click **Convert to TS** to see:
   - TypeScript output
   - AST
   - Symbol table
   - IR
   - CFG
4. Add test cases and click **Run Tests**.
5. Click **Optimize** to view optimization stats and transformed code.
6. Click **Download TS** to export the generated TypeScript file.

## Notes

- Test cases are stored in-memory on the backend and reset when server restarts.
- This project is for educational/compiler-design demonstration purposes.

## Author

- GitHub: [khushwantsingh007](https://github.com/khushwantsingh007)
- Email: brossgaming3@gmail.com
