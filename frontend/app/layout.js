// app/layout.js
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300","400","500","600"], variable: "--font-dm-sans" });
const syne = Syne({ subsets: ["latin"], weight: ["400","600","700","800"], variable: "--font-syne" });

export const metadata = {
  title: "InvoiceGuard",
  description: "AI Invoice Detection App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${syne.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}