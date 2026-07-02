import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function testSignup() {
  const email = `test_${Date.now()}@summithoa.com`;
  const password = "password123";
  console.log(`Attempting to signup user: ${email} with password: ${password}`);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log("Firebase Auth User created successfully! UID:", firebaseUser.uid);

    const newResident = {
      id: firebaseUser.uid,
      name: "Test User",
      email,
      phone: "(555) 123-4567",
      address: "2B",
      bio: "This is a test user bio",
      avatar: "/avatar-male.png",
      role: "Resident",
      password,
      approved: false
    };

    console.log("Writing resident profile to Firestore...");
    await setDoc(doc(db, 'residents', firebaseUser.uid), newResident);
    console.log("Resident document written to Firestore successfully!");
  } catch (err) {
    console.error("Signup failed with error:", err.code, err.message);
  }
}

testSignup();
