import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import 'react-toastify/ReactToastify.css';
import { AuthProvider } from "./AuthContext";
import NavBar from "./components/navBar/navBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aventones",
  description: "Check for a ride or offer one, Aventones is the best way to share your ride",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <Providers>
            <NavBar />
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}