import "./globals.css";

export const metadata = {
  title: "JDesk",
  description: "Enterprise ITSM Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
