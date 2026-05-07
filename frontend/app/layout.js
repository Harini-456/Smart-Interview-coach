import "./globals.css";

export const metadata = {
  title: "Smart Interview Coach",
  description: "AI Interview Practice Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}