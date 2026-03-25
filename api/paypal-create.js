/**
 * Creates a PayPal order
 * POST body: { amount, currency, items }
 * Returns: { orderID }
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

  const { amount, currency = 'USD', items = [] } = req.body

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

    // Create order
    const orderRes = await fetch(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: Number(amount).toFixed(2),
              },
              description: "La'Fai Order",
            },
          ],
          application_context: {
            brand_name: "La'Fai",
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
          },
        }),
      }
    )

    const orderData = await orderRes.json()

    if (orderData.id) {
      return res.status(200).json({ orderID: orderData.id })
    } else {
      console.error('PayPal order creation failed:', orderData)
      return res.status(500).json({ error: 'Failed to create PayPal order' })
    }
  } catch (error) {
    console.error('PayPal create error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
