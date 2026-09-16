import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');
import firebaseConfig from '../firebase-applet-config.json';

async function seedAdmin() {
  const adminApp = !getApps().length ? initializeApp({
    projectId: firebaseConfig.projectId
  }) : getApps()[0];

  const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);

  try {
    const passwordHash = await bcrypt.hash('guitarmm@2017', 10);
    console.log('Password hashed successfully');
    
    await db.collection('admins').doc('admin').set({
      passwordHash
    });
    console.log('Admin seeded successfully');
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

seedAdmin();
