const admin = require('firebase-admin');

// Initialize with your service account key
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this file exists in the scripts folder

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminCustomClaim(uid) {
  try {
    // Get the user's current custom claims
    const user = await admin.auth().getUser(uid);
    const customClaims = user.customClaims || {};

    // Check if the user is already an admin to avoid unnecessary updates
    if (customClaims.admin === true) {
      console.log(`✅ User ${uid} is already an admin.`);
      console.log('Custom claims:', customClaims);
      process.exit(0);
      return;
    }

    // Set the 'admin' claim to true
    await admin.auth().setCustomUserClaims(uid, { ...customClaims, admin: true });
    console.log(`✅ Custom claim 'admin: true' set for user ${uid}.`);

    // Verify the claim was set
    const updatedUser = await admin.auth().getUser(uid);
    console.log('Updated custom claims:', updatedUser.customClaims);

    console.log('\n⚠️  IMPORTANT: User must sign out and sign in again for changes to take effect.');
    console.log('Or call auth.currentUser.getIdToken(true) on the client to force a token refresh.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting custom admin claim:', error);
    process.exit(1);
  }
}

async function setAdminByEmail(email) {
  try {
    // Get user by email first
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${email} (UID: ${user.uid})`);
    
    // Now set the admin claim using the UID
    await setAdminCustomClaim(user.uid);
  } catch (error) {
    console.error('❌ Error finding user by email:', error);
    process.exit(1);
  }
}

// Usage examples:

// Option 1: Set admin by UID (if you know the UID)
// setAdminCustomClaim('your_user_uid_here');

// Option 2: Set admin by email (easier)
setAdminByEmail('eden.hebron@gmail.com');