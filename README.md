# 🎨 Canvaso

Canvaso is a real-time collaborative drawing application built for brainstorming, designing, and visual thinking. It combines an intuitive canvas experience with multi-board management and live collaboration.

> Inspired by modern whiteboarding tools, but designed with a more structured workflow and cleaner UI.

---

## 🚀 Features

### 🖌️ Drawing Tools
- Freehand (pen)
- Rectangle, Ellipse, Diamond
- Line & Arrow
- Selection & Pan tools

### ⚡ Core Capabilities
- Undo / Redo support  
- Zoom & Pan interactions  
- Keyboard shortcuts for faster workflow  
- Persistent storage of boards  
- Real-time collaboration using WebSockets  

### 🧠 Board Management
- Create and manage multiple boards  
- Dashboard interface for organizing work  

### 🎨 Styling
- Basic styling options for elements  
- Shape customization (ongoing improvements)

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- shadcn/ui
- Framer Motion

### State & Forms
- Zustand (state management)
- React Hook Form
- Zod (validation)

### Canvas & Rendering
- HTML Canvas API (custom rendering engine)

### Backend & Infra
- Node.js (via Next.js API routes)
- Prisma ORM
- Neon DB (PostgreSQL)
- BetterAuth (authentication)

### Realtime
- WebSockets (for live collaboration)

---

## ⚙️ How It Works

- Canvaso uses the HTML Canvas API to render drawable elements.
- Each shape is stored as a structured object (JSON-like format), enabling persistence and real-time syncing.
- Rendering is selectively updated rather than fully redrawn every time, improving performance.
- State is managed using Zustand to minimize unnecessary re-renders.
- Real-time collaboration is handled via WebSockets, syncing canvas state across clients.

---

## 📦 Setup & Installation

```bash
# Clone the repository
git clone https://github.com/your-username/canvaso.git

# Navigate into the project
cd canvaso

# Install dependencies
npm install
```

### 🔑 Environment Variables

Create a `.env` file and add key values like in `example.env`

### ⚙️ Prisma Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### ▶️ Run the app

```bash
npm run dev
```

---

## 🌐 Live Demo

👉 [View Canvaso Live](http://mycanvaso.vercel.app)

---

## 🗺️ Roadmap

- Improve real-time collaboration smoothness  
- Advanced styling (alignment, snapping, grouping)  
- Text and image tools  
- Mobile support with multi-touch gestures  
- Performance optimizations for large boards  
- Layer management system  

---

## ⚠️ Challenges & Learnings

- Handling element resizing and transformations on canvas  
- Managing efficient rendering without redrawing everything  
- Understanding low-level Canvas API behavior  
- Designing a scalable structure for real-time sync  

---

## 🙌 Inspiration

Canvaso is heavily inspired by tools like Excalidraw, but aims to improve:
- Structured board management (dashboard system)
- Cleaner and more intuitive UI
- Better organization for multiple projects

---

## 📄 License

This project is open-source and available under the MIT License.
