import React from 'react'
import Navbar from '../components/Navbar'
import Footerbar from '../components/Footerbar'

const RootLayout = ({ children }) => {
  return (
    // 1. Make the wrapper a flex column that takes up at least the full screen height
    <div className="flex flex-col min-h-screen">
      
      <Navbar />
      
      {/* 2. flex-grow forces the <main> tag to expand and push the footer down */}
      <main className="flex-grow">
        {children}
      </main>

      <Footerbar />
      
    </div>
  )
}

export default RootLayout