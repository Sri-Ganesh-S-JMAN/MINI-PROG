import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ padding: 20 }}>{children}</main>
        </div>
      </body>
    </html>
  )
}
