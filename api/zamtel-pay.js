/**
 * Initiates Zamtel Kwacha Pay payment
 * POST body: { phone, amount, orderId }
 * Returns: { success, message }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ZAMTEL_API_KEY
  const merchantCode = process.env.ZAMTEL_MERCHANT_CODE

  if (!apiKey || !merchantCode) {
    return res.status(500).json({ error: 'Zamtel credentials not configured' })
  }

  const { phone, amount, orderId } = req.body

  if (!phone || !amount || !orderId) {
    return res.status(400).json({ error: 'phone, amount, and orderId are required' })
  }

  const normalizedPhone = phone.replace(/[\s+-]/g, '')

  try {
    // Zamtel Kwacha Pay API integration
    // Note: Zamtel's public API documentation is limited — this implementation
    // follows their general pattern. Consult Zamtel's developer portal for exact specs.
    const payRes = await fetch('https://api.zamtel.co.zm/v1/payment/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        merchant_code: merchantCode,
        msisdn: normalizedPhone,
        amount: Number(amount).toFixed(2),
        reference: orderId,
        currency: 'ZMW',
        description: `La'Fai Order ${orderId}`,
      }),
    })

    // Handle both success and structured error responses
    let payData
    try {
      payData = await payRes.json()
    } catch {
      payData = {}
    }

    if (payRes.ok && (payData.success || payData.status === 'success' || payData.code === '00')) {
      return res.status(200).json({
        success: true,
        transactionId: payData.transaction_id || payData.reference || orderId,
        message: 'Payment initiated. Please confirm on your Zamtel phone.',
      })
    } else {
      console.error('Zamtel pay failed:', payData)
      return res.status(400).json({
        success: false,
        message: payData.message || payData.error || 'Zamtel payment failed. Please try again.',
      })
    }
  } catch (error) {
    console.error('Zamtel pay error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
