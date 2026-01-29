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

// Set multiple admins
async function setMultipleAdmins() {
  console.log('🚀 Setting admin claims for multiple users...\n');
  
  // admin.yes@gmail.com
  await setAdminByUID('fFbX03ACBdPLbN5uoouG3A3PQfu2');
  
  // tomer@greenviewrenovation.com
  await setAdminByUID('kRVqU53ceLcs24qHTxJ3MOZd0C12');
  
  console.log('\n✅ All admin claims set!');
}

setMultipleAdmins().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});