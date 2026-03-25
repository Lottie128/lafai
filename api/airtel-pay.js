/**
 * Initiates Airtel Money payment
 * Airtel Money Zambia API: https://openapi.airtel.africa/
 * POST body: { phone, amount, currency, orderId, customerName }
 * Returns: { success, transactionId, message }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.AIRTEL_API_KEY
  const merchantId = process.env.AIRTEL_MERCHANT_ID

  if (!apiKey || !merchantId) {
    return res.status(500).json({ error: 'Airtel credentials not configured' })
  }

  const { phone, amount, currency = 'ZMW', orderId, customerName } = req.body

  if (!phone || !amount || !orderId) {
    return res.status(400).json({ error: 'phone, amount, and orderId are required' })
  }

  // Normalize phone number (remove spaces, dashes, ensure starts with country code)
  const normalizedPhone = phone.replace(/[\s-]/g, '').replace(/^\+/, '')

  try {
    // Step 1: Get Airtel access token
    const authRes = await fetch(
      'https://openapi.airtel.africa/auth/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        body: JSON.stringify({
          client_id: apiKey,
          client_secret: merchantId,
          grant_type: 'client_credentials',
        }),
      }
    )

    const authData = await authRes.json()

    if (!authData.access_token) {
      console.error('Airtel auth failed:', authData)
      return res.status(500).json({ success: false, message: 'Airtel authentication failed' })
    }

    // Step 2: Request to Pay
    const payRes = await fetch(
      'https://openapi.airtel.africa/merchant/v1/payments/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
          'X-Currency': currency,
          'X-Country': 'ZM',
          Authorization: `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify({
          reference: orderId,
          subscriber: {
            country: 'ZM',
            currency,
            msisdn: normalizedPhone,
          },
          transaction: {
            amount: String(amount),
            country: 'ZM',
            currency,
            id: orderId,
          },
        }),
      }
    )

    const payData = await payRes.json()

    if (payData.status?.code === '200' || payData.status?.success === true) {
      return res.status(200).json({
        success: true,
        transactionId: payData.data?.transaction?.id || orderId,
        message: 'Payment initiated. Please confirm on your Airtel Money phone.',
      })
    } else {
      console.error('Airtel payment failed:', payData)
      return res.status(400).json({
        success: false,
        message: payData.status?.message || 'Payment initiation failed. Please try again.',
      })
    }
  } catch (error) {
    console.error('Airtel pay error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
