import React from "react";
import abotPdf from "../assets/pdfs/about us.pdf";

const AboutUsRoute = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src={abotPdf}
        title="About Us"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default AboutUsRoute;
