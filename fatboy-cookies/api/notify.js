export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, order } = req.body;

  const RESEND_KEY = "re_R213LqM4_JkbAsFdB4ESEG1h4VWnipaqi";
  const TO_EMAIL   = "1Fatboycookies@gmail.com";
  const FROM_EMAIL = "onboarding@resend.dev";

  let subject, html;

  if (type === "new_order") {
    subject = `🍪 NEW ORDER — ${order.name} · ${order.order_num}`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#1a1a1a;color:#f5f0e8;border-radius:12px;overflow:hidden;">
        <div style="background:#e63946;padding:20px 28px;">
          <h1 style="margin:0;font-size:28px;letter-spacing:2px;">🍪 NEW ORDER!</h1>
        </div>
        <div style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#888;font-size:13px;width:120px;">ORDER #</td><td style="padding:8px 0;font-weight:bold;color:#f4a261;font-size:16px;">${order.order_num}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">NAME</td><td style="padding:8px 0;font-weight:bold;">${order.name}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">PHONE</td><td style="padding:8px 0;font-weight:bold;">${order.phone}</td></tr>
            ${order.email ? `<tr><td style="padding:8px 0;color:#888;font-size:13px;">EMAIL</td><td style="padding:8px 0;">${order.email}</td></tr>` : ""}
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">BOX TYPE</td><td style="padding:8px 0;">${order.box_type}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">FLAVORS</td><td style="padding:8px 0;">${order.flavors}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">QUANTITY</td><td style="padding:8px 0;">${order.qty} box${order.qty > 1 ? "es" : ""} (${order.qty * 4} cookies)</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">PICKUP</td><td style="padding:8px 0;color:#4caf6e;font-weight:bold;">${order.pickup}</td></tr>
            ${order.note ? `<tr><td style="padding:8px 0;color:#888;font-size:13px;">NOTE</td><td style="padding:8px 0;font-style:italic;">"${order.note}"</td></tr>` : ""}
          </table>
          <div style="margin-top:20px;padding:14px;background:#2a2a2a;border-radius:8px;font-size:13px;color:#888;">
            💬 Text customer: <a href="sms:${order.phone?.replace(/\D/g,"")}" style="color:#5b8dee;">${order.phone}</a>
          </div>
          <div style="margin-top:12px;padding:14px;background:#1a2a1e;border:1px solid #4caf6e;border-radius:8px;font-size:13px;color:#4caf6e;">
            ✅ Go to your admin panel to mark this order Ready when baked
          </div>
        </div>
      </div>
    `;
  } else if (type === "arrival") {
    subject = `🚗 CUSTOMER ARRIVING — ${order.name} · ${order.order_num}`;
    html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#1a1a1a;color:#f5f0e8;border-radius:12px;overflow:hidden;">
        <div style="background:#f4a261;padding:20px 28px;">
          <h1 style="margin:0;font-size:28px;letter-spacing:2px;color:#1a1a1a;">🚗 CUSTOMER PULLING UP!</h1>
        </div>
        <div style="padding:24px 28px;">
          <p style="font-size:18px;margin:0 0 20px;"><strong>${order.name}</strong> just tapped "I'm Here"</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#888;font-size:13px;width:120px;">ORDER #</td><td style="padding:8px 0;font-weight:bold;color:#f4a261;">${order.order_num}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">PHONE</td><td style="padding:8px 0;font-weight:bold;">${order.phone}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">PICKUP</td><td style="padding:8px 0;">${order.pickup}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">FLAVORS</td><td style="padding:8px 0;">${order.flavors}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#1a2a1e;border:2px solid #4caf6e;border-radius:10px;text-align:center;font-size:16px;color:#4caf6e;font-weight:bold;">
            🍪 Bring their box to the door now!
          </div>
        </div>
      </div>
    `;
  } else {
    return res.status(400).json({ error: "Invalid type" });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        subject,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    return res.status(200).json({ success: true, id: data.id });
  } catch (e) {
    console.error("Email error:", e);
    return res.status(500).json({ error: e.message });
  }
}
