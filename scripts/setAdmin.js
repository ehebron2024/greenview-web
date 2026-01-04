const admin = require('firebase-admin');

// Initialize with your service account key
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this file exists in the scripts folder

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminCustomClaim(uid) {
  try {
    console.log('🔍 Looking up user:', uid);
    
    // Get the user's current custom claims
    const user = await admin.auth().getUser(uid);
    console.log('📧 User email:', user.email);
    console.log('🏷️  Current custom claims:', user.customClaims);

    const customClaims = user.customClaims || {};

    // Check if the user is already an admin
    if (customClaims.admin === true) {
      console.log(`✅ User ${uid} is already an admin.`);
      console.log('Custom claims:', customClaims);
      return;
    }

    console.log('⚙️  Setting admin claim to TRUE...');
    
    // Set the 'admin' claim to true
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    console.log(`✅ Custom claim 'admin: true' set for user ${uid}.`);

    // Verify the claim was set
    const updatedUser = await admin.auth().getUser(uid);
    console.log('✅ Updated custom claims:', updatedUser.customClaims);

    console.log('\n⚠️  IMPORTANT NEXT STEPS:');
    console.log('1. User must sign out completely from your web app');
    console.log('2. Sign back in');
    console.log('3. The new admin claim will be in their token');
    console.log('\nOR run this in browser console after signing in:');
    console.log('auth.currentUser.getIdToken(true).then(() => location.reload())');

  } catch (error) {
    console.error('❌ Error setting custom admin claim:', error);
    console.error('Error details:', error.message);
  }
}

async function setAdminByEmail(email) {
  try {
    console.log('🔍 Looking up user by email:', email);
    
    // Get user by email first
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${email}`);
    console.log(`   UID: ${user.uid}`);
    
    // Now set the admin claim using the UID
    await setAdminCustomClaim(user.uid);
  } catch (error) {
    console.error('❌ Error finding user by email:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 TIP: Make sure the user exists in Firebase Authentication');
      console.log('   Check: https://console.firebase.google.com/project/_/authentication/users');
    }
  }
}

// Run it
console.log('🚀 Starting admin setup script...\n');
setAdminByEmail('eden.hebron@gmail.com').then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Script failed:', err);
  process.exit(1);
});