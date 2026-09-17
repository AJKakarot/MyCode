# GitCode - GitHub Repository & Code Explorer

A fast, sleek, and responsive web application built with **Next.js (App Router)** to explore and read any public GitHub repository codebase with hierarchical file trees, syntax highlighting, and markdown previews.

Built by [ajeetgupta](https://ajeetgupta.com).

---

## ⚡ Features

- 📂 **Full File Tree Navigation**: Hierarchical directory tree with collapsible folders, file icons, and live search/filter.
- 🎨 **Syntax Highlighting**: 100+ language support with numbered line gutter and line wrap toggle.
- 📖 **Markdown & Image Previews**: GitHub Flavored Markdown renderer for `README.md` and visual viewer for images.
- 📱 **Mobile & PWA Ready**: 100% responsive layout, locked viewport (no accidental scroll), and 1-click **Add Shortcut** for Android & iPhone.
- 🔗 **Direct Link Sharing**: Supports full URLs (`https://github.com/owner/repo`) or shorthand (`owner/repo`).

---

## 🚀 Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Click **"Deploy"** (Next.js settings are automatically detected).

### Option 2: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
