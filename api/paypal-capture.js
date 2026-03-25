/**
 * Captures an approved PayPal order
 * POST body: { orderID }
 * Returns: { success, transactionId }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'PayPal credentials not configured' })
  }

  const { orderID } = req.body

  if (!orderID) {
    return res.status(400).json({ error: 'orderID is required' })
  }

  try {
    // Get access token
    const authRes = await fetch(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      }
    )

    const authData = await authRes.json()

    if (!authData.access_token) {
      return res.status(500).json({ error: 'Failed to authenticate with PayPal' })
    }

    // Capture order
    const captureRes = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData.access_token}`,
        },
      }
    )

    const captureData = await captureRes.json()

    if (captureData.status === 'COMPLETED') {
      const transactionId =
        captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderID
      return res.status(200).json({ success: true, transactionId })
    } else {
      console.error('PayPal capture failed:', captureData)
      return res.status(400).json({ success: false, error: 'Payment capture failed' })
    }
  } catch (error) {
    console.error('PayPal capture error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
