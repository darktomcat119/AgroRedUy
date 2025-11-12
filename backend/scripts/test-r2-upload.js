/**
 * Test R2 Upload Configuration
 * This script tests if R2 is configured correctly without actually uploading
 */

require('dotenv').config();
const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');

async function testR2Config() {
  console.log('='.repeat(70));
  console.log('🧪 TESTING R2 CONFIGURATION');
  console.log('='.repeat(70));

  // Check environment variables
  console.log('\n📋 Step 1: Checking Environment Variables\n');
  
  const storageType = process.env.STORAGE_TYPE;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET;
  const endpoint = process.env.R2_ENDPOINT;
  const publicUrl = process.env.R2_PUBLIC_URL;

  console.log(`STORAGE_TYPE: ${storageType}`);
  console.log(`R2_ACCESS_KEY_ID: ${accessKeyId ? '✅ Set' : '❌ Not set'}`);
  console.log(`R2_SECRET_ACCESS_KEY: ${secretAccessKey ? '✅ Set' : '❌ Not set'}`);
  console.log(`R2_BUCKET_NAME: ${bucketName || '❌ Not set'}`);
  console.log(`R2_ENDPOINT: ${endpoint || '❌ Not set'}`);
  console.log(`R2_PUBLIC_URL: ${publicUrl || '❌ Not set'}`);

  if (storageType !== 's3') {
    console.log('\n❌ STORAGE_TYPE is not "s3"');
    console.log('   Files will save locally, not to R2');
    console.log('   Please set STORAGE_TYPE="s3" in your .env file');
    process.exit(1);
  }

  if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
    console.log('\n❌ Missing required R2 configuration');
    process.exit(1);
  }

  console.log('\n✅ All required environment variables are set');

  // Initialize S3 client
  console.log('\n📋 Step 2: Initializing R2 Client\n');

  try {
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    console.log('✅ R2 Client initialized successfully');

    // Test connection by listing objects
    console.log('\n📋 Step 3: Testing R2 Connection\n');
    
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 5,
    });

    const listResponse = await s3Client.send(listCommand);
    console.log(`✅ Successfully connected to R2 bucket: ${bucketName}`);
    console.log(`   Objects in bucket: ${listResponse.KeyCount || 0}`);
    
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      console.log('\n   Sample files:');
      listResponse.Contents.forEach((obj, i) => {
        console.log(`   ${i + 1}. ${obj.Key} (${(obj.Size / 1024).toFixed(2)} KB)`);
      });
    }

    // Test URL generation
    console.log('\n📋 Step 4: Testing URL Generation\n');
    
    const testKey = 'avatars/test-avatar-123.jpg';
    
    if (publicUrl) {
      const generatedUrl = `${publicUrl}/${testKey}`;
      console.log('✅ URL generation working:');
      console.log(`   Key: ${testKey}`);
      console.log(`   Generated URL: ${generatedUrl}`);
      
      // Test if URL is accessible (just check format)
      if (generatedUrl.startsWith('https://pub-') && generatedUrl.includes('.r2.dev')) {
        console.log('   ✅ URL format looks correct (R2.dev domain)');
      } else if (generatedUrl.startsWith('https://')) {
        console.log('   ✅ URL format looks correct (custom domain)');
      } else {
        console.log('   ⚠️  URL format might be incorrect');
      }
    } else {
      console.log('⚠️  R2_PUBLIC_URL not set - URLs will use fallback');
      console.log(`   Fallback would be: r2://${bucketName}/${testKey}`);
      console.log('   ⚠️  This won\'t work in browsers!');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ R2 CONFIGURATION TEST PASSED');
    console.log('='.repeat(70));
    console.log('\n🎉 Your R2 is configured correctly!');
    console.log('\nNext upload will:');
    console.log('  1. Process image locally');
    console.log('  2. Upload to R2 bucket: agro-red-uy');
    console.log(`  3. Generate URL: ${publicUrl || 'r2://...'}/[path]`);
    console.log('  4. Save URL to database');
    console.log('  5. Return URL to frontend\n');

  } catch (error) {
    console.log('\n❌ R2 Connection Failed!');
    console.error('\nError:', error.message);
    
    if (error.message.includes('InvalidAccessKeyId')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check R2_ACCESS_KEY_ID is correct');
      console.log('   - Check R2_SECRET_ACCESS_KEY is correct');
      console.log('   - Verify credentials in Cloudflare R2 dashboard');
    } else if (error.message.includes('SignatureDoesNotMatch')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - R2_SECRET_ACCESS_KEY might be incorrect');
      console.log('   - Regenerate API token in Cloudflare');
    } else if (error.message.includes('NoSuchBucket')) {
      console.log('\n💡 Troubleshooting:');
      console.log(`   - Bucket "${bucketName}" doesn't exist`);
      console.log('   - Check bucket name spelling');
      console.log('   - Verify bucket exists in Cloudflare R2');
    } else {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check R2_ENDPOINT is correct');
      console.log('   - Verify network connectivity');
      console.log('   - Check Cloudflare R2 status');
    }
    
    process.exit(1);
  }
}

testR2Config().catch(console.error);

