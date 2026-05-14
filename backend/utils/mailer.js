let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('[mailer] nodemailer not installed — email confirmations disabled. Run: npm install nodemailer');
}

let transporter = null;

function getTransporter() {
  if (!nodemailer) return null;
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[mailer] SMTP env vars missing — email confirmations disabled. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

function formatOrderHtml(order) {
  const rows = order.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(item.productName)}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">$${item.price.toFixed(2)}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;">
    <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <h1 style="color:#2563eb;margin:0 0 8px;">Thank you for your order!</h1>
      <p style="color:#64748b;margin:0 0 24px;">Hi ${escapeHtml(order.customerName)}, we have received your order and it is being processed.</p>

      <div style="background:#eff6ff;border-radius:8px;padding:16px;margin-bottom:24px;">
        <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Order ID</div>
        <div style="font-size:16px;font-weight:700;color:#0f172a;">${order._id}</div>
      </div>

      <h2 style="font-size:16px;color:#0f172a;margin:0 0 12px;">Order Summary</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0f172a;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:8px;text-align:left;">Product</th>
            <th style="padding:8px;text-align:center;">Qty</th>
            <th style="padding:8px;text-align:right;">Price</th>
            <th style="padding:8px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:12px 8px;text-align:right;font-weight:700;">Total</td>
            <td style="padding:12px 8px;text-align:right;font-weight:700;color:#2563eb;">$${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <h2 style="font-size:16px;color:#0f172a;margin:24px 0 12px;">Shipping Information</h2>
      <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.6;">
        ${escapeHtml(order.customerName)}<br>
        ${escapeHtml(order.address)}<br>
        ${escapeHtml(order.customerPhone)}
      </p>

      <p style="margin-top:32px;color:#64748b;font-size:13px;">
        If you have any questions about your order, just reply to this email.
      </p>
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">&copy; ${new Date().getFullYear()} mahmoud cell</p>
  </div>
  `;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendOrderConfirmation(order) {
  const t = getTransporter();
  if (!t) return false;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const info = await t.sendMail({
    from: `"mahmoud cell" <${from}>`,
    to: order.customerEmail,
    subject: `Your order #${String(order._id).slice(-8).toUpperCase()} is confirmed`,
    html: formatOrderHtml(order),
    text: `Thank you for your order, ${order.customerName}!\n\nOrder ID: ${order._id}\nTotal: $${order.total.toFixed(2)}\n\nWe'll be in touch when it ships.`,
  });
  console.log('[mailer] Order confirmation sent:', info.messageId);
  return true;
}

module.exports = { sendOrderConfirmation };
