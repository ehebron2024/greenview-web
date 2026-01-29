const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function removeAdmin(email) {
  try {
    console.log('🔍 Looking up user:', email);
    const user = await admin.auth().getUserByEmail(email);
    
    console.log('📧 Found:', user.email);
    console.log('🏷️  Current claims:', user.customClaims);
    
    // Remove ALL custom claims by setting to empty object
    await admin.auth().setCustomUserClaims(user.uid, {});
    
    console.log('✅ Removed admin claim from', email);
    console.log('⚠️  User must sign out and sign back in for changes to take effect');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}
