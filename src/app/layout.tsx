import { Inter } from "next/font/google";
import "@/styles/globals.css";

import { cn } from "@/lib/utils";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/Toaster";

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
      <body className="min-h-screen bg-slate-50 antialiased">
        <Providers>
          {/* @ts-expect-error Server Component */}
          <Navbar />
          <Toaster />

          {authModal}

          <div className="md:container max-w-7xl xl:max-w-[1600px] md:mx-auto h-full pt-6">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
