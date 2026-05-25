import { DM_Sans } from "next/font/google";
import "./globals.css";

const dm_sans = DM_Sans({
  variable: "--font-DM_Sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Malka Jewellers Records",
  description: "RMS Records Managment System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dm_sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
