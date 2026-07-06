import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

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

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address as an argument. Example: node scratch/test_password_reset.js board@summithoa.com");
  process.exit(1);
}

async function main() {
  console.log(`Attempting to dispatch password reset email to: ${email}...`);
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("SUCCESS: Firebase Auth sendPasswordResetEmail API resolved successfully!");
  } catch (err) {
    console.error("FAILURE: sendPasswordResetEmail threw an error:", err);
  }
  process.exit(0);
}

main();
