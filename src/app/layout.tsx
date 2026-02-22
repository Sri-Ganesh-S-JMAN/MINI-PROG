import '@/styles/globals.css'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
       
        <div style={{ display: 'flex' }}>
          
          <main style={{ padding: 20 }}>{children}</main>
        </div>
      </body>
    </html>
  )
}
