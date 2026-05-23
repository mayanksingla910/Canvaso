import { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >{children}
        <Toaster position="top-right"/></ThemeProvider>
      </body>
    </html>
  );
}
