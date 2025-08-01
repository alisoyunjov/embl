# Species Assembly Summaries

React web application that displays genome assembly information using the Ensembl REST API.

## Requirements

- **Node.js** (v19 or higher)
- **npm** v8.19+ 

## Setup

```bash
git clone <repository-url>
cd embl
npm install
```

## Local Run

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## File Structure

```
assembly_summary/
├── src/
│   ├── config/
│   │   └── api.js          # API endpoints and headers
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md              # This file
```