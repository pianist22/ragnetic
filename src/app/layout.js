// app/layout.js
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "RAGnetic",
  description: "Retrieval-Augmented Chat for Docs and Scripts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground antialiased">
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
      >
        <Navbar />
        <main>{children}</main>
      </ThemeProvider>
      </body>
    </html>
  );
}
