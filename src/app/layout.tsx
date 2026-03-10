import "./globals.css";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <NextTopLoader color="#000" showSpinner={false} />
        {children}
      </body>
    </html>
  )
}