import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  PartyPopper,
  Sparkles,
  Users,
} from 'lucide-react'
import { appsScriptUrl, weddingConfig } from './config'

const iconMap = {
  engagement: Heart,
  haldi: Sparkles,
  marriage: CheckCircle2,
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
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [fieldErrors, setFieldErrors] = useState({})

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

 const handleSubmit = async (e) => {
  e.preventDefault();

  const errors = validate(form, selectedEvents)
  if (Object.keys(errors).length) {
    setFieldErrors(errors)
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
      setStatus({ state: 'success', message: 'RSVP submitted successfully!' })
    } else {
      setStatus({ state: 'error', message: 'Submission failed: ' + result.error })
    }
  } catch (error) {
    console.error(error);
    setStatus({ state: 'error', message: 'Error submitting RSVP' })
  }
  }

  return (
    <div className="page-shell">
      <section className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
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
            <div className="gallery-large frame-card">
              <img src={weddingConfig.heroPhotos[0]} alt="Couple portrait 1" />
            </div>
            <div className="gallery-small frame-card">
              <img src={weddingConfig.heroPhotos[1]} alt="Couple portrait 2" />
            </div>
            <div className="gallery-small frame-card">
              <img src={weddingConfig.heroPhotos[2]} alt="Couple portrait 3" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="content-wrap section-gap">
        <div className="section-header">
          <div>
            <h2>Event Schedule</h2>
            <p>Select every event you would love to attend.</p>
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
                    <div>
                      <div className="info-label">{eventItem.day}</div>
                      <h3>{eventItem.title}</h3>
                    </div>
                    <div className={`event-icon ${themeClassMap[eventItem.theme]}`}>
                      <Icon size={20} />
                    </div>
                  </div>

                  <div className="event-meta">
                    <div><Clock3 size={16} /> {eventItem.time}</div>
                    <div><MapPin size={16} /> {eventItem.venue}</div>
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

      <section className="content-wrap form-layout section-gap-bottom">
        <div className="form-card">
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

        <div className="side-card gradient-card">
          <h3>Event Venues</h3>
          <p><b>Engagement:</b> The Bliss at Aubrey – Hall A</p>
          <p><b>Haldi:</b> The Bliss at Aubrey – Hall B</p>
          <p><b>Marriage:</b> The Prism at Irving</p>
          <p><b>Cocktail Party:</b> The Bliss at Aubrey – Hall C</p>
        </div>

        <div className="side-card">
          <h3>RSVP Information</h3>
          <p>
            Kindly select the events you will be attending and submit your RSVP.
            Your response helps us plan seating, catering, and hospitality for
            each celebration.
          </p>
        </div>

        <div className="side-card">
          <h3>We look forward to celebrating with you</h3>
          <p>
            Your presence and blessings will make these moments even more
            memorable as we begin our journey together.
          </p>
        </div>
      </section>
    </div>
  )
}

export default App
