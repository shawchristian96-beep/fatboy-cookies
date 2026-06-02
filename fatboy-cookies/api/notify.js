export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, order } = req.body;

  const isArrival = type === "arrival";
  const subject = isArrival
    ? `🚗 CUSTOMER ARRIVING — ${order.name} · ${order.order_num}`
    : `🍪 NEW ORDER — ${order.name} · ${order.order_num}`;

  const message = isArrival
    ? `🚗 ${order.name} just tapped "I'm Here"!\n\nOrder: ${order.order_num}\nPhone: ${order.phone}\nPickup: ${order.pickup}\nFlavors: ${order.flavors}\n\n🍪 Bring their box to the door now!`
    : `🍪 NEW ORDER RECEIVED!\n\nOrder #: ${order.order_num}\nName: ${order.name}\nPhone: ${order.phone}\n${order.email ? `Email: ${order.email}\n` : ""}Flavors: ${order.flavors}\nQuantity: ${order.qty} box${order.qty > 1 ? "es" : ""}\nPickup: ${order.pickup}\n${order.note ? `Note: "${order.note}"\n` : ""}`;

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: "service_y8ncecw",
        template_id: "template_n1orm1o",
        user_id: "i4Y7t7o44F7l_1UQh",
        accessToken: "LsFbHIcEIVjeb2rmvnqf1",
        template_params: {
          to_email: "1fatboycookies@gmail.com",
          subject,
          message,
          from_name: "Fatboy Cookies Orders",
        },
      }),
    });

    const text = await response.text();
    if (!response.ok) return res.status(500).json({ error: text });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
