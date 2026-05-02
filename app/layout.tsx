export const metadata = {
  title: "SCRIMED OS",
  description: "SCRIMED OS Hub"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
