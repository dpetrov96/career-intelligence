import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Career Intelligence",
  description:
    "Analyze your resume against job descriptions — skill gaps, fit, and interview prep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} light h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="h-dvh overflow-hidden bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
