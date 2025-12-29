const admin = require('firebase-admin');

// Initialize with your service account key
// Download from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this file exists in the scripts folder

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`✅ Admin access granted to ${email} (UID: ${user.uid})`);
    console.log('User must sign out and sign in again for changes to take effect.');
    
    // Verify
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('Custom claims:', updatedUser.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin claim:', error);
    process.exit(1);
  }
}

// Set admin for eden.hebron@gmail.com
setAdminClaim('eden.hebron@gmail.com');