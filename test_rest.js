const fs = require('fs');

async function testREST() {
  const zoneName = 'moneytree-wevitation';
  const accessKey = '276af9ca-44f9-4fb1-bc3bfe29f6bf-acbc-43a2';
  
  const endpoints = [
    'sg.storage.bunnycdn.com',
    'storage.bunnycdn.com',
    'ny.storage.bunnycdn.com',
    'la.storage.bunnycdn.com',
    'syd.storage.bunnycdn.com'
  ];

  for (const ep of endpoints) {
    const url = `https://${ep}/${zoneName}/test-api.txt`;
    console.log('Testing', url);
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'AccessKey': accessKey,
          'Content-Type': 'text/plain'
        },
        body: 'hello world from rest api'
      });
      const text = await res.text();
      console.log('Response from', ep, ':', res.status, text);
    } catch (err) {
      console.log('Error from', ep, ':', err.message);
    }
  }
}

testREST();
