import React from 'react'
import returnPolicy from '../assets/pdfs/return-policy.pdf'
const ReturnRoute = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src={returnPolicy}
        title="About Us"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </div>
  )
}

export default ReturnRoute
