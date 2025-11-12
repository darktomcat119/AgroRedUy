/**
 * Diagnostic script to check storage configuration
 * Run this to see exactly what storage settings your backend is using
 */

require('dotenv').config();

console.log('='.repeat(60));
console.log('📦 STORAGE CONFIGURATION DIAGNOSTIC');
console.log('='.repeat(60));

console.log('\n📋 Environment Variables:\n');

const storageType = process.env.STORAGE_TYPE;
console.log(`STORAGE_TYPE = "${storageType}"`);

if (storageType === 's3') {
  console.log('✅ S3/R2 storage is ENABLED');
  console.log('\n🔑 R2 Configuration:');
  console.log(`  R2_ACCESS_KEY_ID = ${process.env.R2_ACCESS_KEY_ID ? '✅ Set (' + process.env.R2_ACCESS_KEY_ID.substring(0, 8) + '...)' : '❌ NOT SET'}`);
  console.log(`  R2_SECRET_ACCESS_KEY = ${process.env.R2_SECRET_ACCESS_KEY ? '✅ Set (hidden)' : '❌ NOT SET'}`);
  console.log(`  R2_BUCKET_NAME = ${process.env.R2_BUCKET_NAME || '❌ NOT SET'}`);
  console.log(`  R2_ENDPOINT = ${process.env.R2_ENDPOINT || '❌ NOT SET'}`);
  console.log(`  R2_PUBLIC_URL = ${process.env.R2_PUBLIC_URL || '❌ NOT SET'}`);
  
  console.log('\n🔍 Analysis:');
  
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.log('  ❌ Missing R2 credentials - uploads will FAIL');
  } else {
    console.log('  ✅ R2 credentials are set');
  }
  
  if (!process.env.R2_BUCKET_NAME) {
    console.log('  ❌ Bucket name not set - uploads will FAIL');
  } else {
    console.log(`  ✅ Bucket name: ${process.env.R2_BUCKET_NAME}`);
  }
  
  if (!process.env.R2_ENDPOINT) {
    console.log('  ⚠️  Endpoint not set - may cause issues');
  } else {
    console.log(`  ✅ Endpoint: ${process.env.R2_ENDPOINT}`);
  }
  
  if (!process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_URL.includes('YOUR_PUB_ID')) {
    console.log('  ❌ R2_PUBLIC_URL is PLACEHOLDER - URLs will be wrong!');
    console.log('  ⚠️  Images will upload to R2 but URLs will use fallback');
    console.log('  📝 ACTION REQUIRED: Get real R2 public URL from Cloudflare');
  } else {
    console.log(`  ✅ Public URL: ${process.env.R2_PUBLIC_URL}`);
  }
  
} else if (storageType === 'local') {
  console.log('⚠️  LOCAL storage is enabled');
  console.log('   Images will be saved to ./uploads/ directory');
  console.log('   URLs will be: http://localhost:3003/uploads/...');
  console.log('\n📝 To use R2, change STORAGE_TYPE to "s3" in .env');
} else {
  console.log('❌ STORAGE_TYPE is not set or invalid');
  console.log('   Defaulting to local storage');
}

console.log('\n' + '='.repeat(60));
console.log('💡 RECOMMENDATIONS:');
console.log('='.repeat(60));

if (storageType !== 's3') {
  console.log('\n1. Set STORAGE_TYPE="s3" in your .env file');
  console.log('2. Configure R2 credentials (see env.example)');
  console.log('3. Get R2 public URL from Cloudflare dashboard');
  console.log('4. Restart your backend');
} else if (!process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_URL.includes('YOUR_PUB_ID')) {
  console.log('\n❗ ACTION REQUIRED:');
  console.log('1. Go to: https://dash.cloudflare.com/');
  console.log('2. R2 → agro-red-uy bucket → Settings');
  console.log('3. Enable "Public Access"');
  console.log('4. Copy the public URL (e.g., https://pub-xxxxx.r2.dev)');
  console.log('5. Update R2_PUBLIC_URL in your .env file');
  console.log('6. Restart your backend');
} else {
  console.log('\n✅ Configuration looks good!');
  console.log('   New uploads should use R2 URLs');
}

console.log('\n' + '='.repeat(60));
console.log('🧪 TESTING:');
console.log('='.repeat(60));
console.log('\n1. Restart backend if you made changes to .env');
console.log('2. Upload a new avatar');
console.log('3. Check the logs for:');
console.log('   "Avatar uploaded successfully: ... (s3)" ← Should say "s3"');
console.log('4. Check database - URL should start with:');
console.log(`   ${process.env.R2_PUBLIC_URL || 'https://pub-xxxxx.r2.dev'}/avatars/...`);
console.log('\n' + '='.repeat(60));

