/**
 * Initiates MTN Mobile Money "Request to Pay"
 * MTN MoMo API: https://momodeveloper.mtn.com/
 * POST body: { phone, amount, currency, orderId }
 * Returns: { success, transactionId }
 */
import { randomUUID } from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.MTN_API_KEY
  const subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY
  const targetEnvironment = process.env.MTN_TARGET_ENVIRONMENT || 'sandbox'

  if (!apiKey || !subscriptionKey) {
    return res.status(500).json({ error: 'MTN credentials not configured' })
  }

  const { phone, amount, currency = 'EUR', orderId } = req.body

  if (!phone || !amount || !orderId) {
    return res.status(400).json({ error: 'phone, amount, and orderId are required' })
  }

  const baseUrl =
    targetEnvironment === 'production'
      ? 'https://proxy.momoapi.mtn.com'
      : 'https://sandbox.momodeveloper.mtn.com'

  const referenceId = randomUUID()
  // MTN sandbox uses EUR in EUR for sandbox; in production use correct currency
  const mtoCurrency = targetEnvironment === 'sandbox' ? 'EUR' : currency

  try {
    // Step 1: Create API user (sandbox only — in production this is pre-registered)
    if (targetEnvironment === 'sandbox') {
      await fetch(`${baseUrl}/v1_0/apiuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Reference-Id': referenceId,
          'Ocp-Apim-Subscription-Key': subscriptionKey,
        },
        body: JSON.stringify({ providerCallbackHost: 'https://webhook.site' }),
      })

      // Create API key for this user
      await fetch(`${baseUrl}/v1_0/apiuser/${referenceId}/apikey`, {
        method: 'POST',
        headers: { 'Ocp-Apim-Subscription-Key': subscriptionKey },
      })
    }

    // Step 2: Get access token
    const authRes = await fetch(`${baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${process.env.MTN_API_SECRET || ''}`).toString('base64')}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'X-Target-Environment': targetEnvironment,
      },
    })

    const authData = await authRes.json()

    if (!authData.access_token) {
      console.error('MTN auth failed:', authData)
      return res.status(500).json({ success: false, message: 'MTN authentication failed' })
    }

    // Step 3: Request to Pay
    const transactionId = randomUUID()
    const normalizedPhone = phone.replace(/[\s+-]/g, '')

    const payRes = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.access_token}`,
        'X-Reference-Id': transactionId,
        'X-Target-Environment': targetEnvironment,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      body: JSON.stringify({
        amount: String(Number(amount).toFixed(2)),
        currency: mtoCurrency,
        externalId: orderId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: normalizedPhone,
        },
        payerMessage: "La'Fai purchase",
        payeeNote: `Order ${orderId}`,
      }),
    })

    if (payRes.status === 202) {
      return res.status(200).json({
        success: true,
        transactionId,
        message: 'Payment request sent. Confirm on your MTN Mobile Money phone.',
      })
    } else {
      const errData = await payRes.json().catch(() => ({}))
      console.error('MTN pay failed:', errData)
      return res.status(400).json({
        success: false,
        message: errData.message || 'MTN payment failed. Please try again.',
      })
    }
  } catch (error) {
    console.error('MTN pay error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
