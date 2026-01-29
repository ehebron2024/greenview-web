const admin = require('firebase-admin');

// Initialize with your service account key
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this file exists in the scripts folder

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminByUID(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    const customClaims = user.customClaims || {};

    if (customClaims.admin === true) {
      console.log(`✅ ${user.email} is already an admin`);
      return;
    }

    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Admin claim set for ${user.email}`);
    console.log('⚠️  User must sign out and sign back in');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// REPLACE WITH YOUR ADMIN USER'S UID
setAdminByUID('dKniak7uRyVat6T6tFesN0PQy703').then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});