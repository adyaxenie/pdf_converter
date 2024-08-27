import "./globals.css";
import React from "react";

import SessionProvider from "./components/sessionProvider";
import { ReactNode } from 'react'
import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF to Table',
  description: 'PDF Converter',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-theme="emerald" className="custom-scrollbar">
      <body className="bg-base-100">
      <Analytics/>
          {children}
      </body>
    </html>

  )
}

