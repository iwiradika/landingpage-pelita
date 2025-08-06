# PELITA - Platform Pengukuran Kompetensi Digital

Platform assessment kompetensi digital untuk calon pendidik kejuruan TI dengan teknologi AI dan visualisasi interaktif.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

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
├── public/                 # Static assets
│   ├── logo.png           # PELITA logo
│   ├── framwork.png       # Framework diagram
│   ├── BukuPanduan.png    # Book cover image
│   ├── BukuPanduan_PELITA.pdf # Guide document
│   └── ...                # Technology logos
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── globals.css   # Global styles & animations
│   │   ├── layout.tsx    # Root layout with external scripts
│   │   └── page.tsx      # Main landing page
│   ├── components/       # Reusable components
│   │   ├── AIChat.tsx    # AI chat component
│   │   └── ui/           # UI components (shadcn/ui)
│   └── lib/              # Utilities
│       └── utils.ts      # Helper functions
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

- [Framework Guide](public/BukuPanduan_PELITA.pdf) - Complete implementation guide
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Follow the existing code style
2. Keep components modular and reusable
3. Maintain responsive design principles
4. Test across different devices and browsers

## 📄 License

© 2024 Wiradika, I.N.I., Hadi, S., Khairudin, M. All rights reserved.
