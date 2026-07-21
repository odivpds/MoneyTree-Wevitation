async function checkCors() {
  const url = 'https://sg.storage.bunnycdn.com/moneytree-wevitation/test-api.txt';
  try {
    const res = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'PUT'
      }
    });
    console.log('OPTIONS Status:', res.status);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Methods:', res.headers.get('access-control-allow-methods'));
  } catch (err) {
    console.error('Error:', err);
  }
}
checkCors();
