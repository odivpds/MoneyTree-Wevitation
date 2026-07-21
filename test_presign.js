const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function testPresign() {
  const s3 = new S3Client({
    endpoint: 'https://sg-s3.storage.bunnycdn.com',
    region: 'sg',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: 'test-presign.txt',
    ContentType: 'text/plain',
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log('Presigned URL:', url);
    
    // Now try to PUT to it
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'Hello World from presign!'
    });
    console.log('Upload status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error(err);
  }
}
testPresign();
