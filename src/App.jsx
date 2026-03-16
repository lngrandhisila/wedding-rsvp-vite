import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Camera,
  Heart,
  Clock3,
  Gem,
  MapPin,
  PartyPopper,
  Flower2,
  Users,
  Download,
  Send,
  ChevronRight,
} from 'lucide-react'
import { appsScriptUrl, weddingConfig } from './config'

const iconMap = {
  engagement: Gem,
  haldi: Flower2,
  marriage: Heart,
  cocktail: PartyPopper,
}

const themeClassMap = {
  rose: 'theme-rose',
  haldi: 'theme-haldi',
  marriage: 'theme-marriage',
  cocktail: 'theme-cocktail',
}

function App() {
  const [selectedEvents, setSelectedEvents] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '1',
    meal: '',
    note: '',
  })
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showCardDownload, setShowCardDownload] = useState(false)
  const [guestMessages, setGuestMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [countdownTimes, setCountdownTimes] = useState({})
  const [rsvpStats, setRsvpStats] = useState({
    engagement: 0,
    haldi: 0,
    marriage: 0,
    cocktail: 0,
  })

  // Load persisted data and fetch RSVP counts from sheet
  useEffect(() => {
    const savedMessages = localStorage.getItem('guestMessages')
    if (savedMessages) {
      setGuestMessages(JSON.parse(savedMessages))
    }

    // Fetch RSVP counts from Google Sheet
    const fetchRsvpCounts = async () => {
      try {
        if (!appsScriptUrl) return
        
        const response = await fetch(appsScriptUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'getRsvpCounts' }),
        })
        const data = await response.json()
        
        if (data.counts) {
          setRsvpStats(data.counts)
          localStorage.setItem('rsvpStats', JSON.stringify(data.counts))
        }
      } catch (err) {
        console.log('Could not fetch RSVP counts from sheet:', err)
        // Fall back to localStorage if sheet fetch fails
        const savedStats = localStorage.getItem('rsvpStats')
        if (savedStats) {
          setRsvpStats(JSON.parse(savedStats))
        }
      }
    }

    fetchRsvpCounts()
  }, [])

  // Update countdown timer every second (only for marriage event)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const marriageDate = new Date('2026-04-22')
      
      const diff = marriageDate - now
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setCountdownTimes({ days, hours, minutes, seconds })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const toggleMusic = () => {
    const audio = document.getElementById('background-music')
    if (musicPlaying) {
      audio.pause()
    } else {
      audio.play().catch(err => console.log('Audio play failed:', err))
    }
    setMusicPlaying(!musicPlaying)
  }

  const selectedCount = useMemo(() => selectedEvents.length, [selectedEvents])
  const eventTitleById = useMemo(
    () => Object.fromEntries(weddingConfig.events.map((item) => [item.id, item.title])),
    [],
  )
  const selectedEventTitles = useMemo(
    () => selectedEvents.map((eventId) => eventTitleById[eventId]).filter(Boolean),
    [selectedEvents, eventTitleById],
  )

  const validate = (currentForm, currentSelectedEvents) => {
    const errors = {}

    if (!currentForm.name.trim()) {
      errors.name = 'Full name is required.'
    }

    if (!currentForm.email.trim()) {
      errors.email = 'Email is required.'
    }

    if (
      currentForm.phone.trim() &&
      !/^[0-9+\-\s()]{10,}$/.test(currentForm.phone.trim())
    ) {
      errors.phone = 'Enter a valid phone number.'
    }

    const guestCount = Number(currentForm.guests)
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10) {
      errors.guests = 'Guests must be a whole number from 1 to 10.'
    }

    if (!currentSelectedEvents.length) {
      errors.events = 'Please select at least one event.'
    }

    return errors
  }

  const toggleEvent = (id) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
    setFieldErrors((prev) => {
      if (!prev.events) {
        return prev
      }
      const next = { ...prev }
      delete next.events
      return next
    })
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev
      }
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const downloadWeddingCard = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext('2d')

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#ff6b9d')
    gradient.addColorStop(1, '#c2185b')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 60px Comic Sans MS'
    ctx.textAlign = 'center'
    ctx.fillText('Together Forever', canvas.width / 2, 200)

    ctx.font = '40px Comic Sans MS'
    ctx.fillText('Our Wedding Celebration', canvas.width / 2, 280)

    ctx.font = '30px Comic Sans MS'
    ctx.fillText('May 7-9, 2026', canvas.width / 2, 500)
    ctx.fillText('Dallas, Texas', canvas.width / 2, 580)

    ctx.font = '28px Comic Sans MS'
    ctx.fillText('You are cordially invited', canvas.width / 2, 700)

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = 'wedding-card.png'
    link.click()
    setShowCardDownload(false)
  }

 const generateICalendar = (eventId) => {
    const event = weddingConfig.events.find(e => e.id === eventId)
    if (!event) return null

    // Parse the date and time
    // Events are on May 7-9, 2026
    const dateMap = {
      engagement: '20260507',
      haldi: '20260508',
      marriage: '20260509',
      cocktail: '20260509',
    }

    const timeMap = {
      engagement: '180000',
      haldi: '100000',
      marriage: '090000',
      cocktail: '200000',
    }

    const dateStr = dateMap[eventId]
    const timeStr = timeMap[eventId]
    const dtstart = `${dateStr}T${timeStr}Z`
    
    // End time is 2 hours after start
    const startHour = parseInt(timeStr.substring(0, 2))
    const endHour = startHour + 2
    const endTimeStr = `${String(endHour).padStart(2, '0')}0000`
    const dtend = `${dateStr}T${endTimeStr}Z`

    // Generate current timestamp for DTSTAMP
    const now = new Date()
    const dtstamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

    const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding RSVP//Wedding Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${eventId}-${Date.now()}@wedding-rsvp.local
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${event.title} - Grandhisila Wedding
DESCRIPTION:${event.note}
LOCATION:${event.venue}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    return ical
  }

  const downloadCalendarFile = (eventId, eventTitle) => {
    const ical = generateICalendar(eventId)
    if (!ical) return

    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${eventTitle.replace(/\s+/g, '_')}_event.ics`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAddGuestMessage = () => {
    if (!newMessage.trim()) return
    
    const message = {
      id: Date.now(),
      text: newMessage,
      timestamp: new Date().toLocaleString(),
    }
    
    const updatedMessages = [message, ...guestMessages]
    setGuestMessages(updatedMessages)
    localStorage.setItem('guestMessages', JSON.stringify(updatedMessages))
    setNewMessage('')
  }

  const handleUpdateStats = () => {
    // Update stats based on selected events
    const newStats = {
      engagement: rsvpStats.engagement + (selectedEvents.includes('engagement') ? 1 : 0),
      haldi: rsvpStats.haldi + (selectedEvents.includes('haldi') ? 1 : 0),
      marriage: rsvpStats.marriage + (selectedEvents.includes('marriage') ? 1 : 0),
      cocktail: rsvpStats.cocktail + (selectedEvents.includes('cocktail') ? 1 : 0),
    }
    
    setRsvpStats(newStats)
    localStorage.setItem('rsvpStats', JSON.stringify(newStats))
  }

 const handleSubmit = async (e) => {
  e.preventDefault();

  const errors = validate(form, selectedEvents)
  if (Object.keys(errors).length) {
    setFieldErrors(errors)
    return
  }

  // Check for duplicate event submissions based on name and phone (case-insensitive)
  const submissionKey = `rsvp_${form.name.toLowerCase().trim()}_${form.phone.toLowerCase().trim()}`
  const previousSubmissions = JSON.parse(localStorage.getItem(submissionKey) || '[]')
  
  // Find if any of the selected events were already submitted
  const duplicateEvents = selectedEvents.filter(eventId => 
    previousSubmissions.includes(eventId)
  )
  
  if (duplicateEvents.length > 0) {
    const duplicateEventNames = duplicateEvents
      .map(id => weddingConfig.events.find(e => e.id === id)?.title)
      .filter(Boolean)
      .join(', ')
    setStatus({ 
      state: 'error', 
      message: `You have already submitted an RSVP for: ${duplicateEventNames}. Please select different events.` 
    })
    return
  }

  const payload = {
    guestName: form.name,
    email: form.email,
    phone: form.phone,
    numberOfGuests: form.guests,
    mealPreference: form.meal,
    specialNote: form.note,
    events: selectedEvents,
  }

  setStatus({ state: 'loading', message: '' })

  try {
    const response = await fetch(import.meta.env.VITE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      // Store this submission in localStorage to prevent future duplicates
      const updatedSubmissions = [...previousSubmissions, ...selectedEvents]
      localStorage.setItem(submissionKey, JSON.stringify(updatedSubmissions))
      
      // Update RSVP stats
      handleUpdateStats()
      
      setStatus({ state: 'success', message: 'RSVP submitted successfully! Calendar events are ready to download.' })
      
      // Auto-download calendar files for all selected events
      setTimeout(() => {
        selectedEvents.forEach((eventId, index) => {
          const event = weddingConfig.events.find(e => e.id === eventId)
          if (event) {
            setTimeout(() => {
              downloadCalendarFile(eventId, event.title)
            }, index * 500) // Stagger downloads by 500ms
          }
        })
      }, 500)

      // Reset form after successful submission
      setTimeout(() => {
        setForm({ name: '', email: '', phone: '', guests: '1', meal: '', note: '' })
        setSelectedEvents([])
      }, 2000)
    } else {
      setStatus({ state: 'error', message: 'Submission failed: ' + result.error })
    }
  } catch (error) {
    console.error(error);
    setStatus({ state: 'error', message: 'Error submitting RSVP' })
  }
  }



  return (
    <div className="page-shell wedding-scene">
      <audio id="background-music" loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <button className="music-toggle" onClick={toggleMusic} title="Toggle background music">
        {musicPlaying ? '🔊' : '🔇'}
      </button>

      {/* Floating RSVP Button */}
      <motion.button
        onClick={() => document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' })}
        className="floating-rsvp-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Heart size={24} />
        RSVP
      </motion.button>

      {/* Download Card Button */}
      <motion.button
        onClick={() => setShowCardDownload(!showCardDownload)}
        className="floating-download-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Download size={24} />
      </motion.button>

      {/* Download Card Modal */}
      {showCardDownload && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowCardDownload(false)}
        >
          <motion.div
            className="modal-card glassmorphic"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Download Digital Wedding Card</h3>
            <p>Save this beautiful card to your device</p>
            <button onClick={downloadWeddingCard} className="primary-btn">
              Download as Image
            </button>
            <button onClick={() => setShowCardDownload(false)} className="secondary-btn">
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}

      <section className="hero-section wedding-mandap">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-glow hero-glow-three" />
        <div className="hero-glow hero-glow-four" />
        <div className="content-wrap hero-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-copy"
          >
            <div className="pill"> Grandhisila Family's Wedding Invitation </div>
            <h1>{weddingConfig.coupleNames}</h1>
            <p className="hero-subtitle">{weddingConfig.subtitle}</p>

            <div className="pill-row">
              <span className="soft-pill">3 Days of Celebration</span>
            </div>

            <div className="info-grid">
              <div className="info-card">
                <CalendarDays className="info-icon rose-text" />
                <div className="info-label">Celebration Dates</div>
                <div className="info-value">{weddingConfig.datesLabel}</div>
              </div>
              <div className="info-card">
                <MapPin className="info-icon amber-text" />
                <div className="info-label">Venue</div>
                <div className="info-value">{weddingConfig.cityLabel}</div>
              </div>
              <div className="info-card">
                <Users className="info-icon violet-text" />
                <div className="info-label">Events</div>
                <div className="info-value">4 memorable moments</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hero-gallery"
          >
            <motion.div 
              className="gallery-large frame-card"
              animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={weddingConfig.heroPhotos[0]} alt="Couple portrait 1" />
            </motion.div>
            <motion.div 
              className="gallery-small frame-card"
              animate={{ y: [0, -15, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <img src={weddingConfig.heroPhotos[1]} alt="Couple portrait 2" />
            </motion.div>
            <motion.div 
              className="gallery-small frame-card"
              animate={{ y: [0, -18, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <img src={weddingConfig.heroPhotos[2]} alt="Couple portrait 3" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="content-wrap section-gap">
        <div className="section-header-with-countdown">
          <div>
            <h2>Event Schedule</h2>
            <p>Select every event you would love to attend.</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="countdown-container floating-balloon">
              <p className="countdown-label-text">⏳ Time Until Action</p>
              <motion.div 
                className="countdown-card marriage-countdown inline-countdown"
                whileHover={{ scale: 1.05 }}
                animate={{
                  y: [0, -15, 8, -12, 5, -8, 0],
                  x: [0, 8, -10, 6, -8, 10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
              {countdownTimes.days !== undefined ? (
                <div className="countdown-display">
                  <div className="countdown-item">
                    <span className="countdown-number">{countdownTimes.days}</span>
                    <span className="countdown-label">Days</span>
                  </div>
                  <div className="countdown-item">
                    <span className="countdown-number">{countdownTimes.hours}</span>
                    <span className="countdown-label">Hours</span>
                  </div>
                  <div className="countdown-item">
                    <span className="countdown-number">{countdownTimes.minutes}</span>
                    <span className="countdown-label">Mins</span>
                  </div>
                  <div className="countdown-item">
                    <span className="countdown-number">{countdownTimes.seconds}</span>
                    <span className="countdown-label">Secs</span>
                  </div>
                </div>
              ) : (
                <p className="event-passed">We're married! 💕</p>
              )}
            </motion.div>
            </div>
            <motion.div 
              className="side-card dashboard-section floating-balloon"
              style={{ flex: '1', minWidth: '250px' }}
              animate={{
                y: [0, -15, 8, -12, 5, -8, 0],
                x: [0, 8, -10, 6, -8, 10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <h3>📊 RSVP Status</h3>
              <div className="dashboard-list">
                {weddingConfig.events.map((event) => (
                  <motion.div key={event.id} className="dashboard-list-item" whileHover={{ x: 5 }}>
                    <div className="stat-icon" style={{ background: `linear-gradient(135deg, ${event.color}, ${event.color}dd)` }}>
                      {event.id === 'engagement' && <Gem size={20} color="white" fill="white" strokeWidth={2} />}
                      {event.id === 'haldi' && <Flower2 size={20} color="white" fill="white" strokeWidth={2} />}
                      {event.id === 'marriage' && <Heart size={20} color="white" fill="white" strokeWidth={2} />}
                      {event.id === 'cocktail' && <PartyPopper size={20} color="white" fill="white" strokeWidth={2} />}
                    </div>
                    <div className="list-item-content">
                      <h4>{event.title}</h4>
                      <p className="list-item-subtitle">Confirmed RSVPs</p>
                    </div>
                    <p className="list-item-number">{rsvpStats[event.id]}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="dark-pill">
            {selectedCount} event{selectedCount === 1 ? '' : 's'} selected
          </div>
        </div>

        <div className="event-grid">
          {weddingConfig.events.map((eventItem, index) => {
            const Icon = iconMap[eventItem.id] || Heart
            const selected = selectedEvents.includes(eventItem.id)
            return (
              <motion.article
                  key={eventItem.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`event-card ${selected ? 'event-card-selected' : ''}`}
                  data-event={eventItem.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleEvent(eventItem.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggleEvent(eventItem.id)
                    }
                  }}
                  aria-pressed={selected}
                >
                <div className={`event-topbar ${themeClassMap[eventItem.theme]}`} />
                <div className="event-body">
                  <div className="event-header">
                    <h3>{eventItem.title}</h3>
                    <div className={`event-icon ${themeClassMap[eventItem.theme]}`}>
                      <Icon size={20} />
                    </div>
                  </div>

                  <div className="event-meta">
                    <div><Clock3 size={16} /> {eventItem.time}</div>
                    <div>
                      <MapPin size={16} /> {eventItem.venue}
                      {eventItem.venue && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventItem.venue)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: '8px', verticalAlign: 'middle', display: 'inline-block' }}
                          aria-label="Open in Google Maps"
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4285F4"/>
                            <circle cx="12" cy="9" r="2.5" fill="#34A853"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="event-note">{eventItem.note}</p>

                  <label className="select-row" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => toggleEvent(eventItem.id)}
                    />
                    <span>Yes, I will attend {eventItem.title}</span>
                  </label>
                </div>
              </motion.article>
            )
          })}
        </div>
        {fieldErrors.events ? <div className="status-box error">{fieldErrors.events}</div> : null}
      </section>

      <section className="content-wrap form-layout section-gap-bottom flower-garlands">
        <div className="form-card traditional-motif rama-sita-motif wedding-symbols">
          <div className="section-header no-space">
            <div>
              <h2>RSVP Now</h2>
              <p>Fill in your details and your response will be saved to Google Sheets.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rsvp-form">
            <div className="form-grid">
              <div>
                <label>Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
                {fieldErrors.name ? <div className="status-box error">{fieldErrors.name}</div> : null}
              </div>
              <div>
                <label>Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
                {fieldErrors.email ? <div className="status-box error">{fieldErrors.email}</div> : null}
              </div>
              <div>
                <label>Phone Number</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
                {fieldErrors.phone ? <div className="status-box error">{fieldErrors.phone}</div> : null}
              </div>
              <div>
                <label>Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={form.guests}
                  onChange={(e) => handleChange('guests', e.target.value)}
                  placeholder="1"
                />
                {fieldErrors.guests ? <div className="status-box error">{fieldErrors.guests}</div> : null}
              </div>
              <div className="full-width">
                <label>Meal Preference</label>
                <div className="radio-group" role="radiogroup" aria-label="Meal Preference">
                  <label className="select-row">
                    <input
                      type="radio"
                      name="mealPreference"
                      value="Veg"
                      checked={form.meal === 'Veg'}
                      onChange={(e) => handleChange('meal', e.target.value)}
                    />
                    <span>Veg</span>
                  </label>
                  <label className="select-row">
                    <input
                      type="radio"
                      name="mealPreference"
                      value="Non-Veg"
                      checked={form.meal === 'Non-Veg'}
                      onChange={(e) => handleChange('meal', e.target.value)}
                    />
                    <span>Non-Veg</span>
                  </label>
                  <label className="select-row">
                    <input
                      type="radio"
                      name="mealPreference"
                      value="No preference"
                      checked={form.meal === 'No preference'}
                      onChange={(e) => handleChange('meal', e.target.value)}
                    />
                    <span>No preference</span>
                  </label>
                </div>
              </div>
              <div className="full-width">
                <label>Message for the Couple</label>
                <textarea
                  value={form.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                  placeholder="Share your wishes..."
                />
              </div>
            </div>

            <div className="submit-row">
              <button type="submit" disabled={status.state === 'loading'}>
                {status.state === 'loading' ? 'Submitting...' : 'Submit RSVP'}
              </button>
              <div className="submit-hint">
                Selected events:{' '}
                {selectedEventTitles.length
                  ? selectedEventTitles.map((title) => (
                      <span key={title} className="soft-pill">
                        {title}
                      </span>
                    ))
                  : 'none yet'}
              </div>
            </div>

            {status.message ? (
              <div className={`status-box ${status.state}`}>{status.message}</div>
            ) : null}
          </form>
        </div>

        <div className="side-card gradient-card traditional-motif">
          <h3>Event Venues</h3>
          <p><b>Engagement:</b> The Bliss at Aubrey – Hall A</p>
          <p><b>Haldi:</b> The Bliss at Aubrey – Hall B</p>
          <p><b>Marriage:</b> The Prism at Irving</p>
          <p><b>Cocktail Party:</b> The Bliss at Aubrey – Hall C</p>
        </div>

        <div className="side-card auspicious-symbols">
          <h3>RSVP Information</h3>
          <p>
            Kindly select the events you will be attending and submit your RSVP.
            Your response helps us plan seating, catering, and hospitality for
            each celebration.
          </p>
        </div>

        <div className="side-card wedding-symbols">
          <h3>We look forward to celebrating with you</h3>
          <p>
            Your presence and blessings will make these moments even more
            memorable as we begin our journey together.
          </p>
        </div>

        {/* GUEST BOOK */}
        <div className="side-card guestbook-section">
          <h3>📝 Guest Book</h3>
          <div className="guestbook-input">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your wishes and blessings for the couple..."
              rows="3"
            />
            <motion.button 
              onClick={handleAddGuestMessage}
              className="send-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={18} />
              Post Wishes
            </motion.button>
          </div>
          
          <div className="guestbook-messages">
            {guestMessages.length === 0 ? (
              <p className="no-messages">Be the first to share your wishes! ✨</p>
            ) : (
              guestMessages.slice(0, 10).map((msg) => (
                <motion.div 
                  key={msg.id}
                  className="message-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="message-text">{msg.text}</p>
                  <p className="message-time">{msg.timestamp}</p>
                </motion.div>
              ))
            )}
          </div>
          {guestMessages.length > 10 && (
            <p className="messages-count">+{guestMessages.length - 10} more wishes</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
