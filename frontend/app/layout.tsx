import type { Metadata, ReactNode } from "next";
import "./globals.css";
import { AuthProvider } from "./context";

export const metadata: Metadata = {
  title: "Formify — One idea, five formats",
  description: "Turn one topic into a blog post, LinkedIn post, tweet thread, YouTube script and newsletter, instantly.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}