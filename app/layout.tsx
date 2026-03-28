import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

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
