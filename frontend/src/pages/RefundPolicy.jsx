import React from 'react'
import refundPolicy from '../assets/pdfs/refund policy.pdf'

const RefundPolicy = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src={refundPolicy}
        title="About Us"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </div>
  )
}

export default RefundPolicy
