import "./globals.css";

export const metadata = {
  title: "SCRIMED | Healthcare Intelligence Platform",
  description:
    "SCRIMED is an AI-native healthcare intelligence platform for clinical workflows, automation, interoperability, and trust monitoring."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
