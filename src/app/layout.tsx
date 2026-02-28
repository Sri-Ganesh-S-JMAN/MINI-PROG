
﻿import '@/styles/globals.css'

export const metadata = {
  title: "JDESK",
  description: "IT Service Desk Application",
};

﻿import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

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