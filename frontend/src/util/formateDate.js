
 export const formatDate = (updatedAt) => {
  if (!updatedAt) {
    return "";
  }
    const formattedDate = new Date(updatedAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short", // gives "Sept"
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
      timeZoneName: "short", // adds IST
    });
    return formattedDate;
}