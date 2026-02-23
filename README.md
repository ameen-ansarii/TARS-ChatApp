<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/message-circle.svg" alt="Tars Logo" width="60" height="60">
  <h1 align="center">tars.</h1>
  <p align="center">
    <strong>A minimalist, real-time messaging application built for the modern web.</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Convex-ff6b6b?style=for-the-badge&logo=convex&logoColor=white" alt="Convex" />
    <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>
</div>

---

## 📌 Context
> **Note:** This project was developed as an **Internship Assignment**. The objective was to design, architecture, and develop a functional real-time chat application from the ground up, demonstrating proficiency in modern full-stack web development, UI/UX aesthetics, and secure backend integration.

## 🚀 Overview

**Tars** (Midnight Luxe aesthetic) is a premium, dark-themed chat application inspired by clean, text-driven Dribbble designs. It strips away clunky iconography and focuses heavily on typography, smooth CSS transitions, and sub-millisecond data synchronization. Messages, typing indicators, and user presence arrive before you even blink.

## ✨ Core Features

- ⚡ **Real-Time Communication:** Instant messaging powered by Convex's WebSocket architecture.
- 🟢 **Live Presence & Typing Indicators:** See who is online in real-time with smooth, animated aesthetic dots and active typing states.
- 🎨 **Midnight Luxe Aesthetics:** A premium dark-mode interface featuring glassmorphism, smooth scroll-triggered animations (no JS heavy libraries), and minimal thin fonts (`Plus Jakarta Sans`).
- 🔐 **Secure Identity Strategy:** Highly secure, enterprise-grade authentication via **Clerk**.
- 📱 **Fully Responsive:** Beautifully responsive across mobile, tablet, and desktop environments dynamically.

## 🔄 User Flow & Architecture

1. **Onboarding & Auth:** Users arrive on the highly-animated, minimalist landing page. Registration and login are handled seamlessly and securely via Clerk modals.
2. **Profile Syncing:** Upon successful authentication, the user's Clerk data is immediately synced with the Convex real-time database. Users can view and uniquely edit their "tars" username via the custom Profile settings page.
3. **Discovery:** The dedicated *Contacts* screen allows users to search the global directory and instantly spin up conversation threads. 
4. **Chatting:** Inside the chat scope, users experience sub-50ms message delivery, unread count badge dynamics, active conversation highlighting, and end-to-end style encrypted UI frames.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **[Next.js]** | Core React Framework, SSR, and Client Routing |
| **[Convex]** | Sub-millisecond Real-time Database & Backend Functions |
| **[Clerk]** | Secure User Authentication & Identity Management |
| **[Tailwind CSS v4]** | Styling, Glassmorphism variants, & utility creation |
| **[lucide-react]** | Beautiful, consistent, and minimal SVG icon library |

## 💻 Running Locally

To evaluate this assignment on your local machine:

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd tars-chat
```

**2. Install dependencies**
```bash
npm install
# or yarn install / pnpm install
```

**3. Configure Environment Variables**
Create a `.env.local` file in the root directory and add the required platform keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

**4. Spin up the development server**
This project runs both the Next.js frontend and Convex backend seamlessly in parallel:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to open the app.

---
<div align="center">
  <i>Developed with focus, clean code, and a lot of coffee ☕</i>
</div>
