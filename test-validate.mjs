const key = 'PSK-FC7A-68B1-1514' // your actual key

const res = await fetch('https://deniyitunji.com/api/license/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key }),
})

console.log('Status:', res.status)
const data = await res.json()
console.log('Response:', JSON.stringify(data, null, 2))
