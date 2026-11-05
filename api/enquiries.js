export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json([]);
  }

  if (req.method === "POST") {
    const { name, email, phone, projectType, location, budget, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const enquiryId = "enq-" + Date.now();
    console.log("[Info] Enquiry received:", { enquiryId, name, email, projectType });

    return res.status(201).json({
      success: true,
      message: "Enquiry received. We will contact you shortly.",
      id: enquiryId,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
