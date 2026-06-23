function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6); 
  const randomNum = Math.floor(1000 + Math.random() * 9000); 
  return `MSSTOREODR-${timestamp}${randomNum}`;
}

export default generateOrderNumber;