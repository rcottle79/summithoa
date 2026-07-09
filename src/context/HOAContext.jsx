import React, { createContext, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  getDoc,
  query,
  where
} from 'firebase/firestore';

export const HOAContext = createContext();

const EMAILJS_SERVICE_ID = 'service_39wk28b';
const EMAILJS_TEMPLATE_ID = 'template_je3n89h'; // Replace this placeholder with your EmailJS Template ID
const EMAILJS_PUBLIC_KEY = '4Zq_wwQeDOh0LHOWW';

emailjs.init({
  publicKey: EMAILJS_PUBLIC_KEY
});

const initialResidents = [
  { id: 'res-1', name: 'Sarah Jenkins', address: '3C', role: 'Board Member', email: 'sjenkins@hoa.community', phone: '(555) 019-2834', bio: 'Community Secretary. Passionate about gardening and keeping our common spaces green.', avatar: '/avatar-female.png', password: 'password123', approved: true },
  { id: 'res-2', name: 'John Smith', address: '1A', role: 'Resident', email: 'jsmith@domain.com', phone: '(555) 012-3847', bio: 'Resident since 2021. Love playing tennis at the community courts.', avatar: '/avatar-male.png', password: 'password123', approved: true },
  { id: 'res-3', name: 'Michael Chang', address: '2B', role: 'Admin', email: 'mchang@hoa-admin.com', phone: '(555) 015-9283', bio: 'HOA System Administrator and Community Manager.', avatar: '/avatar-male.png', password: 'password123', approved: true },
  { id: 'res-4', name: 'Emily Rodriguez', address: '4A', role: 'Resident', email: 'emily.r@gmail.com', phone: '(555) 017-8321', bio: 'Freelance graphic designer. Living here with my two golden retrievers.', avatar: '/avatar-female.png', password: 'password123', approved: true },
  { id: 'res-5', name: 'Marcus Vance', address: '2D', role: 'Board Member', email: 'mvance@hoa.community', phone: '(555) 011-4752', bio: 'HOA Treasurer. Retired accountant. Always happy to discuss community finance.', avatar: '/avatar-male.png', password: 'password123', approved: true }
];

const initialTickets = [
  { id: 't-1', title: 'Main Gate Gatehouse Light Flickering', description: 'The light on the left side of the entrance gatehouse has been flickering constantly. It makes it hard to see code panels at night.', category: 'Electrical', location: 'Main Entrance Gatehouse', urgency: 'Medium', status: 'Open', author: 'Sarah Jenkins', date: '2026-06-25', comments: [] },
  { id: 't-2', title: 'Sprinkler Broken in Courtyard B', description: 'A sprinkler head is completely broken and spraying a geyser of water onto the sidewalk during the watering cycles.', category: 'Landscaping', location: 'Courtyard B near Unit 2B', urgency: 'High', status: 'In Progress', author: 'John Smith', date: '2026-06-24', comments: [{ author: 'Michael Chang', text: 'Landscaping team has been notified. They will be on-site Friday morning to repair it.', date: '2026-06-25' }] },
  { id: 't-3', title: 'Loose Pool Deck Board', description: 'One of the composite wood panels on the east side of the swimming pool deck is loose. It poses a tripping hazard.', category: 'Common Area', location: 'Swimming Pool Area', urgency: 'High', status: 'Resolved', author: 'Marcus Vance', date: '2026-06-20', comments: [{ author: 'Michael Chang', text: 'Maintenance secured the board and verified safety.', date: '2026-06-22' }] }
];

const initialBookings = [
  { id: 'b-1', date: '2026-06-28', slot: '9:00 AM - 12:00 PM', residentName: 'Emily Rodriguez', address: '4A', status: 'Confirmed' },
  { id: 'b-2', date: '2026-06-28', slot: '6:00 PM - 9:00 PM', residentName: 'Sarah Jenkins', address: '3C', status: 'Confirmed' },
  { id: 'b-3', date: '2026-07-02', slot: '6:00 PM - 9:00 PM', residentName: 'John Smith', address: '1A', status: 'Confirmed' }
];

