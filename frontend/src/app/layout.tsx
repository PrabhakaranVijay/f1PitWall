import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PitWall - F1 Dashboard",
  description: "Real-time Formula 1 Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-[#0A0A0A] text-white  h-screen overflow-hidden`}
      >
        {/* <Header isLive={true} /> */}
        <div className="col-span-2 border-b border-[#333]">
          <Header isLive={true} />
        </div>
        <div className="flex col-span-2 border-b border-[#333]">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
