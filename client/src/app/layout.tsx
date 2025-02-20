import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "./StoreProvider";

export const metadata: Metadata = {
  title: "Aptos Agent",
  description: "An Agent for Aptos Developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {
          <StoreProvider>
            <div className="layout">{children}</div>
          </StoreProvider>
        }
      </body>
    </html>
  );
}
