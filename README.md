# PELITA - Platform Pengukuran Kompetensi Digital

Platform assessment kompetensi digital untuk calon pendidik kejuruan TI dengan teknologi AI dan visualisasi interaktif.

## 🚀 Quick Deploy to VPS via GitHub

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

### 2. Setup GitHub Secrets
Add these secrets in your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):
- `VPS_HOST`: Your VPS IP address
- `VPS_USERNAME`: SSH username for VPS  
- `VPS_SSH_KEY`: Private SSH key content
- `VPS_PORT`: SSH port (default: 22)

### 3. Deploy to VPS
```bash
# On your VPS, download and run deployment script
curl -O https://raw.githubusercontent.com/USERNAME/REPO-NAME/main/deploy.sh
chmod +x deploy.sh
./deploy.sh full yourdomain.com
```

### 4. Auto Deploy
Every push to `main` branch will automatically deploy to your VPS! ✨

## 💻 Local Development

### Prerequisites
- Node.js 20+ 
- npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
landingpage/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── public/                     # Static assets
│   ├── logo.png               # PELITA logo
│   ├── framwork.png           # Framework diagram
│   ├── BukuPanduan.png        # Book cover image
│   ├── BukuPanduan_PELITA.pdf # Guide document
│   └── ...                    # Technology logos
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── globals.css        # Global styles & animations
│   │   ├── layout.tsx         # Root layout with external scripts
│   │   └── page.tsx           # Main landing page
│   ├── components/            # Reusable components
│   │   ├── AIChat.tsx         # AI chat component
│   │   └── ui/                # UI components (shadcn/ui)
│   └── lib/                   # Utilities
│       └── utils.ts           # Helper functions
├── deploy.sh                  # VPS deployment script
├── ecosystem.config.js        # PM2 configuration (generated)
├── DEPLOYMENT_GUIDE.md        # Detailed deployment guide
└── ...config files

```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Maps**: MapLibre GL JS
- **Language**: TypeScript

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

## 🎯 Features

- Interactive framework visualization
- Responsive design
- Smooth animations
- Interactive map integration
- PDF document downloads
- AI chat interface
- Modern UI/UX

## 🔧 Configuration

The project uses:
- **Tailwind CSS 4** for modern styling
- **ESLint** for code quality
- **TypeScript** for type safety
- **Next.js** optimizations out of the box

## 📚 Documentation

- [**DEPLOYMENT_GUIDE.md**](./DEPLOYMENT_GUIDE.md) - Complete deployment guide with GitHub Actions
- [Framework Guide](public/BukuPanduan_PELITA.pdf) - Complete implementation guide
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## ⚡ Deployment Features

- **Automatic Deployment**: Push to `main` triggers auto-deployment
- **Health Checks**: Automatic service monitoring after deployment
- **Rollback Support**: Easy rollback via script commands
- **SSL Auto-Setup**: Let's Encrypt integration
- **Performance Monitoring**: Built-in PM2 monitoring
- **Backup System**: Automated daily backups

## 🤝 Contributing

1. Follow the existing code style
2. Keep components modular and reusable
3. Maintain responsive design principles
4. Test across different devices and browsers

## 📄 License

© 2024 Wiradika, I.N.I., Hadi, S., Khairudin, M. All rights reserved.