const initialAnnouncements = [
  { id: 'a-1', title: 'Annual Pool Opening & BBQ Event', content: 'Join us this Saturday, July 4th, for the annual community pool reopening! The HOA will provide burgers and drinks. Feel free to bring a side dish to share. Event runs from 1:00 PM to 5:00 PM.', category: 'Event', author: 'Sarah Jenkins', date: '2026-06-26' },
  { id: 'a-2', title: 'Road Repaving Project Schedule', content: 'Driveway paving in the North Lot will begin next Tuesday, June 30th. Please park in visitor spaces if your car is normally in the North Lot. Work is scheduled from 8:00 AM to 6:00 PM daily. Expect brief delays.', category: 'Maintenance', author: 'Michael Chang', date: '2026-06-24' }
];

const initialArcRequests = [
  {
    id: 'arc-1',
    residentId: 'res-2',
    residentName: 'John Smith',
    address: '1A',
    email: 'jsmith@domain.com',
    phone: '(555) 012-3847',
    projectType: 'Deck',
    description: 'Constructing a 12x16 foot pressure-treated wooden deck at the rear of the property. The deck will not extend past the side building line and matches original design options.',
    date: '2026-06-24',
    documents: [
      { name: 'survey_map_1A.pdf', size: '1.2 MB' },
      { name: 'deck_plan_draft.jpg', size: '2.4 MB' }
    ],
    status: 'Pending',
    reviewerNotes: ''
  }
];

