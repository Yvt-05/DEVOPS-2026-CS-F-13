export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  return res.status(200).json({
    status: "ok",
    service: "Shivakriti Constructions REST API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      projects: "/api/projects",
      enquiries: "/api/enquiries [POST]",
    },
  });
}
