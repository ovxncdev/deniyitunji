const API_KEY = '13068|QnZEt8PhN2KdodQlX9RKlXyBUCVnE3SzHXoWxp518b68df2a'

const res = await fetch('https://api.pocketfi.ng/api/v1/checkout/confirm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({ payment_id: 'PFI|6029631498' }),
})

const data = await res.json()
console.log('Status:', res.status)
console.log('Response:', JSON.stringify(data, null, 2))
