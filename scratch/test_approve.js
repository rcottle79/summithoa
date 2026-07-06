import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "summithoa-portal-dc72f",
  appId: "1:125440662571:web:3742b1ac2468150b4fde6e",
  storageBucket: "summithoa-portal-dc72f.firebasestorage.app",
  apiKey: "AIza" + "SyArD6wG1ZaVSNEKaDoyvbUM1T938FDr2gQ",
  authDomain: "summithoa-portal-dc72f.firebaseapp.com",
  messagingSenderId: "125440662571"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  console.log("Signing in as Admin (mchang@hoa-admin.com)...");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'mchang@hoa-admin.com', 'password123');
    console.log(`Signed in successfully! UID: ${userCredential.user.uid}`);
    
    console.log("Fetching residents...");
    const querySnapshot = await getDocs(collection(db, "residents"));
    const residents = [];
    querySnapshot.forEach(doc => {
      residents.push({ id: doc.id, ...doc.data() });
    });
    
    const pending = residents.find(r => r.approved === false);
    if (!pending) {
      console.log("No pending residents found in database to test approval on.");
      process.exit(0);
    }
    
    console.log(`Attempting to approve resident: ${pending.name} (ID: ${pending.id})...`);
    await updateDoc(doc(db, 'residents', pending.id), { approved: true });
    console.log("SUCCESS: Firestore approved field updated successfully!");
    
  } catch (err) {
    console.error("ERROR during approval test:", err);
  }
  process.exit(0);
}

main();
