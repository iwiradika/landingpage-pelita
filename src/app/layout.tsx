import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PELITA — Online Digital Competency Assessment",
  description: "A digital competency assessment platform for prospective vocational IT educators, based on the PELITA Framework and CDM-GDINA model.",
  icons: {
    icon: '/pavicon_pelitamodel.png',
    shortcut: '/pavicon_pelitamodel.png',
    apple: '/pavicon_pelitamodel.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script 
          src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}