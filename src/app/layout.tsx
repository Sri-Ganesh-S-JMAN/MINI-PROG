import '@/styles/globals.css'

export const metadata = {
  title: "JDESK",
  description: "IT Service Desk Application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}