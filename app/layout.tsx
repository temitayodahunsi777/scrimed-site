export const metadata = {
  title: "SCRIMED OS Hub",
  description: "SCRIMED operating hub"
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
