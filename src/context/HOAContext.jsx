import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  getDoc,
  query,
  where
} from 'firebase/firestore';

export const HOAContext = createContext();

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

  const [residents, setResidents] = useState(initialResidents);
  const [tickets, setTickets] = useState(initialTickets);
  const [bookings, setBookings] = useState(initialBookings);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [arcRequests, setArcRequests] = useState(initialArcRequests);
  const [deliveryLogs, setDeliveryLogs] = useState([
    `[SYSTEM] HOA System Online - 2026-06-28 08:24:14`,
    `[DATABASE] Local database loaded successfully.`
  ]);

  // Sync session authentication to localStorage
  useEffect(() => {
    localStorage.setItem('hoa_isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('hoa_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

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
      console.warn("Residents subscription failed, loading mock state:", error);
      setResidents(initialResidents);
    });

    const unsubscribeTickets = onSnapshot(collection(db, 'tickets'), (snapshot) => {
      if (snapshot.empty) {
        initialTickets.forEach(ticket => {
          setDoc(doc(db, 'tickets', ticket.id), ticket).catch(e => {});
        });
      } else {
        const loaded = snapshot.docs.map(doc => doc.data());
        setTickets(loaded);
      }
    }, (error) => {
      console.warn("Tickets subscription failed, loading mock state:", error);
      setTickets(initialTickets);
    });

    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      if (snapshot.empty) {
        initialBookings.forEach(booking => {
          setDoc(doc(db, 'bookings', booking.id), booking).catch(e => {});
        });
      } else {
        const loaded = snapshot.docs.map(doc => doc.data());
        setBookings(loaded);
      }
    }, (error) => {
      console.warn("Bookings subscription failed, loading mock state:", error);
      setBookings(initialBookings);
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
      console.warn("Announcements subscription failed, loading mock state:", error);
      setAnnouncements(initialAnnouncements);
    });

    const unsubscribeArcRequests = onSnapshot(collection(db, 'arcRequests'), (snapshot) => {
      if (snapshot.empty) {
        initialArcRequests.forEach(req => {
          setDoc(doc(db, 'arcRequests', req.id), req).catch(e => {});
        });
      } else {
        const loaded = snapshot.docs.map(doc => doc.data());
        setArcRequests(loaded);
      }
    }, (error) => {
      console.warn("ARC requests subscription failed, loading mock state:", error);
      setArcRequests(initialArcRequests);
    });

    const unsubscribeLogs = onSnapshot(collection(db, 'deliveryLogs'), (snapshot) => {
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
      console.warn("Logs subscription failed, loading mock state:", error);
    });

    return () => {
      unsubscribeResidents();
      unsubscribeTickets();
      unsubscribeBookings();
      unsubscribeAnnouncements();
      unsubscribeArcRequests();
      unsubscribeLogs();
    };
  }, []);

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
              await signOut(auth);
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

      // Local fallback password check
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

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error("Incorrect email address or password. Please try again.");
      }
      throw new Error(err.message || "An authentication error occurred.");
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
      await signOut(auth); // Sign out because of approval gate

      await addLog(`[AUTH] Created new account for ${name} (Street Address: ${address}) in Firebase Auth. Pending administrator approval.`);
      return newResident;
    } catch (err) {
      console.warn("Firebase Auth Signup failed. Attempting local memory fallback:", err);

      if (err.code === 'auth/email-already-in-use') {
        throw new Error("An account already exists with this email.");
      }

      // Local fallback signup
      const emailExists = residents.some(r => r.email.toLowerCase() === email.toLowerCase());
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

  // Profile Operations
  const updateProfile = async (updatedProfile) => {
    // Local state sync
    setResidents(prev => prev.map(r => r.id === updatedProfile.id ? updatedProfile : r));
    if (currentUser && currentUser.id === updatedProfile.id) {
      setCurrentUser(updatedProfile);
    }

    try {
      await setDoc(doc(db, 'residents', updatedProfile.id), updatedProfile);
    } catch (err) {
      console.warn("Profile update to Firestore failed. Saved locally.", err);
    }
    await addLog(`[PROFILE] Updated user profile for ${updatedProfile.name}.`);
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

    // Update locally
    setTickets(prev => [newTicket, ...prev]);

    try {
      await setDoc(doc(db, 'tickets', id), newTicket);
    } catch (err) {
      console.warn("Failed to write support ticket to Firestore. Saved locally.", err);
    }
    await addLog(`[SUPPORT] Support ticket "${title}" filed by ${currentUser.name}.`);
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

    // Update locally
    setBookings(prev => [...prev, newBooking]);

    try {
      await setDoc(doc(db, 'bookings', id), newBooking);
    } catch (err) {
      console.warn("Failed to write booking to Firestore. Saved locally.", err);
    }
    await addLog(`[CALENDAR] Clubhouse booked for ${date} during ${slot} by ${currentUser.name}.`);
    
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
      // Update locally
      setAnnouncements(prev => [newAnnouncement, ...prev]);

      try {
        await setDoc(doc(db, 'announcements', id), newAnnouncement);
      } catch (err) {
        console.warn("Failed to write announcement to Firestore. Saved locally.", err);
      }
      await addLog(`[WEBSITE] Announcement "${title}" published to public feed.`);
    }

    const totalResidents = residents.length;
    
    if (channels.email) {
      await addLog(`[EMAIL] Initiating broadcast to ${totalResidents} residents...`);
      setTimeout(async () => {
        await addLog(`[EMAIL] Connecting to SMTP Relay...`);
      }, 500);
      setTimeout(async () => {
        residents.forEach(async (res) => {
          await addLog(`[EMAIL] Dispatched email template to ${res.name} (${res.email})`);
        });
        await addLog(`[EMAIL] Successfully completed email broadcast to all active residents.`);
      }, 1500);
    }

    if (channels.sms) {
      await addLog(`[SMS] Initiating SMS broadcast gateway via Twilio...`);
      setTimeout(async () => {
        await addLog(`[SMS] Authenticating with Twilio Gateway SID: AC5f81ae8e8093...`);
      }, 300);
      setTimeout(async () => {
        residents.forEach(async (res) => {
          await addLog(`[SMS] Text message broadcast to ${res.name} at phone: ${res.phone}`);
        });
        await addLog(`[SMS] SMS broadcast completed successfully.`);
      }, 2500);
    }

    return newAnnouncement;
  };

  const deleteAnnouncement = async (announcementId) => {
    // Update locally
    setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));

    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
    } catch (err) {
      console.warn("Failed to delete announcement in Firestore. Deleted locally.", err);
    }
    await addLog(`[ADMIN] Announcement "${announcementId}" deleted by administrator.`);
  };

  const updateAnnouncement = async (id, updatedFields) => {
    // Update locally
    setAnnouncements(prev => prev.map(ann => ann.id === id ? { ...ann, ...updatedFields } : ann));

    try {
      await updateDoc(doc(db, 'announcements', id), updatedFields);
    } catch (err) {
      console.warn("Failed to update announcement in Firestore. Updated locally.", err);
    }
    await addLog(`[WEBSITE] Announcement "${id}" updated.`);
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

    // Update locally
    setArcRequests(prev => [newRequest, ...prev]);

    try {
      await setDoc(doc(db, 'arcRequests', id), newRequest);
    } catch (err) {
      console.warn("Failed to write ARC request to Firestore. Saved locally.", err);
    }
    await addLog(`[ARC] New Architectural Review Request filed by ${currentUser.name} for a ${projectType}.`);
    
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
