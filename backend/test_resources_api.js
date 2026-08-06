import http from 'http';

http.get('http://localhost:5000/api/resources', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log("Enriched resources returned from API:");
      data.forEach(r => {
        console.log(`- Resource: "${r.title}", Seller: "${r.seller_name}", Phone: "${r.seller_phone}"`);
      });
    } catch(e) {
      console.error("Parse error:", e);
    }
  });
}).on('error', err => {
  console.error("HTTP error:", err.message);
});
