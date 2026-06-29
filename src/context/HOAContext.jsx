import React, { createContext, useState, useEffect } from 'react';

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
    let user = saved ? JSON.parse(saved) : null;
    if (user && user.avatar && user.avatar.includes('unsplash.com')) {
      const lowerName = user.name.toLowerCase();
      if (lowerName.includes('sarah') || lowerName.includes('emily') || lowerName.includes('jenk') || lowerName.includes('rodri')) {
        user.avatar = '/avatar-female.png';
      } else {
        user.avatar = '/avatar-male.png';
      }
    }
    return user;
  });

  const [residents, setResidents] = useState(() => {
    const saved = localStorage.getItem('hoa_residents');
    let loaded = saved ? JSON.parse(saved) : initialResidents;
    return loaded.map(res => {
      if (res.avatar && res.avatar.includes('unsplash.com')) {
        const lowerName = res.name.toLowerCase();
        if (lowerName.includes('sarah') || lowerName.includes('emily') || lowerName.includes('jenk') || lowerName.includes('rodri')) {
          res.avatar = '/avatar-female.png';
        } else {
          res.avatar = '/avatar-male.png';
        }
      }
      return res;
    });
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
      `[DATABASE] Local database loaded successfully with ${initialResidents.length} resident accounts.`
    ];
  });

  // Sync to localStorage
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

  // Log message helper
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDeliveryLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const clearLogs = () => {
    setDeliveryLogs([`[SYSTEM] Logs cleared.`]);
  };

  // Auth Operations
  const login = (email, password) => {
    const foundUser = residents.find(r => r.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      throw new Error("No account found with this email address.");
    }
    // Check if account is approved by admin
    if (foundUser.approved === false) {
      throw new Error("Your account is currently pending administrator approval.");
    }
    // simple mock password validation
    if (foundUser.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }
    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    addLog(`[AUTH] Resident ${foundUser.name} signed in successfully.`);
    return foundUser;
  };

  const quickLogin = (role) => {
    let targetUser = null;
    if (role === 'Admin') {
      targetUser = residents.find(r => r.role === 'Admin');
    } else if (role === 'Board Member') {
      targetUser = residents.find(r => r.role === 'Board Member');
    } else {
      targetUser = residents.find(r => r.role === 'Resident');
    }

    if (!targetUser) {
      // Fallback to first user
      targetUser = residents[0];
    }

    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    addLog(`[AUTH] Quick-Login triggered. Authenticated as ${targetUser.name} (${targetUser.role}).`);
  };

  const signup = (name, email, phone, address, bio, avatar, role, password) => {
    const emailExists = residents.some(r => r.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      throw new Error("An account already exists with this email.");
    }

    const newResident = {
      id: `res-${Date.now()}`,
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
    addLog(`[AUTH] Created new account for ${name} (Address: ${address}). Pending administrator approval.`);
    return newResident;
  };

  const logout = () => {
    const name = currentUser ? currentUser.name : 'Unknown';
    setIsAuthenticated(false);
    setCurrentUser(null);
    addLog(`[AUTH] User ${name} logged out.`);
  };

  // Profile Operations
  const updateProfile = (updatedProfile) => {
    if (currentUser && currentUser.id === updatedProfile.id) {
      setCurrentUser(updatedProfile);
    }
    setResidents(prev => 
      prev.map(r => r.id === updatedProfile.id ? { ...r, ...updatedProfile } : r)
    );
    addLog(`[PROFILE] Updated user profile for ${updatedProfile.name}.`);
  };

  // Support Ticket Operations
  const addTicket = (title, description, category, location, urgency) => {
    const newTicket = {
      id: `t-${Date.now()}`,
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
    setTickets(prev => [newTicket, ...prev]);
    addLog(`[SUPPORT] Support ticket "${title}" filed by ${currentUser.name}.`);
    return newTicket;
  };

  const updateTicketStatus = (ticketId, newStatus, commentText = '') => {
    setTickets(prev => 
      prev.map(ticket => {
        if (ticket.id === ticketId) {
          const updatedComments = [...ticket.comments];
          if (commentText.trim()) {
            updatedComments.push({
              author: currentUser.name,
              text: commentText,
              date: new Date().toISOString().split('T')[0]
            });
          }
          return {
            ...ticket,
            status: newStatus,
            comments: updatedComments
          };
        }
        return ticket;
      })
    );
    addLog(`[SUPPORT] Ticket #${ticketId} status updated to "${newStatus}" by ${currentUser.name}.`);
  };

  const deleteTicket = (ticketId) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    addLog(`[SUPPORT] Support Ticket #${ticketId} was deleted by Admin.`);
  };

  // Resident Manager Operations
  const changeResidentRole = (residentId, newRole) => {
    setResidents(prev => 
      prev.map(res => {
        if (res.id === residentId) {
          const updated = { ...res, role: newRole };
          // If editing active user, sync their active role state
          if (currentUser && currentUser.id === residentId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return res;
      })
    );
    addLog(`[ADMIN] Resident #${residentId} role updated to "${newRole}".`);
  };

  const approveResident = (residentId) => {
    setResidents(prev => 
      prev.map(res => {
        if (res.id === residentId) {
          return { ...res, approved: true };
        }
        return res;
      })
    );
    const target = residents.find(r => r.id === residentId);
    addLog(`[ADMIN] Resident "${target ? target.name : residentId}" approved by administrator.`);
  };

  const denyResident = (residentId) => {
    const target = residents.find(r => r.id === residentId);
    setResidents(prev => prev.filter(res => res.id !== residentId));
    addLog(`[ADMIN] Resident "${target ? target.name : residentId}" denied & deleted by administrator.`);
  };

  const deleteResident = (residentId) => {
    const target = residents.find(r => r.id === residentId);
    setResidents(prev => prev.filter(res => res.id !== residentId));
    addLog(`[ADMIN] Resident "${target ? target.name : residentId}" permanently deleted by administrator.`);
  };

  // Clubhouse Booking Operations
  const addBooking = (date, slot) => {
    const isDoubleBooked = bookings.some(b => b.date === date && b.slot === slot);
    if (isDoubleBooked) {
      throw new Error("This timeslot is already booked.");
    }

    const newBooking = {
      id: `b-${Date.now()}`,
      date,
      slot,
      residentName: currentUser.name,
      address: currentUser.address,
      status: 'Confirmed'
    };
    setBookings(prev => [newBooking, ...prev]);
    addLog(`[CALENDAR] Clubhouse booked for ${date} during ${slot} by ${currentUser.name}.`);
    
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
    addLog(`[EMAIL] Simulated booking confirmation notice dispatched to board@summithoa.com`);
    
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    addLog(`[CALENDAR] Booking ${bookingId} cancelled.`);
  };

  // Announcements Operations
  const addAnnouncement = async (title, content, category, channels, eventDate = '', eventTime = '', image = '') => {
    const newAnnouncement = {
      id: `a-${Date.now()}`,
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
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      addLog(`[WEBSITE] Announcement "${title}" published to public feed.`);
    }

    const totalResidents = residents.length;
    
    if (channels.email) {
      addLog(`[EMAIL] Initiating broadcast to ${totalResidents} residents...`);
      setTimeout(() => {
        addLog(`[EMAIL] Connecting to SMTP Relay...`);
      }, 500);
      setTimeout(() => {
        residents.forEach(res => {
          addLog(`[EMAIL] Dispatched email template to ${res.name} (${res.email})`);
        });
        addLog(`[EMAIL] Successfully completed email broadcast to all active residents.`);
      }, 1500);
    }

    if (channels.sms) {
      addLog(`[SMS] Initiating SMS broadcast gateway via Twilio...`);
      setTimeout(() => {
        addLog(`[SMS] Authenticating with Twilio Gateway SID: AC5f81ae8e8093...`);
      }, 300);
      setTimeout(() => {
        residents.forEach(res => {
          addLog(`[SMS] Text message broadcast to ${res.name} at phone: ${res.phone}`);
        });
        addLog(`[SMS] SMS broadcast completed successfully.`);
      }, 2500);
    }

    return newAnnouncement;
  };

  const deleteAnnouncement = (announcementId) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
    addLog(`[ADMIN] Announcement "${announcementId}" deleted by administrator.`);
  };

  // ARC Requests Operations
  const addArcRequest = (projectType, description, documents) => {
    const newRequest = {
      id: `arc-${Date.now()}`,
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
    setArcRequests(prev => [newRequest, ...prev]);
    addLog(`[ARC] New Architectural Review Request filed by ${currentUser.name} for a ${projectType}.`);
    
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
    addLog(`[EMAIL] Simulated ARC request details dispatched to board@summithoa.com`);
    
    return newRequest;
  };

  const updateArcRequestStatus = (requestId, status, reviewerNotes) => {
    setArcRequests(prev =>
      prev.map(req => req.id === requestId ? { ...req, status, reviewerNotes } : req)
    );
    addLog(`[ARC] Request "${requestId}" updated to status "${status}" by administrator.`);
  };

  return (
    <HOAContext.Provider value={{
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
      clearLogs,
      arcRequests,
      addArcRequest,
      updateArcRequestStatus
    }}>
      {children}
    </HOAContext.Provider>
  );
};
