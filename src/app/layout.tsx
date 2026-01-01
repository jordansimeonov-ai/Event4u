import type { Metadata } from "next";
import React from 'react';

export const metadata: Metadata = {
  title: "Event4U",
  description: "Premium Event Calculator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <head>
        {/* Google Fonts: Playfair Display (Serif) & Lato (Sans) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        {/* PDF Generation Library */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      </head>
      <body>
        <div id="root">
          {children}
        </div>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    serif: ['"Playfair Display"', 'serif'],
                    sans: ['"Lato"', 'sans-serif'],
                  },
                  colors: {
                    'alpine-blue': '#3B82F6',
                    'alpine-blue-dark': '#1D4ED8',
                    'alpine-slate': '#1E293B',
                    'alpine-gray': '#64748B',
                    'alpine-white': '#F8FAFC',
                    'glass-border': 'rgba(255, 255, 255, 0.2)',
                  },
                  boxShadow: {
                    'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                    'float': '0 20px 40px -5px rgba(0, 0, 0, 0.1)',
                  },
                  animation: {
                    'fade-in': 'fadeIn 0.8s ease-out forwards',
                    'slide-up': 'slideUp 0.6s ease-out forwards',
                  },
                  keyframes: {
                    fadeIn: {
                      '0%': { opacity: '0' },
                      '100%': { opacity: '1' },
                    },
                    slideUp: {
                      '0%': { opacity: '0', transform: 'translateY(20px)' },
                      '100%': { opacity: '1', transform: 'translateY(0)' },
                    }
                  }
                }
              }
            }
          `
        }} />
      </body>
    </html>
  );
}