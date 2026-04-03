// Test Firebase lookup directly
const key = 'PSK-FC7A-68B1-1514'

const res = await fetch('https://www.deniyitunji.com/api/license/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key }),
})

console.log('Status:', res.status)
const data = await res.json()
console.log('Response:', JSON.stringify(data, null, 2))

// Also check payment status
const ref = 'PFI|6027304137' // the payment reference from your successful payment
const res2 = await fetch(`https://www.deniyitunji.com/api/payment/status?ref=${encodeURIComponent(ref)}`)
console.log('\nPayment status:', res2.status)
const data2 = await res2.json()
console.log('Response:', JSON.stringify(data2, null, 2))
