export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const envWebhookUrl = (process.env.GAS_WEBHOOK_URL || '').trim();
    const envSpreadsheetId = (process.env.GOOGLE_SPREADSHEET_ID || '').trim();
    const envWebhookSecret = (process.env.GAS_WEBHOOK_SECRET || '').trim();

    const targetWebhookUrl = envWebhookUrl || (typeof body.webhookUrl === 'string' ? body.webhookUrl.trim() : '');
    if (!targetWebhookUrl) {
      return res.status(400).json({
        status: 'error',
        message: '後端尚未設定 GAS_WEBHOOK_URL 環境變數，請於 Vercel 後台設定或於管理介面提供 Webhook 網址'
      });
    }

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec(\?.*)?$/.test(targetWebhookUrl)) {
      return res.status(400).json({
        status: 'error',
        message: '安全攔截：僅允許轉發至官方 Google Apps Script 網域 (https://script.google.com/macros/s/.../exec)'
      });
    }

    const forwardPayload = {
      spreadsheetId: envSpreadsheetId || body.spreadsheetId || '',
      date: body.date || '',
      morning: body.morning || '',
      afternoon: body.afternoon || '',
      evening: body.evening || '',
      fullText: body.fullText || '',
      submittedAt: body.submittedAt || new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      ...(envWebhookSecret ? { token: envWebhookSecret } : {}),
    };

    const gasResponse = await fetch(targetWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forwardPayload),
      redirect: 'follow',
    });

    if (!gasResponse.ok) {
      return res.status(502).json({
        status: 'error',
        message: `Google Apps Script 回應異常 (HTTP ${gasResponse.status})`
      });
    }

    const text = await gasResponse.text();
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      parsed = null;
    }

    if (parsed && parsed.status === 'error') {
      return res.status(502).json({
        status: 'error',
        message: parsed.message || '試算表腳本執行失敗'
      });
    }

    return res.status(200).json({
      status: 'success',
      verified: Boolean(parsed && parsed.status === 'success'),
      rawStatus: gasResponse.status
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err?.message || '後端代理連線失敗，請檢查網路連線'
    });
  }
}
