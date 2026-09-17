# ⚡ GitCode — Next-Gen GitHub Repository & Code Explorer

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Database-Neon%20Postgres-00E599?style=for-the-badge&logo=postgresql" alt="Neon Postgres" />
  <img src="https://img.shields.io/badge/Auth-Clerk%20OAuth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk Auth" />
  <img src="https://img.shields.io/badge/Engine-Turbopack-F43F5E?style=for-the-badge&logo=turbopack" alt="Turbopack" />
  <img src="https://img.shields.io/badge/PWA-Ready-38BDF8?style=for-the-badge&logo=pwa" alt="PWA Ready" />
</p>

<p align="center">
  A lightning-fast, sleek, and developer-centric web application built with <strong>Next.js App Router</strong>, <strong>Neon Serverless Postgres</strong>, and <strong>Clerk Auth</strong> to explore, search, and bookmark any GitHub repository with hierarchical file trees, syntax highlighting, and cloud synchronization.
</p>

<p align="center">
  <strong>Designed & Built with ❤️ by <a href="https://ajeetgupta.com">Ajeet Gupta</a></strong>
</p>

---

## 📑 Table of Contents

- [✨ Core Features](#-core-features)
- [🏗️ System Architecture](#️-system-architecture)
- [⚡ Tech Stack](#-tech-stack)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [📁 Project Structure](#-project-structure)
- [⚙️ Environment Variables](#️-environment-variables)
- [💻 Getting Started](#-getting-started)
- [🚀 Deployment](#-deployment)
- [☕ Support & Contact](#-support--contact)

---

## ✨ Core Features

- 📂 **Hierarchical File Tree**: Instant tree navigation with expandable/collapsible directories, language icons, file count badges, and live filter search.
- 🎨 **Code Syntax Highlighting**: PrismJS-powered syntax highlighting for 100+ programming languages with numbered line gutters and line wrapping.
- 📖 **Rich Markdown & Image Previews**: Embedded GitHub Flavored Markdown (GFM) renderer for documentation (`README.md`) and image viewer for asset inspection.
- 🔐 **GitHub OAuth & 30-Day Persistence**: Integrated with Clerk Authentication for single-click GitHub login with persistent 30-day session retention.
- ☁️ **Cloud Database Bookmarks (Neon Postgres)**: Save and bookmark public or private repositories with instant persistence to a serverless Neon PostgreSQL database.
- 🔍 **Smart Repo Autocomplete**: When logged in, your personal GitHub repositories are automatically suggested in the search bar with keyboard arrow navigation.
- ⚡ **Power-User Keyboard Shortcuts**: Instant navigation with `⌘K`, `⌘B`, `⌘S`, and quick action hotkeys.
- 📱 **PWA & Mobile-First UI**: Installable Progressive Web App with custom install prompts, touch gestures, and zero layout shift.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["🖥️ Client Layer (Browser & PWA)"]
        UI["GitCode Web App (Next.js 16 UI)"]
        Shortcuts["Keyboard Shortcuts Engine (⌘K, ⌘B, ⌘S)"]
        TreeViewer["File Tree & Code Viewer (Prism.js)"]
        SearchInput["Smart Repo Search & Autocomplete"]
    end

    subgraph AuthLayer["🔐 Authentication (Clerk)"]
        Clerk["Clerk OAuth Service"]
        GitHubOAuth["GitHub OAuth Provider"]
        SessionMgr["30-Day Persistent Session"]
    end

    subgraph ServerLayer["⚡ Next.js App Router (Backend API)"]
        Proxy["Next.js Proxy / Middleware"]
        UserReposAPI["/api/user-repos (User Repos Autocomplete)"]
        SavedReposAPI["/api/saved-repos (CRUD Bookmarks)"]
    end

    subgraph DataLayer["💾 Cloud & External Services"]
        GitHubREST["GitHub REST API (Trees, Blobs, Meta)"]
        NeonDB[("🐘 Neon Serverless Postgres (user_saved_repos)")]
    end

    UI --> Shortcuts
    UI --> TreeViewer
    UI --> SearchInput

    UI <--> |OAuth Flow| Clerk
    Clerk <--> GitHubOAuth
    Clerk --> SessionMgr

    UI --> |Fetch Repo Data| GitHubREST
    SearchInput --> |Fetch User Repos| UserReposAPI
    UI --> |Save / Load Bookmarks| SavedReposAPI

    Proxy --> ServerLayer
    UserReposAPI --> |Fetch Authenticated Repos| GitHubREST
    SavedReposAPI <--> |SQL Queries| NeonDB
```

### Architecture Overview

1. **Presentation Layer**: Built using React 19 and Next.js 16 with custom CSS design tokens, offering high-performance client components (`RepoInput`, `FileTree`, `CodeViewer`, `SavedReposModal`).
2. **Authentication Flow**: Managed by `@clerk/nextjs` with dedicated `/sign-in` and `/sign-up` routes. GitHub OAuth grants authenticated tokens for personal repo autocomplete.
3. **Data Persistence**:
   - **Neon Database**: Serverless PostgreSQL stores bookmarked repositories (`user_saved_repos` table) keyed by Clerk `user_id`.
   - **Ephemeral Guest Mode**: Unauthenticated users have temporary session bookmarks that automatically reset on page refresh.
4. **GitHub API Engine**: Dynamic branch resolution, recursive file tree fetching, base64 blob decoding, and token-assisted rate limit expansion.

---

## ⚡ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Server and client rendering, routing, API endpoints |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety |
| **Database** | [Neon Serverless Postgres](https://neon.tech/) | Scalable serverless PostgreSQL for user bookmarks |
| **Authentication** | [Clerk](https://clerk.com/) | OAuth user management, sessions, and security |
| **Syntax Highlighting** | [PrismJS](https://prismjs.com/) | Syntax styling for 100+ code formats |
| **Markdown Parsing** | [React Markdown](https://github.com/remarkjs/react-markdown) + `remark-gfm` | GFM tables, task lists, code blocks |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent developer UI icons |
| **Styling** | Vanilla CSS Design System | Custom CSS variables, glassmorphism, responsive tokens |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| <kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>/</kbd> | Focus & select the Repository Search Input |
| <kbd>⌘</kbd> + <kbd>B</kbd> / <kbd>Ctrl</kbd> + <kbd>B</kbd> | Toggle (Collapse / Expand) the File Tree Sidebar |
| <kbd>⌘</kbd> + <kbd>S</kbd> / <kbd>Ctrl</kbd> + <kbd>S</kbd> | Open / Close the **Saved Repositories** Cloud Modal |
| <kbd>↑</kbd> / <kbd>↓</kbd> + <kbd>Enter</kbd> | Navigate and select from your personal repository autocomplete suggestions |
| <kbd>Esc</kbd> | Close active modal, dropdowns, or clear search selection |

---

## 📁 Project Structure

```text
gitcode/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── saved-repos/     # Neon DB CRUD API for bookmarks
│   │   │   └── user-repos/      # GitHub user repositories fetcher
│   │   ├── contact/             # Dedicated Contact & Support page
│   │   ├── sign-in/             # Dedicated Clerk Sign-In route
│   │   ├── sign-up/             # Dedicated Clerk Sign-Up route
│   │   ├── globals.css          # Design system, theme tokens & animations
│   │   ├── layout.tsx           # Root layout with ClerkProvider & fonts
│   │   └── page.tsx             # Main code explorer workspace
│   ├── components/
│   │   ├── CodeViewer.tsx       # Syntax highlighted code renderer
│   │   ├── FileTree.tsx         # Hierarchical directory tree
│   │   ├── InstallPrompt.tsx    # PWA install banner
│   │   ├── MarkdownViewer.tsx   # GFM README renderer
│   │   ├── RepoHeader.tsx       # Repo metadata & action bar
│   │   ├── RepoInput.tsx        # Search bar with autocomplete & shortcuts
│   │   ├── SavedReposModal.tsx  # Cloud bookmarks manager
│   │   └── GithubIcon.tsx       # SVG vector icons
│   ├── lib/
│   │   ├── db.ts                # Neon Serverless Postgres client & schema init
│   │   ├── github.ts            # GitHub REST API client & helpers
│   │   ├── savedRepos.ts        # Cloud-first bookmark sync logic
│   │   └── theme.ts             # Theme manager
│   └── proxy.ts                 # Next.js 16 Clerk routing proxy
├── public/                      # Static icons, manifest & PWA assets
├── .env.local.example           # Example environment template
└── package.json                 # Project dependencies & scripts
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and populate the required keys:

```env
# -------------------------------------------------------------
# Clerk Authentication Keys (https://dashboard.clerk.com)
# -------------------------------------------------------------
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# -------------------------------------------------------------
# Neon Database Connection String (https://console.neon.tech)
# -------------------------------------------------------------
DATABASE_URL=postgresql://neondb_owner:***@ep-***.neon.tech/neondb?sslmode=require

# -------------------------------------------------------------
# Optional GitHub Personal Access Token (Increases Rate Limits)
# -------------------------------------------------------------
GITHUB_TOKEN=ghp_...
```

---

## 💻 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/AJKakarot/MyCode.git
cd MyCode
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 🚀 Deployment

### Deploying to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to your GitHub repository.
2. Import the project in [Vercel](https://vercel.com).
3. Add the environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`).
4. Click **Deploy**.

---

## ☕ Support & Contact

If you enjoy using **GitCode** or find it helpful for exploring codebases:

- 🌐 **Developer Portfolio**: [ajeetgupta.com](https://ajeetgupta.com)
- 💬 **WhatsApp Direct Support**: [+91 8840713812](https://wa.me/918840713812?text=Hi%20Ajeet,%20I%20have%20an%20issue/feedback%20regarding%20GitCode)
- ☕ **Support Development (UPI)**: `gajeet031-1@okicici` / `8840713812`

---

<p align="center">
  © 2026 GitCode. Open-sourced under the MIT License.
</p>
