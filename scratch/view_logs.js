import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

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
  console.log("Signing in as Admin...");
  try {
    await signInWithEmailAndPassword(auth, 'mchang@hoa-admin.com', 'password123');
    console.log("Signed in successfully. Fetching delivery logs...");
    
    const q = query(collection(db, "deliveryLogs"), orderBy("timestamp", "desc"), limit(15));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      console.log(`[${doc.id}]`, JSON.stringify(doc.data()));
    });
  } catch (err) {
    console.error("Error fetching logs:", err);
  }
  process.exit(0);
}

main();
