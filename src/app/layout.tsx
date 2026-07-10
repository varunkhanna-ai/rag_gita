import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emotion-Aware RAG",
  description:
    "A free, local RAG system with emotion-aware retrieval. Find comfort and wisdom in your documents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto">{children}</div>
      </body>
    </html>
  );
}
