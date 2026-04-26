import { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Canvaso",
  description: "Canvaso is a free and open source canvas app for collaborative drawing.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="" lang="en">
      <body className={`antialiased`}>{children}
        <Toaster position="top-right"/>
      </body>
    </html>
  );
}
