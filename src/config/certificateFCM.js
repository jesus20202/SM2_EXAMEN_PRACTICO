const path = require('path');
const admin = require('firebase-admin');

const serviceAccountPath = path.resolve(__dirname, `./keys/${process.env.FILE_FCM_CERTIFICATION}.json`);

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;