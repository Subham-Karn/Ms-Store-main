import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // 1. Get the product ID from the URL
  const { id } = req.query;

  try {
    const apiRes = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
    const product = await apiRes.json();
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    let htmlData = fs.readFileSync(indexPath, 'utf8');
    const metaTags = `
      <title>${product.title} | Ms Store</title>
      <meta property="og:title" content="${product.title} | Ms Store" />
      <meta property="og:description" content="Buy ${product.title} at the best price!" />
      <meta property="og:image" content="${product.bunner}" />
      <meta property="og:url" content="https://msstore.vercel.app/catalog/${id}" />
      <meta property="og:type" content="product" />
      <meta name="twitter:card" content="summary_large_image" />
    `;
    htmlData = htmlData.replace('</head>', `${metaTags}</head>`);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlData);

  } catch (error) {
    console.error("Failed to generate OG tags:", error);
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    const htmlData = fs.readFileSync(indexPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlData);
  }
}