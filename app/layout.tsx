
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body
        className={` antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
