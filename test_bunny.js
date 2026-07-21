const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function testEndpoint(endpoint) {
  const client = new S3Client({
    region: 'auto',
    endpoint: endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'moneytree-wevitation',
      secretAccessKey: '276af9ca-44f9-4fb1-bc3bfe29f6bf-acbc-43a2',
    },
  });

  try {
    const res = await client.send(new PutObjectCommand({
      Bucket: 'moneytree-wevitation',
      Key: 'test-api.txt',
      Body: 'hello world',
      ContentType: 'text/plain'
    }));
    console.log('SUCCESS with endpoint:', endpoint);
  } catch (err) {
    console.log('FAILED with endpoint:', endpoint, '->', err.message);
  }
}

async function run() {
  await testEndpoint('https://sg.storage.bunnycdn.com');
  await testEndpoint('https://storage.bunnycdn.com');
  await testEndpoint('https://ny.storage.bunnycdn.com');
}

run();
