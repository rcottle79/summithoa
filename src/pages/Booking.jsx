import React, { useContext, useState } from 'react';
import { HOAContext } from '../context/HOAContext';
import { CheckIcon } from '../components/Icons';

export default function Booking() {
  const { currentUser, bookings, addBooking, cancelBooking } = useContext(HOAContext);
  
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setMonth(max.getMonth() + 6);
    return max.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    return getMinDate();
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    return start;
  });

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const d = new Date(date);
    d.setHours(0,0,0,0);

    const min = new Date();
    min.setDate(min.getDate() + 1); // Tomorrow
    min.setHours(0,0,0,0);

    const max = new Date();
    max.setMonth(max.getMonth() + 6); // 6 months in advance
    max.setHours(0,0,0,0);

    return d < min || d > max;
  };

  const getDaysInMonthGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push(new Date(year, month, day));
    }
    return grid;
  };

  // Generate date list for the next 7 days
  const getNext7Days = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        dateString: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return dates;
  };

  const nextDays = getNext7Days();

  // Find bookings for the selected date
  const slotsForDate = {
    morning: bookings.find(b => b.date === selectedDate && b.slot === '9:00 AM - 12:00 PM'),
    evening: bookings.find(b => b.date === selectedDate && b.slot === '6:00 PM - 9:00 PM')
  };

  const handleBookSlot = async (slot) => {
    try {
      await addBooking(selectedDate, slot);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelSlot = (bookingId) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBooking(bookingId);
    }
  };

  return (
    <div className="booking-container animate-fade-in">
      <div className="booking-header">
        <h1>Clubhouse Reservation</h1>
        <p className="subtitle">Book the community clubhouse for private events and gatherings.</p>
      </div>

      <div className="scheduler-layout">
        {/* Interactive Native Calendar Picker */}
        <div className="calendar-panel glass-panel">
          <h2>Select Reservation Date</h2>
          <p className="section-desc">Reservations can be placed up to 6 months in advance. Choose a quick date below or use the calendar.</p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Quick Select (Next 7 Days)</h3>
            <div className="date-picker-grid">
              {nextDays.map((day) => (
                <div
                  key={day.dateString}
                  className={`date-cell ${selectedDate === day.dateString ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(day.dateString)}
                >
                  <span className="month-name">{day.month}</span>
                  <span className="day-number">{day.dayNum}</span>
                  <span className="day-name">{day.dayName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="custom-calendar-container" style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.5rem', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: 'var(--border-radius-sm)' }}>
            <div className="calendar-month-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button 
                type="button" 
                className="nav-arrow-btn"
                onClick={handlePrevMonth}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              >
                ◀
              </button>
              <span className="calendar-month-title" style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                type="button" 
                className="nav-arrow-btn"
                onClick={handleNextMonth}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              >
                ▶
              </button>
            </div>

            <div className="calendar-header-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>

            <div className="custom-calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
              {getDaysInMonthGrid().map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="calendar-day-empty" />;
                
                const dateString = day.toISOString().split('T')[0];
                const disabled = isDateDisabled(day);
                const selected = selectedDate === dateString;
                
                return (
                  <button
                    type="button"
                    key={dateString}
                    className={`calendar-day-cell ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''}`}
                    onClick={() => {
                      if (!disabled) {
                        setSelectedDate(dateString);
                      }
                    }}
                    style={{ 
                      aspectRatio: '1', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.8rem', 
                      borderRadius: 'var(--border-radius-sm)', 
                      cursor: disabled ? 'not-allowed' : 'pointer', 
                      border: '1px solid transparent',
                      background: selected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      borderColor: selected ? 'var(--accent-primary)' : 'transparent',
                      color: selected ? '#fff' : (disabled ? 'rgba(255,255,255,0.15)' : 'var(--text-primary)'),
                      opacity: disabled ? 0.3 : 1
                    }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Available slots picker */}
        <div className="booking-slots-panel glass-panel">
          <h2>Available Booking Slots</h2>
          <p className="selected-date-display">
            Date: <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { dateStyle: 'full' })}</strong>
          </p>

          <div className="slots-layout">
            {/* Slot 1: Morning */}
            <div className={`slot-card ${slotsForDate.morning ? 'booked' : 'available'}`}>
              <div className="slot-time">9:00 AM - 12:00 PM</div>
              <div className="slot-badge">
                <span className={`badge ${slotsForDate.morning ? 'badge-danger' : 'badge-success'}`}>
                  {slotsForDate.morning ? 'Booked' : 'Available'}
                </span>
              </div>
              {slotsForDate.morning ? (
                <div className="slot-reservation-details">
                  <div className="booked-by">Reserved by: {slotsForDate.morning.residentName}</div>
                  <div className="booked-unit">{slotsForDate.morning.address}</div>
                  {slotsForDate.morning.residentName === currentUser.name && (
                    <button 
                      className="btn btn-danger cancel-btn"
                      onClick={() => handleCancelSlot(slotsForDate.morning.id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  className="btn btn-primary book-btn"
                  onClick={() => handleBookSlot('9:00 AM - 12:00 PM')}
                >
                  Book Slot
                </button>
              )}
            </div>

            {/* Slot 2: Evening */}
            <div className={`slot-card ${slotsForDate.evening ? 'booked' : 'available'}`}>
              <div className="slot-time">6:00 PM - 9:00 PM</div>
              <div className="slot-badge">
                <span className={`badge ${slotsForDate.evening ? 'badge-danger' : 'badge-success'}`}>
                  {slotsForDate.evening ? 'Booked' : 'Available'}
                </span>
              </div>
              {slotsForDate.evening ? (
                <div className="slot-reservation-details">
                  <div className="booked-by">Reserved by: {slotsForDate.evening.residentName}</div>
                  <div className="booked-unit">{slotsForDate.evening.address}</div>
                  {slotsForDate.evening.residentName === currentUser.name && (
                    <button 
                      className="btn btn-danger cancel-btn"
                      onClick={() => handleCancelSlot(slotsForDate.evening.id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  className="btn btn-primary book-btn"
                  onClick={() => handleBookSlot('6:00 PM - 9:00 PM')}
                >
                  Book Slot
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Scheduler Layout */
        .scheduler-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 968px) {
          .scheduler-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .section-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        /* Date Picker */
        .date-picker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.75rem;
        }

        .date-cell {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 1rem 0.5rem;
          text-align: center;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: var(--transition-fast);
        }

        .date-cell:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border-color-hover);
        }

        .date-cell.selected {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--accent-primary);
          color: var(--text-primary);
          box-shadow: 0 0 10px var(--accent-primary-glow);
        }

        .calendar-day-cell:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: var(--accent-primary) !important;
        }

        .month-name {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }

        .day-number {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 0.15rem 0;
        }

        .day-name {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        /* Booking Slots Panel */
        .selected-date-display {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .slots-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .slot-card {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.01);
          transition: border-color var(--transition-fast);
        }

        .slot-card:hover {
          border-color: var(--border-color-hover);
        }

        .slot-card.booked {
          background: rgba(239, 68, 68, 0.01);
          border-left: 4px solid var(--accent-danger);
        }

        .slot-card.available {
          background: rgba(16, 185, 129, 0.01);
          border-left: 4px solid var(--accent-primary);
        }

        .slot-time {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .slot-badge {
          margin-bottom: 1rem;
        }

        .slot-reservation-details {
          font-size: 0.875rem;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius-sm);
        }

        .booked-by {
          font-weight: 600;
          color: var(--text-primary);
        }

        .booked-unit {
          color: var(--text-secondary);
          margin-top: 0.15rem;
          margin-bottom: 0.75rem;
        }

        .cancel-btn {
          width: 100%;
          min-height: 32px !important;
          font-size: 0.8rem !important;
          padding: 0.35rem 0.75rem !important;
        }

        .book-btn {
          width: 100%;
          min-height: 36px !important;
          font-size: 0.85rem !important;
        }
      `}</style>
    </div>
  );
}
