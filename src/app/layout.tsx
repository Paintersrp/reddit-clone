import { Inter } from "next/font/google";
import "@/styles/globals.css";

import { cn } from "@/lib/utils";
import Navbar from "@/components/ui/Navbar";
import { Toaster } from "@/components/ui/Toaster";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Hivemind",
  description: "A Reddit clone built with Next.js, Prisma, and TypeScript.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className
      )}
    >
      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <Providers>
          {/* @ts-expect-error Server Component */}
          <Navbar />
          <Toaster />

          {authModal}

          <div className="container max-w-7xl xl:max-w-[1600px] mx-auto h-full pt-12">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
