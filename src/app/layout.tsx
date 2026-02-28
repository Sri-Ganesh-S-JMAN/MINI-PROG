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

       
        <div style={{ display: 'flex' }}>
          
          <main style={{ padding: 20 }}>{children}</main>
        </div>

      </body>
    </html>
  )
}