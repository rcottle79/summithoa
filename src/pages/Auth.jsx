import React, { useState, useContext } from 'react';
import { HOAContext } from '../context/HOAContext';
import { HomeIcon, CheckIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import { compressImage } from '../utils/imageCompressor';
import { formatPhoneNumber } from '../utils/phoneFormatter';

export default function Auth() {
  const { login, signup, resetPasswordEmail } = useContext(HOAContext);
  const [activeMode, setActiveMode] = useState('login'); // 'login', 'signup', or 'forgot_password'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Password reset fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // Signup fields
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: '/avatar-female.png',
    role: 'Resident',
    password: ''
  });
  const [signupError, setSignupError] = useState('');
  const [registrationPending, setRegistrationPending] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const defaultAvatars = [
    '/avatar-male.png',
    '/avatar-female.png'
  ];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      login(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    try {
      await resetPasswordEmail(resetEmail.trim());
      setResetSuccess(true);
    } catch (err) {
      setResetError(err.message || String(err) || "Failed to send reset link.");
    }
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setSignupData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setSignupData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');

    const digitsOnly = signupData.phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setSignupError("Phone number must contain at least 10 digits.");
      return;
    }

    try {
      await signup(
        signupData.name.trim(),
        signupData.email.trim(),
        signupData.phone.trim(),
        signupData.address.trim(),
        signupData.bio ? signupData.bio.trim() : '',
        signupData.avatar,
        'Resident', // default role
        signupData.password
      );
      setRegistrationPending(true);
    } catch (err) {
      console.error("Signup error in Auth.jsx:", err);
      setSignupError(err.message || String(err) || "An account creation error occurred.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setSignupData(prev => ({ ...prev, avatar: compressed }));
      } catch (err) {
        console.error("Image compression failed, using original file", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setSignupData(prev => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };



  return (
    <div className="auth-overlay animate-fade-in">
      <div className="auth-card-container glass-panel">
        <div className="auth-logo-area">
          <HomeIcon className="logo-icon" size={32} />
          <h1>SummitHOA</h1>
          <span className="subtitle">Resident Community Portal</span>
        </div>

        {registrationPending ? (
          <div className="auth-success-message text-center animate-fade-in" style={{ padding: '1rem 0' }}>
            <div className="success-icon-wrapper" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <CheckIcon size={32} />
            </div>
            <h2 style={{ fontSize: '1.45rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Registration Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Your account has been created. However, for security and residency verification, <strong>all new resident profiles require approval by an HOA Board Administrator</strong> before they can log in.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '2rem' }}>
              An administrator has been notified. Please try logging in again after approval.
            </p>
            <button 
              className="btn btn-primary w-100" 
              onClick={() => {
                setRegistrationPending(false);
                setActiveMode('login');
              }}
            >
              Back to Login Screen
            </button>
          </div>
        ) : activeMode === 'forgot_password' ? (
          /* Forgot Password Screen */
          <div className="auth-form-content animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Reset Password</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem', textAlign: 'center' }}>
              Enter your email address below, and we will send you a secure link to reset your account password.
            </p>

            {resetSuccess ? (
              <div className="text-center" style={{ padding: '1rem 0' }}>
                <div style={{ margin: '0 auto 1.5rem', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <CheckIcon size={24} />
                </div>
                <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                  Reset Link Dispatched!
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  A link has been sent to <strong>{resetEmail}</strong>. Please check your inbox and spam folders.
                </p>
                <button 
                  type="button" 
                  className="btn btn-primary w-100" 
                  onClick={() => {
                    setResetSuccess(false);
                    setResetEmail('');
                    setActiveMode('login');
                  }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit}>
                {resetError && <div className="error-toast">{resetError}</div>}
                
                <div className="form-group">
                  <label htmlFor="reset-email">Email Address</label>
                  <input
                    type="email"
                    id="reset-email"
                    className="form-control"
                    placeholder="resident@domain.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary auth-submit-btn" style={{ minHeight: '42px' }}>
                  Send Reset Link
                </button>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: '0.75rem', minHeight: '42px' }}
                  onClick={() => {
                    setResetError('');
                    setActiveMode('login');
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <button 
                className={`auth-tab-btn ${activeMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMode('login');
                  setLoginError('');
                }}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab-btn ${activeMode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMode('signup');
                  setSignupError('');
                }}
              >
                Register Account
              </button>
            </div>

            {activeMode === 'login' ? (
          /* Sign In Screen */
          <div className="auth-form-content">
            <form onSubmit={handleLoginSubmit}>
              {loginError && <div className="error-toast">{loginError}</div>}
              
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  type="email"
                  id="login-email"
                  className="form-control"
                  placeholder="resident@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

               <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="login-password">Password</label>
                  <button 
                    type="button" 
                    className="text-btn" 
                    style={{ fontSize: '0.8rem', padding: '0', minHeight: 'auto', textDecoration: 'underline', color: 'var(--accent-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onClick={() => {
                      setActiveMode('forgot_password');
                      setSignupError('');
                      setLoginError('');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    id="login-password"
                    className="form-control"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(prev => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 'auto',
                      width: '32px',
                      height: '32px'
                    }}
                  >
                    {showLoginPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn">
                Sign In to Portal
              </button>
            </form>

          </div>
        ) : (
          /* Register Screen */
          <div className="auth-form-content">
            <form onSubmit={handleSignupSubmit}>
              {signupError && <div className="error-toast">{signupError}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="signup-name">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="signup-name"
                    name="name"
                    className="form-control"
                    placeholder="Jane Smith"
                    value={signupData.name}
                    onChange={handleSignupInputChange}
                    required
                    minLength="2"
                    maxLength="50"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-address">Street Address <span className="required">*</span></label>
                  <input
                    type="text"
                    id="signup-address"
                    name="address"
                    className="form-control"
                    placeholder="e.g. 123 Maple St, Apt 4C"
                    value={signupData.address}
                    onChange={handleSignupInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-email">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    className="form-control"
                    placeholder="jane@example.com"
                    value={signupData.email}
                    onChange={handleSignupInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-phone">Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="signup-phone"
                    name="phone"
                    className="form-control"
                    placeholder="e.g. 5550123456"
                    value={signupData.phone}
                    onChange={handleSignupInputChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="signup-role">Select Role</label>
                  <select
                    id="signup-role"
                    name="role"
                    className="form-control"
                    value={signupData.role}
                    onChange={handleSignupInputChange}
                  >
                    <option value="Resident">Resident</option>
                    <option value="Board Member">Board Member</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-password">Account Password <span className="required">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      id="signup-password"
                      name="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={handleSignupInputChange}
                      required
                      minLength="6"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(prev => !prev)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 'auto',
                        width: '32px',
                        height: '32px'
                      }}
                    >
                      {showSignupPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-bio">About Yourself</label>
                <textarea
                  id="signup-bio"
                  name="bio"
                  className="form-control signup-bio-textarea"
                  placeholder="Introduce yourself to the neighbors..."
                  value={signupData.bio}
                  onChange={handleSignupInputChange}
                  maxLength="150"
                ></textarea>
              </div>

              {/* Avatar Preset Selector */}
              <div className="form-group">
                <label>Profile Picture</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="presets-horizontal">
                    {defaultAvatars.map((url, i) => (
                      <div 
                        key={i} 
                        className={`preset-wrapper ${signupData.avatar === url ? 'selected' : ''}`}
                        onClick={() => setSignupData(prev => ({ ...prev, avatar: url }))}
                      >
                        <img src={url} alt={`Preset Avatar ${i+1}`} className="preset-img" />
                        {signupData.avatar === url && <div className="preset-checked"><CheckIcon size={14} /></div>}
                      </div>
                    ))}
                  </div>

                  {/* File Upload Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Or upload custom photo:</span>
                    <input 
                      type="file" 
                      id="signup-avatar-file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="visually-hidden"
                    />
                    <label htmlFor="signup-avatar-file" className="btn btn-secondary" style={{ minHeight: '32px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      Choose Photo
                    </label>
                    {signupData.avatar && !defaultAvatars.includes(signupData.avatar) && (
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>✓ Custom Photo Loaded</span>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn">
                Complete Registration
              </button>
            </form>
          </div>
        )}
          </>
        )}
      </div>

      <style>{`
        .auth-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-primary);
          background-image: 
            radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.12) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.08) 0px, transparent 50%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          overflow-y: auto;
          z-index: 1000;
        }

        .auth-card-container {
          width: 100%;
          max-width: 500px;
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-logo-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-logo-area .logo-icon {
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
        }

        .auth-logo-area h1 {
          font-size: 2.25rem;
          margin-bottom: 0;
        }

        .auth-logo-area .subtitle {
          margin-top: 0.25rem;
          margin-bottom: 0;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Tabs styling */
        .auth-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          margin-bottom: 2rem;
          padding: 0.25rem;
        }

        .auth-tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.6rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          transition: var(--transition-fast);
        }

        .auth-tab-btn:hover {
          color: var(--text-primary);
        }

        .auth-tab-btn.active {
          background: var(--accent-primary);
          color: var(--text-inverse);
          box-shadow: 0 2px 8px var(--accent-primary-glow);
        }

        /* Form styling */
        .auth-form-content form {
          display: flex;
          flex-direction: column;
        }

        .auth-submit-btn {
          width: 100%;
          margin-top: 1rem;
        }

        .error-toast {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        /* Quick login section */
        .quick-login-section {
          margin-top: 2rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
          text-align: center;
        }

        .quick-login-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-primary);
        }

        .quick-login-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          margin-bottom: 1rem;
        }

        .quick-login-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .quick-btn {
          font-size: 0.85rem !important;
          min-height: 40px !important;
          justify-content: flex-start !important;
          padding-left: 1.25rem !important;
          border-color: var(--border-color) !important;
        }

        .quick-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .role-admin:hover { border-color: var(--accent-danger) !important; }
        .role-board:hover { border-color: var(--accent-secondary) !important; }
        .role-resident:hover { border-color: var(--accent-primary) !important; }

        /* Signup Specifics */
        .signup-bio-textarea {
          min-height: 55px !important;
          resize: none;
        }

        .presets-horizontal {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .preset-wrapper {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          cursor: pointer;
          overflow: hidden;
          border: 2px solid transparent;
        }

        .preset-wrapper.selected {
          border-color: var(--accent-primary);
        }

        .preset-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preset-checked {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        @media (max-width: 480px) {
          .auth-card-container {
            padding: 1.5rem 1.25rem;
          }
          .auth-logo-area h1 {
            font-size: 1.75rem;
          }
          .presets-horizontal {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
