import './globals.css'
import { Inter } from 'next/font/google'


const inter = Inter({
   weight: "600", 
   subsets: ['latin'] 
  })

export const metadata = {
  title: 'Devesh Krishan',
  description: 'Personal portfolio created by Devesh',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
