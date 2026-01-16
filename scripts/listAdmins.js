const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function listAllUsers() {
  try {
    console.log('🔍 Checking all users and their custom claims...\n');
    
    const listUsersResult = await admin.auth().listUsers();
    
    for (const user of listUsersResult.users) {
      const claims = user.customClaims || {};
      const isAdmin = claims.admin === true;
      
      console.log(`${isAdmin ? '🔑 ADMIN' : '👤 USER'}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Custom Claims:`, JSON.stringify(claims, null, 2));
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

listAllUsers();