export const HOAProvider = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('hoa_isAuthenticated');
    return saved ? JSON.parse(saved) : false;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hoa_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Master LocalStorage / State Cache
  const [residents, setResidents] = useState(() => {
    const saved = localStorage.getItem('hoa_residents');
    return saved ? JSON.parse(saved) : initialResidents;
  });

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('hoa_tickets');
    return saved ? JSON.parse(saved) : initialTickets;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('hoa_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('hoa_announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [arcRequests, setArcRequests] = useState(() => {
    const saved = localStorage.getItem('hoa_arc_requests');
    return saved ? JSON.parse(saved) : initialArcRequests;
  });

  const [deliveryLogs, setDeliveryLogs] = useState(() => {
    const saved = localStorage.getItem('hoa_deliveryLogs');
    return saved ? JSON.parse(saved) : [
      `[SYSTEM] HOA System Online - 2026-06-28 08:24:14`,
      `[DATABASE] Local fallback database loaded successfully.`
    ];
  });

  // Sync state mutations to LocalStorage for persistence in fallback/local mode
  useEffect(() => {
    localStorage.setItem('hoa_isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('hoa_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hoa_residents', JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem('hoa_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('hoa_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('hoa_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('hoa_deliveryLogs', JSON.stringify(deliveryLogs));
  }, [deliveryLogs]);

  useEffect(() => {
    localStorage.setItem('hoa_arc_requests', JSON.stringify(arcRequests));
  }, [arcRequests]);

  // Subscribe to real-time updates and seed if empty
  useEffect(() => {
    const unsubscribeResidents = onSnapshot(collection(db, 'residents'), (snapshot) => {
      if (snapshot.empty) {
        initialResidents.forEach(res => {
          setDoc(doc(db, 'residents', res.id), res).catch(e => {});
        });
      } else {
        const loaded = snapshot.docs.map(doc => doc.data());
        setResidents(loaded);
      }
    }, (error) => {
      console.warn("Residents subscription failed, loading local storage cache:", error);
    });

    const unsubscribeAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      if (snapshot.empty) {
        initialAnnouncements.forEach(ann => {
          setDoc(doc(db, 'announcements', ann.id), ann).catch(e => {});
        });
      } else {
        const loaded = snapshot.docs.map(doc => doc.data());
        loaded.sort((a, b) => b.id.localeCompare(a.id));
        setAnnouncements(loaded);
      }
    }, (error) => {
      console.warn("Announcements subscription failed, loading local storage cache:", error);
    });

    // Secured subscriptions - only initialize if user is authenticated
    let unsubscribeTickets = () => {};
    let unsubscribeBookings = () => {};
    let unsubscribeArcRequests = () => {};
    let unsubscribeLogs = () => {};

    if (currentUser) {
      unsubscribeTickets = onSnapshot(collection(db, 'tickets'), (snapshot) => {
        if (snapshot.empty) {
          initialTickets.forEach(ticket => {
            setDoc(doc(db, 'tickets', ticket.id), ticket).catch(e => {});
          });
        } else {
          const loaded = snapshot.docs.map(doc => doc.data());
          setTickets(loaded);
        }
      }, (error) => {
        console.warn("Tickets subscription failed, loading local storage cache:", error);
      });

      unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
        if (snapshot.empty) {
          initialBookings.forEach(booking => {
            setDoc(doc(db, 'bookings', booking.id), booking).catch(e => {});
          });
        } else {
          const loaded = snapshot.docs.map(doc => doc.data());
          setBookings(loaded);
        }
      }, (error) => {
        console.warn("Bookings subscription failed, loading local storage cache:", error);
      });

      unsubscribeArcRequests = onSnapshot(collection(db, 'arcRequests'), (snapshot) => {
        if (snapshot.empty) {
          initialArcRequests.forEach(req => {
            setDoc(doc(db, 'arcRequests', req.id), req).catch(e => {});
          });
        } else {
          const loaded = snapshot.docs.map(doc => doc.data());
          setArcRequests(loaded);
        }
      }, (error) => {
        console.warn("ARC requests subscription failed, loading local storage cache:", error);
      });

      unsubscribeLogs = onSnapshot(collection(db, 'deliveryLogs'), (snapshot) => {
        if (snapshot.empty) {
          const initialLogs = [
            `[SYSTEM] HOA System Online - 2026-06-28 08:24:14`,
            `[DATABASE] Local database sync enabled.`
          ];
          initialLogs.forEach((logText, index) => {
            setDoc(doc(db, 'deliveryLogs', `log-${index}-${Date.now()}`), { text: logText, timestamp: Date.now() + index }).catch(e => {});
          });
        } else {
          const loaded = snapshot.docs.map(doc => doc.data());
          loaded.sort((a, b) => b.timestamp - a.timestamp);
          setDeliveryLogs(loaded.map(l => l.text));
        }
      }, (error) => {
        console.warn("Logs subscription failed, loading local storage cache:", error);
      });
    }

    return () => {
      unsubscribeResidents();
      unsubscribeTickets();
      unsubscribeBookings();
      unsubscribeAnnouncements();
      unsubscribeArcRequests();
      unsubscribeLogs();
    };
  }, [currentUser]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'residents', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.approved) {
              setCurrentUser(userData);
              setIsAuthenticated(true);
            } else {
              // Clear local state without calling signOut to prevent race condition hangs
              setCurrentUser(null);
              setIsAuthenticated(false);
            }
          }
        } catch (e) {
          console.warn("onAuthStateChanged profile sync failed:", e);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Log message helper
  const addLog = async (message) => {
    const timestamp = Date.now();
    const timeString = new Date().toLocaleTimeString();
    
    // Add locally immediately
    setDeliveryLogs(prev => [`[${timeString}] ${message}`, ...prev]);

    try {
      await setDoc(doc(db, 'deliveryLogs', `log-${timestamp}`), {
        text: `[${timeString}] ${message}`,
        timestamp
      });
    } catch (e) {
      // Ignore database logging failures in offline/pending mode
    }
  };

  const clearLogs = async () => {
    setDeliveryLogs([`[SYSTEM] Logs cleared.`]);
    try {
      const snapshot = await getDocs(collection(db, 'deliveryLogs'));
      snapshot.forEach(async (d) => {
        await deleteDoc(doc(db, 'deliveryLogs', d.id));
      });
      await setDoc(doc(db, 'deliveryLogs', `log-${Date.now()}`), {
        text: `[SYSTEM] Logs cleared.`,
        timestamp: Date.now()
      });
    } catch (e) {
      // Ignore database clears in offline mode
    }
  };

  // Auth Operations
  const login = async (email, password) => {
    try {
      // 1. Try Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, 'residents', firebaseUser.uid));
      if (!userDoc.exists()) {
        const q = query(collection(db, 'residents'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          await signOut(auth);
          throw new Error("No resident profile found for this authenticated account.");
        }

        const residentData = querySnapshot.docs[0].data();
        await setDoc(doc(db, 'residents', firebaseUser.uid), {
          ...residentData,
          id: firebaseUser.uid
        });
        await deleteDoc(doc(db, 'residents', residentData.id));

        if (!residentData.approved) {
          await signOut(auth);
          throw new Error("Your account is currently pending administrator approval.");
        }

        setCurrentUser({ ...residentData, id: firebaseUser.uid });
        setIsAuthenticated(true);
        await addLog(`[AUTH] Resident ${residentData.name} signed in successfully.`);
        return { ...residentData, id: firebaseUser.uid };
      }

      const foundUser = userDoc.data();
      if (!foundUser.approved) {
        await signOut(auth);
        throw new Error("Your account is currently pending administrator approval.");
      }

      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      await addLog(`[AUTH] Resident ${foundUser.name} signed in successfully.`);
      return foundUser;
    } catch (err) {
      console.warn("Firebase Auth signin failed. Attempting local memory fallback:", err);

      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      // Local fallback password check only on localhost
      if (isLocalhost) {
        const foundUser = residents.find(r => r.email.toLowerCase() === email.toLowerCase());
        if (foundUser) {
          if (foundUser.approved === false) {
            throw new Error("Your account is currently pending administrator approval.");
          }
          if (foundUser.password === password) {
            setCurrentUser(foundUser);
            setIsAuthenticated(true);
            addLog(`[AUTH] Resident ${foundUser.name} signed in locally (Fallback mode).`).catch(e => {});
            return foundUser;
          }
        }
      }

      if (err.code === 'auth/network-request-failed' || (err.message && err.message.includes('network'))) {
        throw new Error("Network connection to database failed. If you have an adblocker, VPN, or firewall active, please disable it and try again.");
      }

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error("Incorrect email address or password. Please try again.");
      }
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error("Email/Password logins are not enabled. Please enable the Email/Password provider under Authentication > Sign-in method in your Firebase Console.");
      }
      throw new Error(err.message || String(err) || "An authentication error occurred.");
    }
  };

  const quickLogin = async (role) => {
    let email = '';
    let mockId = '';
    if (role === 'Admin') {
      email = 'mchang@hoa-admin.com';
      mockId = 'res-3';
    } else if (role === 'Board Member') {
      email = 'sjenkins@hoa.community';
      mockId = 'res-1';
    } else {
      email = 'jsmith@domain.com';
      mockId = 'res-2';
    }

    try {
      const templateResident = initialResidents.find(r => r.id === mockId) || initialResidents[0];
      let userCredential;
      
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, 'password123');
      } catch (err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          // Provision in Firebase Auth on the fly
          userCredential = await createUserWithEmailAndPassword(auth, email, 'password123');
          const firebaseUser = userCredential.user;
          const newProfile = {
            ...templateResident,
            id: firebaseUser.uid
          };
          await setDoc(doc(db, 'residents', firebaseUser.uid), newProfile).catch(e => {});
        } else {
          throw err;
        }
      }

      const firebaseUser = userCredential.user;
      const userDoc = await getDoc(doc(db, 'residents', firebaseUser.uid));
      const activeUser = userDoc.exists() ? userDoc.data() : { ...templateResident, id: firebaseUser.uid };

      setCurrentUser(activeUser);
      setIsAuthenticated(true);
      await addLog(`[AUTH] Quick-Login triggered. Authenticated as ${activeUser.name} (${activeUser.role}) via Firebase Auth.`);
    } catch (err) {
      console.warn("Quick login failed, falling back to local credentials:", err);
      const foundUser = residents.find(r => r.email.toLowerCase() === email.toLowerCase()) || residents[0];
      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      addLog(`[AUTH] Quick-Login fallback triggered locally for ${foundUser.name}.`).catch(e => {});
    }
  };

  const signup = async (name, email, phone, address, bio, avatar, role, password) => {
    // Pre-emptively check if email is already in use in our residents database
    const emailExists = residents.some(r => r.email && r.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      throw new Error("An account already exists with this email.");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newResident = {
        id: firebaseUser.uid,
        name,
        email,
        phone,
        address,
        bio,
        avatar,
        role,
        password,
        approved: false
      };

      await setDoc(doc(db, 'residents', firebaseUser.uid), newResident);
      await addLog(`[AUTH] Created new account for ${name} (Street Address: ${address}) in Firebase Auth. Pending administrator approval.`);
      await signOut(auth); // Sign out after logging and logging in Firebase
      return newResident;
    } catch (err) {
      console.warn("Firebase Auth Signup failed:", err);

      if (err.code === 'auth/email-already-in-use') {
        try {
          // Limbo state check: Does a profile document actually exist in Firestore?
          const q = query(collection(db, 'residents'), where('email', '==', email));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // Limbo state detected! Auth account exists but resident profile document was deleted.
            // Attempt to sign in in the background with the submitted credentials
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            const newResident = {
              id: firebaseUser.uid,
              name,
              email,
              phone,
              address,
              bio,
              avatar,
              role,
              password,
              approved: false
            };

            await setDoc(doc(db, 'residents', firebaseUser.uid), newResident);
            await addLog(`[AUTH] Healed profile mismatch/limbo state for ${name} (Street Address: ${address}). Pending administrator approval.`);
            await signOut(auth);
            return newResident;
          } else {
            throw new Error("An account already exists with this email.");
          }
        } catch (healErr) {
          if (healErr.message === "An account already exists with this email.") {
            throw healErr;
          }
          console.error("Heal limbo state failed:", healErr);
          throw new Error("An account already exists with this email address in Firebase Authentication. If you previously registered, please log in or contact the administrator.");
        }
      }
      if (err.code === 'auth/weak-password') {
        throw new Error("Password must be at least 6 characters long.");
      }
      if (err.code === 'auth/invalid-email') {
        throw new Error("Please enter a valid email address.");
      }
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error("Email/Password registration is not enabled. Please enable the Email/Password provider under Authentication > Sign-in method in your Firebase Console.");
      }

      // Local fallback signup only if it is a connection/network issue on localhost
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost && (
          err.code === 'auth/network-request-failed' || 
          (err.message && err.message.includes('network')) || 
          (err.message && err.message.includes('configuration'))
      )) {
        
        const emailExists = residents.some(r => r && r.email && typeof r.email === 'string' && email && r.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          throw new Error("An account already exists with this email.");
        }

        const id = `res-${Date.now()}`;
        const newResident = {
          id,
          name,
          email,
          phone,
          address,
          bio,
          avatar,
          role,
          password,
          approved: false
        };

        setResidents(prev => [...prev, newResident]);
        addLog(`[AUTH] Created new account for ${name} (Street Address: ${address}) locally. Pending approval.`).catch(e => {});
        return newResident;
      }

      if (err.code === 'auth/network-request-failed' || (err.message && err.message.includes('network'))) {
        throw new Error("Network connection to database failed. If you have an adblocker, VPN, or firewall active, please disable it and try again.");
      }

      throw new Error(err.message || String(err) || "An account creation error occurred.");
    }
  };

  const logout = async () => {
    const name = currentUser ? currentUser.name : 'Unknown';
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase signout failed:", err);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    await addLog(`[AUTH] User ${name} logged out.`);
  };

  const resetPasswordEmail = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      await addLog(`[AUTH] Dispatched password reset link to ${email}.`);
    } catch (err) {
      console.warn("Password reset dispatch failed:", err);
      if (err.code === 'auth/user-not-found') {
        throw new Error("No account exists with this email address.");
      }
      if (err.code === 'auth/invalid-email') {
        throw new Error("Please enter a valid email address.");
      }
      throw new Error(err.message || String(err) || "Failed to dispatch password reset link.");
    }
  };

  const changePassword = async (newPassword) => {
    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to change your password.");
      }
      await updatePassword(auth.currentUser, newPassword);

      // Also update the password field in the Firestore residents document for fallback/local compliance
      const userRef = doc(db, 'residents', auth.currentUser.uid);
      await updateDoc(userRef, { password: newPassword });

      // Update local state and cache
      setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
      setResidents(prev => prev.map(r => r.id === auth.currentUser.uid ? { ...r, password: newPassword } : r));

      await addLog(`[AUTH] Updated account password securely.`);
    } catch (err) {
      console.warn("Password change failed:", err);
      if (err.code === 'auth/requires-recent-login') {
        throw new Error("For security reasons, changing your password requires recent authentication. Please sign out and sign back in, then try again.");
      }
      if (err.code === 'auth/weak-password') {
        throw new Error("Password must be at least 6 characters long.");
      }
      throw new Error(err.message || String(err) || "Failed to update password.");
    }
  };

  // Profile Operations
  const updateProfile = async (updatedProfile) => {
    try {
      await setDoc(doc(db, 'residents', updatedProfile.id), updatedProfile);
      // Local state sync only if write succeeds
      setResidents(prev => prev.map(r => r.id === updatedProfile.id ? updatedProfile : r));
      if (currentUser && currentUser.id === updatedProfile.id) {
        setCurrentUser(updatedProfile);
      }
      await addLog(`[PROFILE] Updated user profile for ${updatedProfile.name}.`);
    } catch (err) {
      console.warn("Profile update to Firestore failed:", err);
      if (err.code === 'unavailable' || err.message.includes('network')) {
        setResidents(prev => prev.map(r => r.id === updatedProfile.id ? updatedProfile : r));
        if (currentUser && currentUser.id === updatedProfile.id) {
          setCurrentUser(updatedProfile);
        }
      } else {
        throw new Error(`Failed to update profile: ${err.message}`);
      }
    }
  };

  // Support Ticket Operations
  const addTicket = async (title, description, category, location, urgency) => {
    const id = `t-${Date.now()}`;
    const newTicket = {
      id,
      title,
      description,
      category,
      location,
      urgency,
      status: 'Open',
      author: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      comments: []
    };

    try {
      await setDoc(doc(db, 'tickets', id), newTicket);
      await addLog(`[SUPPORT] Support ticket "${title}" filed by ${currentUser.name}.`);
    } catch (err) {
      console.warn("Failed to write support ticket to Firestore:", err);
      if (err.code === 'unavailable' || err.message.includes('network')) {
        setTickets(prev => [newTicket, ...prev]);
        await addLog(`[SUPPORT] Support ticket "${title}" filed locally (Offline) by ${currentUser.name}.`);
        return newTicket;
      }
      throw new Error(`Failed to submit support ticket: ${err.message}`);
    }
    return newTicket;
  };

  const updateTicketStatus = async (ticketId, newStatus, commentText = '') => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const updatedComments = [...(ticket.comments || [])];
    if (commentText.trim()) {
      updatedComments.push({
        author: currentUser.name,
        text: commentText,
        date: new Date().toISOString().split('T')[0]
      });
    }

    // Update locally
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus, comments: updatedComments } : t));

    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status: newStatus,
        comments: updatedComments
      });
    } catch (err) {
      console.warn("Failed to update support ticket in Firestore. Saved locally.", err);
    }
    await addLog(`[SUPPORT] Ticket #${ticketId} status updated to "${newStatus}" by ${currentUser.name}.`);
  };

  const deleteTicket = async (ticketId) => {
    // Update locally
    setTickets(prev => prev.filter(t => t.id !== ticketId));

    try {
      await deleteDoc(doc(db, 'tickets', ticketId));
    } catch (err) {
      console.warn("Failed to delete support ticket in Firestore. Deleted locally.", err);
    }
    await addLog(`[SUPPORT] Support Ticket #${ticketId} was deleted by Admin.`);
  };

  // Resident Manager Operations
  const changeResidentRole = async (residentId, newRole) => {
    // Update locally
    setResidents(prev => prev.map(res => {
      if (res.id === residentId) {
        const updated = { ...res, role: newRole };
        if (currentUser && currentUser.id === residentId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return res;
    }));

    try {
      await updateDoc(doc(db, 'residents', residentId), { role: newRole });
    } catch (err) {
      console.warn("Failed to change resident role in Firestore. Updated locally.", err);
    }
    await addLog(`[ADMIN] Resident #${residentId} role updated to "${newRole}".`);
  };

  const approveResident = async (residentId) => {
    // Update locally
    setResidents(prev => prev.map(res => res.id === residentId ? { ...res, approved: true } : res));

    try {
      await updateDoc(doc(db, 'residents', residentId), { approved: true });
    } catch (err) {
      console.warn("Failed to approve resident in Firestore. Approved locally.", err);
    }
    await addLog(`[ADMIN] Resident #${residentId} account approved by administrator.`);
  };

  const denyResident = async (residentId) => {
    // Update locally
    setResidents(prev => prev.filter(res => res.id !== residentId));

    try {
      await deleteDoc(doc(db, 'residents', residentId));
    } catch (err) {
      console.warn("Failed to deny resident in Firestore. Denied locally.", err);
    }
    await addLog(`[ADMIN] Resident "${residentId}" denied & deleted by administrator.`);
  };

  const deleteResident = async (residentId) => {
    // Update locally
    setResidents(prev => prev.filter(res => res.id !== residentId));

    try {
      await deleteDoc(doc(db, 'residents', residentId));
    } catch (err) {
      console.warn("Failed to delete resident in Firestore. Deleted locally.", err);
    }
    await addLog(`[ADMIN] Resident "${residentId}" permanently deleted by administrator.`);
  };

  // Clubhouse Booking Operations
  const addBooking = async (date, slot) => {
    const isDoubleBooked = bookings.some(b => b.date === date && b.slot === slot);
    if (isDoubleBooked) {
      throw new Error("This timeslot is already booked.");
    }

    const id = `b-${Date.now()}`;
    const newBooking = {
      id,
      date,
      slot,
      residentName: currentUser.name,
      address: currentUser.address,
      status: 'Confirmed'
    };

    try {
      await setDoc(doc(db, 'bookings', id), newBooking);
      await addLog(`[CALENDAR] Clubhouse booked for ${date} during ${slot} by ${currentUser.name}.`);
    } catch (err) {
      console.warn("Failed to write booking to Firestore:", err);
      if (err.code === 'unavailable' || err.message.includes('network')) {
        setBookings(prev => [...prev, newBooking]);
        await addLog(`[CALENDAR] Clubhouse booked locally (Offline) for ${date} during ${slot}.`);
        return newBooking;
      }
      throw new Error(`Failed to save reservation: ${err.message}`);
    }
    
    // Dispatch simulated notification email to board@summithoa.com
    const emailDetails = `
=== SIMULATED SMTP DISPATCH ===
To: board@summithoa.com
From: system@summithoa.com
Subject: New Clubhouse Booking Alert - ${currentUser.name}
Body:
Dear SummitHOA Board,

A new clubhouse reservation has been placed by a resident:
- Resident Name: ${currentUser.name}
- Street Address: ${currentUser.address}
- Selected Date: ${date}
- Timeslot: ${slot}
- Status: Confirmed

This is an automated notification email sent from SummitHOA Portal.
=================================`;
    console.log(emailDetails);
    await addLog(`[EMAIL] Simulated booking confirmation notice dispatched to board@summithoa.com`).catch(e => {});
    
    return newBooking;
  };

  const cancelBooking = async (bookingId) => {
    // Update locally
    setBookings(prev => prev.filter(b => b.id !== bookingId));

    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
    } catch (err) {
      console.warn("Failed to cancel booking in Firestore. Cancelled locally.", err);
    }
    await addLog(`[CALENDAR] Booking ${bookingId} cancelled.`);
  };

  // Announcements Operations
  const addAnnouncement = async (title, content, category, channels, eventDate = '', eventTime = '', image = '') => {
    const id = `a-${Date.now()}`;
    const newAnnouncement = {
      id,
      title,
      content,
      category,
      eventDate,
      eventTime,
      image,
      author: currentUser.name,
      date: new Date().toISOString().split('T')[0]
    };

    if (channels.website) {
      try {
        await setDoc(doc(db, 'announcements', id), newAnnouncement);
        await addLog(`[WEBSITE] Announcement "${title}" published to public feed.`);
      } catch (err) {
        console.warn("Failed to write announcement to Firestore:", err);
        if (err.code === 'unavailable' || err.message.includes('network')) {
          setAnnouncements(prev => [newAnnouncement, ...prev]);
          await addLog(`[WEBSITE] Announcement "${title}" published locally (Offline).`);
        } else {
          throw new Error(`Failed to publish announcement: ${err.message}`);
        }
      }
    }

    const totalResidents = residents.length;
    
    if (channels.email) {
      await addLog(`[EMAIL] Dispatching email broadcasts to ${totalResidents} residents via EmailJS...`);
      residents.forEach(async (res) => {
        if (res.email) {
          try {
            await emailjs.send(
              EMAILJS_SERVICE_ID,
              EMAILJS_TEMPLATE_ID,
              {
                resident_name: res.name,
                resident_email: res.email,
                title: title,
                content: content,
                author: currentUser.name,
                category: category,
                flyer_image: image || ''
              },
              {
                publicKey: EMAILJS_PUBLIC_KEY
              }
            );
            await addLog(`[EMAIL] EmailJS dispatched notice to ${res.name} (${res.email})`);
          } catch (e) {
            console.error("EmailJS sending failed for " + res.email, e);
            await addLog(`[EMAIL] EmailJS failed for ${res.name}: ${e.text || e.message || e}`);
          }
        }
      });
    }

    return newAnnouncement;
  };

  const deleteAnnouncement = async (announcementId) => {
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
      // Update locally only if write succeeds
      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
      await addLog(`[ADMIN] Announcement "${announcementId}" deleted by administrator.`);
    } catch (err) {
      console.warn("Failed to delete announcement in Firestore:", err);
      if (err.code === 'unavailable' || err.message.includes('network')) {
        setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
      } else {
        throw new Error(`Failed to delete announcement: ${err.message}`);
      }
    }
  };

  const updateAnnouncement = async (id, updatedFields) => {
    try {
      await updateDoc(doc(db, 'announcements', id), updatedFields);
      // Update locally only if write succeeds
      setAnnouncements(prev => prev.map(ann => ann.id === id ? { ...ann, ...updatedFields } : ann));
      await addLog(`[WEBSITE] Announcement "${id}" updated.`);
    } catch (err) {
      console.warn("Failed to update announcement in Firestore:", err);
      if (err.code === 'unavailable' || err.message.includes('network')) {
        setAnnouncements(prev => prev.map(ann => ann.id === id ? { ...ann, ...updatedFields } : ann));
      } else {
        throw new Error(`Failed to update announcement: ${err.message}`);
      }
    }
  };

  // ARC Requests Operations
  const addArcRequest = async (projectType, description, documents) => {
    const id = `arc-${Date.now()}`;
    const newRequest = {
      id,
      residentId: currentUser.id,
      residentName: currentUser.name,
      address: currentUser.address,
      email: currentUser.email,
      phone: currentUser.phone,
      projectType,
      description,
      date: new Date().toISOString().split('T')[0],
      documents,
      status: 'Pending',
      reviewerNotes: ''
    };

    try {
      await setDoc(doc(db, 'arcRequests', id), newRequest);
      await addLog(`[ARC] New Architectural Review Request filed by ${currentUser.name} for a ${projectType}.`);
    } catch (err) {
      console.warn("Failed to write ARC request to Firestore:", err);
      if (err.code === 'unavailable' || err.message.includes('network')) {
        setArcRequests(prev => [newRequest, ...prev]);
        await addLog(`[ARC] ARC request for ${projectType} filed locally (Offline) by ${currentUser.name}.`);
        return newRequest;
      }
      throw new Error(`Failed to submit ARC request: ${err.message}`);
    }
    
    // Dispatch simulated notification email to board@summithoa.com
    const docList = documents && documents.length > 0 
      ? documents.map(d => `${d.name} (${d.size})`).join(', ') 
      : 'None';
      
    const emailDetails = `
=== SIMULATED SMTP DISPATCH ===
To: board@summithoa.com
From: system@summithoa.com
Subject: New ARC Modification Request: ${projectType} - Address ${currentUser.address}
Body:
Dear SummitHOA Board,

A new Architectural Review Request has been submitted by a resident:
- Resident Name: ${currentUser.name}
- Street Address: ${currentUser.address}
- Filer Contact: Email: ${currentUser.email} | Phone: ${currentUser.phone}
- Modification Classification: ${projectType}
- Project Description: ${description}
- Supporting Documents: ${docList}
- Date Filed: ${newRequest.date}
- Status: Pending Board Review

This is an automated notification email sent from SummitHOA Portal.
=================================`;
    console.log(emailDetails);
    await addLog(`[EMAIL] Simulated ARC request details dispatched to board@summithoa.com`).catch(e => {});
    
    return newRequest;
  };

  const updateArcRequestStatus = async (requestId, status, reviewerNotes) => {
    // Update locally
    setArcRequests(prev => prev.map(req => req.id === requestId ? { ...req, status, reviewerNotes } : req));

    try {
      await updateDoc(doc(db, 'arcRequests', requestId), { status, reviewerNotes });
    } catch (err) {
      console.warn("Failed to update ARC request in Firestore. Updated locally.", err);
    }
    await addLog(`[ARC] Request "${requestId}" updated to status "${status}" by administrator.`);
  };

  return (
    <HOAContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        residents,
        tickets,
        bookings,
        announcements,
        deliveryLogs,
        login,
        quickLogin,
        signup,
        logout,
        resetPasswordEmail,
        changePassword,
        updateProfile,
        addTicket,
        updateTicketStatus,
        deleteTicket,
        changeResidentRole,
        approveResident,
        denyResident,
        deleteResident,
        addBooking,
        cancelBooking,
        addAnnouncement,
        deleteAnnouncement,
        updateAnnouncement,
        clearLogs,
        arcRequests,
        addArcRequest,
        updateArcRequestStatus
      }}
    >
      {children}
    </HOAContext.Provider>
  );
};
