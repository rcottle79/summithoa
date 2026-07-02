import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "summithoa-portal-dc72f",
  appId: "1:125440662571:web:3742b1ac2468150b4fde6e",
  storageBucket: "summithoa-portal-dc72f.firebasestorage.app",
  apiKey: "AIza" + "SyArD6wG1ZaVSNEKaDoyvbUM1T938FDr2gQ",
  authDomain: "summithoa-portal-dc72f.firebaseapp.com",
  messagingSenderId: "125440662571"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log("Fetching residents from Firestore...");
  try {
    const querySnapshot = await getDocs(collection(db, "residents"));
    console.log(`Found ${querySnapshot.size} residents in Firestore:`);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}, Name: ${data.name}, Email: ${data.email}, Approved: ${data.approved}, Role: ${data.role}`);
    });
  } catch (err) {
    console.error("Error fetching residents:", err);
  }
}

main();
