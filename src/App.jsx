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
  Download,
  Send,
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

const eventDateMap = {
  engagement: '20260507',
  haldi: '20260508',
  marriage: '20260509',
  cocktail: '20260509',
}

const eventTimeMap = {
  engagement: '180000',
  haldi: '100000',
  marriage: '090000',
  cocktail: '200000',
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
      const marriageDate = new Date('2026-05-09T09:00:00')
      
      const diff = marriageDate - now
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setCountdownTimes({ days, hours, minutes, seconds })
      } else {
        setCountdownTimes({})
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const selectedCount = useMemo(() => selectedEvents.length, [selectedEvents])
  const floatingFlowers = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: index,
        left: `${(index * 17 + 9) % 100}%`,
        top: `${(index * 23 + 13) % 100}%`,
        size: `${22 + (index % 5) * 8}px`,
        delay: `${(index % 7) * 0.5}s`,
        duration: `${7 + (index % 6) * 1.1}s`,
        type: index % 3,
      })),
    [],
  )
  const heroSparkles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        left: `${(index * 13 + 7) % 100}%`,
        top: `${(index * 17 + 11) % 78}%`,
        size: `${10 + (index % 4) * 4}px`,
        delay: `${(index % 8) * 0.45}s`,
        duration: `${3.2 + (index % 5) * 0.8}s`,
      })),
    [],
  )
  const eventTitleById = useMemo(
    () => Object.fromEntries(weddingConfig.events.map((item) => [item.id, item.title])),
    [],
  )
  const selectedEventTitles = useMemo(
    () => selectedEvents.map((eventId) => eventTitleById[eventId]).filter(Boolean),
    [selectedEvents, eventTitleById],
  )
  const eventDateLabelById = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    return Object.fromEntries(
      weddingConfig.events.map((eventItem) => {
        const rawDate = eventDateMap[eventItem.id]
        if (!rawDate || rawDate.length !== 8) {
          return [eventItem.id, '']
        }
        const year = Number(rawDate.slice(0, 4))
        const month = Number(rawDate.slice(4, 6)) - 1
        const day = Number(rawDate.slice(6, 8))
        const date = new Date(year, month, day)
        return [eventItem.id, formatter.format(date)]
      }),
    )
  }, [])
  const eventVenues = useMemo(
    () =>
      weddingConfig.events
        .map((eventItem) => ({
          id: eventItem.id,
          title: eventItem.title,
          venue: eventItem.venue,
        }))
        .filter((eventItem) => eventItem.title && eventItem.venue),
    [],
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

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

  const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = String(text || '').split(' ')
    let line = ''
    let currentY = y

    words.forEach((word) => {
      const testLine = `${line}${word} `
      const width = ctx.measureText(testLine).width
      if (width > maxWidth && line) {
        ctx.fillText(line.trim(), x, currentY)
        line = `${word} `
        currentY += lineHeight
      } else {
        line = testLine
      }
    })

    if (line) {
      ctx.fillText(line.trim(), x, currentY)
      currentY += lineHeight
    }

    return currentY
  }

  const buildInvitationFileName = () => {
    const invitationTitle =
      weddingConfig.invitationTitle ||
      `${weddingConfig.coupleNames} Wedding Invitation`

    const safeName = invitationTitle
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return `${safeName || 'wedding-invitation'}.png`
  }

  const roundedRectPath = (ctx, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + width - r, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + r)
    ctx.lineTo(x + width, y + height - r)
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
    ctx.lineTo(x + r, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const drawImageCover = (ctx, img, x, y, width, height) => {
    if (!img) return

    const imgRatio = img.width / img.height
    const boxRatio = width / height

    let drawWidth = width
    let drawHeight = height
    let drawX = x
    let drawY = y

    if (imgRatio > boxRatio) {
      drawWidth = height * imgRatio
      drawX = x - (drawWidth - width) / 2
    } else {
      drawHeight = width / imgRatio
      drawY = y - (drawHeight - height) / 2
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
  }

  const ensureInvitationFontsLoaded = async () => {
    if (typeof document === 'undefined' || !document.fonts || !document.fonts.load) {
      return
    }

    try {
      await Promise.all([
        document.fonts.load('700 40px "Cinzel"'),
        document.fonts.load('600 24px "Cormorant Garamond"'),
      ])
    } catch (error) {
      console.warn('Could not preload invitation fonts:', error)
    }
  }

  const downloadWeddingCard = async () => {
    await ensureInvitationFontsLoaded()

    const eventStartY = 1010
    const eventBoxH = 292
    const eventGap = 26
    const eventCount = weddingConfig.events.length
    const eventsBottomY =
      eventStartY +
      eventCount * eventBoxH +
      Math.max(0, eventCount - 1) * eventGap
    const footerTopY = eventsBottomY + 90

    const invitationHeading =
      weddingConfig.invitationTitle || "Manchikanti & Grandhisila Family's Wedding Invitation"
    const hostFamilyLine = invitationHeading.replace(/\s*wedding invitation\s*$/i, '').trim()

    const canvas = document.createElement('canvas')
    canvas.width = 1500
    canvas.height = Math.max(2450, footerTopY + 140)
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    bg.addColorStop(0, '#fff8fc')
    bg.addColorStop(0.34, '#ffe8f4')
    bg.addColorStop(0.72, '#ffddec')
    bg.addColorStop(1, '#fff3f9')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const topGlow = ctx.createRadialGradient(canvas.width * 0.5, 260, 80, canvas.width * 0.5, 260, 760)
    topGlow.addColorStop(0, 'rgba(236, 72, 153, 0.26)')
    topGlow.addColorStop(1, 'rgba(236, 72, 153, 0)')
    ctx.fillStyle = topGlow
    ctx.fillRect(0, 0, canvas.width, 900)

    for (let i = 0; i < 380; i += 1) {
      const x = (i * 47) % canvas.width
      const y = (i * 79) % canvas.height
      ctx.fillStyle = i % 3 === 0 ? 'rgba(236, 72, 153, 0.08)' : 'rgba(251, 113, 133, 0.06)'
      ctx.beginPath()
      ctx.arc(x, y, 2 + (i % 2), 0, Math.PI * 2)
      ctx.fill()
    }

    const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 450, canvas.width / 2, canvas.height / 2, 1300)
    vignette.addColorStop(0, 'rgba(255, 255, 255, 0)')
    vignette.addColorStop(1, 'rgba(80, 10, 52, 0.2)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#f472b6'
    ctx.lineWidth = 8
    roundedRectPath(ctx, 34, 34, canvas.width - 68, canvas.height - 68, 28)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(190, 24, 93, 0.4)'
    ctx.lineWidth = 2
    roundedRectPath(ctx, 58, 58, canvas.width - 116, canvas.height - 116, 22)
    ctx.stroke()

    ctx.fillStyle = 'rgba(244, 114, 182, 0.56)'
    ctx.fillRect(90, 90, 90, 4)
    ctx.fillRect(canvas.width - 180, 90, 90, 4)
    ctx.fillRect(90, canvas.height - 94, 90, 4)
    ctx.fillRect(canvas.width - 180, canvas.height - 94, 90, 4)

    roundedRectPath(ctx, 120, 120, canvas.width - 240, 360, 30)
    const heroPanelGradient = ctx.createLinearGradient(120, 120, canvas.width - 120, 480)
    heroPanelGradient.addColorStop(0, 'rgba(255, 255, 255, 0.86)')
    heroPanelGradient.addColorStop(1, 'rgba(255, 242, 249, 0.82)')
    ctx.fillStyle = heroPanelGradient
    ctx.fill()
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)'
    ctx.shadowBlur = 8
    ctx.fillStyle = '#be185d'
    const headingMaxWidth = canvas.width - 340
    let headingFontSize = 46
    ctx.font = `700 ${headingFontSize}px "Cinzel", Georgia, serif`
    while (ctx.measureText(invitationHeading).width > headingMaxWidth && headingFontSize > 28) {
      headingFontSize -= 2
      ctx.font = `700 ${headingFontSize}px "Cinzel", Georgia, serif`
    }
    ctx.fillText(invitationHeading, canvas.width / 2, 186)
    ctx.font = '700 68px "Cinzel", Georgia, serif'
    ctx.fillStyle = '#db2777'
    ctx.fillText(weddingConfig.coupleNames, canvas.width / 2, 270)

    ctx.shadowBlur = 0
    roundedRectPath(ctx, 250, 308, canvas.width - 500, 148, 20)
    ctx.fillStyle = 'rgba(255, 247, 252, 0.9)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.26)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.font = '600 25px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = '#6b2147'
    const subtitleEndY = drawWrappedText(ctx, weddingConfig.subtitle, canvas.width / 2, 352, 860, 30)

    ctx.font = '700 28px "Cinzel", Georgia, serif'
    ctx.fillStyle = '#9d174d'
    ctx.fillText(`${weddingConfig.datesLabel}  |  ${weddingConfig.cityLabel}`, canvas.width / 2, subtitleEndY + 14)

    const photos = await Promise.all(
      weddingConfig.heroPhotos.map((src) => loadImage(src).catch(() => null)),
    )

    const photoY = 540
    const cardWidth = 410
    const cardHeight = 280
    const gap = 45
    const startX = (canvas.width - cardWidth * 3 - gap * 2) / 2
    photos.forEach((img, index) => {
      const x = startX + index * (cardWidth + gap)
      roundedRectPath(ctx, x - 10, photoY - 10, cardWidth + 20, cardHeight + 20, 24)
      const frameGradient = ctx.createLinearGradient(x - 10, photoY - 10, x + cardWidth + 10, photoY + cardHeight + 10)
      frameGradient.addColorStop(0, 'rgba(251, 207, 232, 0.9)')
      frameGradient.addColorStop(1, 'rgba(244, 114, 182, 0.38)')
      ctx.fillStyle = frameGradient
      ctx.fill()

      roundedRectPath(ctx, x, photoY, cardWidth, cardHeight, 20)
      ctx.save()
      ctx.clip()
      if (img) {
        drawImageCover(ctx, img, x, photoY, cardWidth, cardHeight)
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fillRect(x, photoY, cardWidth, cardHeight)
      }
      const photoOverlay = ctx.createLinearGradient(x, photoY, x, photoY + cardHeight)
      photoOverlay.addColorStop(0, 'rgba(255, 255, 255, 0.06)')
      photoOverlay.addColorStop(1, 'rgba(0, 0, 0, 0.35)')
      ctx.fillStyle = photoOverlay
      ctx.fillRect(x, photoY, cardWidth, cardHeight)
      ctx.restore()

      ctx.strokeStyle = '#ec4899'
      ctx.lineWidth = 2
      roundedRectPath(ctx, x, photoY, cardWidth, cardHeight, 20)
      ctx.stroke()
    })

    roundedRectPath(ctx, 120, 870, canvas.width - 240, 96, 18)
    const titleBand = ctx.createLinearGradient(120, 870, canvas.width - 120, 966)
    titleBand.addColorStop(0, 'rgba(236, 72, 153, 0.28)')
    titleBand.addColorStop(1, 'rgba(251, 207, 232, 0.2)')
    ctx.fillStyle = titleBand
    ctx.fill()
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.34)'
    ctx.stroke()

    ctx.fillStyle = '#9d174d'
    ctx.font = '700 50px "Cinzel", Georgia, serif'
    ctx.fillText('Event Schedule', canvas.width / 2, 934)

    const badgeColors = {
      engagement: '#eab7ff',
      haldi: '#ffd56b',
      marriage: '#ff9bb2',
      cocktail: '#9ec4ff',
    }

    let currentY = eventStartY
    const eventBackgrounds = await Promise.all(
      weddingConfig.events.map((event) => loadImage(event.backgroundImage).catch(() => null)),
    )

    weddingConfig.events.forEach((event, index) => {
      const boxX = 95
      const boxW = canvas.width - 190
      const boxH = 292

      roundedRectPath(ctx, boxX, currentY, boxW, boxH, 22)
      const eventGradient = ctx.createLinearGradient(boxX, currentY, boxX + boxW, currentY + boxH)
      eventGradient.addColorStop(0, 'rgba(255, 255, 255, 0.92)')
      eventGradient.addColorStop(1, 'rgba(255, 239, 248, 0.9)')
      ctx.fillStyle = eventGradient
      ctx.fill()

      const eventBackground = eventBackgrounds[index]
      if (eventBackground) {
        ctx.save()
        roundedRectPath(ctx, boxX, currentY, boxW, boxH, 22)
        ctx.clip()
        drawImageCover(ctx, eventBackground, boxX, currentY, boxW, boxH)
        const eventOverlay = ctx.createLinearGradient(boxX, currentY, boxX, currentY + boxH)
        eventOverlay.addColorStop(0, 'rgba(34, 7, 17, 0.7)')
        eventOverlay.addColorStop(1, 'rgba(51, 12, 29, 0.78)')
        ctx.fillStyle = eventOverlay
        ctx.fillRect(boxX, currentY, boxW, boxH)
        ctx.restore()
      }

      roundedRectPath(ctx, boxX + 34, currentY + 24, boxW - 180, boxH - 50, 16)
      ctx.fillStyle = 'rgba(22, 6, 14, 0.56)'
      ctx.fill()

      ctx.strokeStyle = 'rgba(251, 207, 232, 0.75)'
      ctx.lineWidth = 2
      ctx.stroke()

      const accent = badgeColors[event.id] || '#f1d88a'
      ctx.fillStyle = accent
      ctx.fillRect(boxX + 20, currentY + 20, 8, boxH - 40)

      ctx.textAlign = 'left'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 3
      ctx.fillStyle = accent
      ctx.font = '700 38px "Trebuchet MS", "Segoe UI", sans-serif'
      ctx.fillText(event.title, boxX + 56, currentY + 66)

      const eventDateLabel = eventDateLabelById[event.id] || ''
      ctx.font = '700 22px "Trebuchet MS", "Segoe UI", sans-serif'
      ctx.fillStyle = '#ffd8ea'
      ctx.fillText(`${event.day}  |  ${eventDateLabel}  |  ${event.time}`, boxX + 56, currentY + 108)

      ctx.font = '600 23px "Trebuchet MS", "Segoe UI", sans-serif'
      ctx.fillStyle = '#ffe9f5'
      drawWrappedText(ctx, event.venue, boxX + 56, currentY + 148, boxW - 220, 30)

      ctx.font = '500 21px "Trebuchet MS", "Segoe UI", sans-serif'
      ctx.fillStyle = '#ffd2e8'
      drawWrappedText(ctx, event.note, boxX + 56, currentY + 202, boxW - 220, 28)
      ctx.shadowBlur = 0

      const rightBadgeX = boxX + boxW - 138
      roundedRectPath(ctx, rightBadgeX, currentY + 20, 118, 42, 12)
      ctx.fillStyle = 'rgba(236, 72, 153, 0.28)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(251, 207, 232, 0.75)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.textAlign = 'center'
      ctx.fillStyle = '#6b2147'
      ctx.font = '600 22px "Cormorant Garamond", Georgia, serif'
      ctx.fillText(`Event ${index + 1}`, rightBadgeX + 59, currentY + 49)

      currentY += boxH + 26
    })

    ctx.textAlign = 'center'
    ctx.fillStyle = '#9d174d'
    ctx.font = '600 30px Georgia'
    ctx.fillText('We look forward to celebrating with you', canvas.width / 2, footerTopY)
    ctx.font = '500 24px Georgia'
    ctx.fillStyle = 'rgba(107, 33, 71, 0.85)'
    ctx.fillText(`With Love, ${hostFamilyLine}`, canvas.width / 2, footerTopY + 44)

    try {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = buildInvitationFileName()
      link.click()
      setShowCardDownload(false)
    } catch (err) {
      console.error('Card download failed:', err)
      setStatus({ state: 'error', message: 'Could not generate card image. Please try again.' })
    }
  }

 const generateICalendar = (eventId) => {
    const event = weddingConfig.events.find(e => e.id === eventId)
    if (!event) return null

    // Parse the date and time
    // Events are on May 7-9, 2026
    const dateStr = eventDateMap[eventId]
    const timeStr = eventTimeMap[eventId]
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
SUMMARY:${event.title} - Manchikanti & Grandhisila Wedding
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
    const messageAuthor = form.name.trim()
    if (!messageAuthor) {
      setStatus({ state: 'error', message: 'Please enter your RSVP name before posting a guest-book message.' })
      return
    }
    
    const message = {
      id: Date.now(),
      name: messageAuthor,
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

  // Check duplicates from Google Sheet (phone OR name+phone OR name+email)
  try {
    if (appsScriptUrl) {
      const duplicateResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'checkDuplicateRsvp',
          guestName: form.name,
          email: form.email,
          phone: form.phone,
          events: selectedEvents,
        }),
      })

      const duplicateResult = await duplicateResponse.json()
      if (duplicateResult.isDuplicate) {
        const duplicateEventNames = (duplicateResult.duplicateEvents || [])
          .map((id) => weddingConfig.events.find((event) => event.id === id)?.title)
          .filter(Boolean)
          .join(', ')
        const reasons = (duplicateResult.reasons || []).join(', ')

        setStatus({
          state: 'error',
          message: `Duplicate RSVP found in sheet for: ${duplicateEventNames}. Matched by ${reasons}.`,
        })
        return
      }
    }
  } catch (duplicateError) {
    console.error('Duplicate check failed:', duplicateError)
    setStatus({
      state: 'error',
      message: 'Could not verify duplicates from Google Sheets. Please try again.',
    })
    return
  }

  const payload = {
    action: 'submitRsvp',
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
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
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
    <div className="page-shell wedding-scene floral-theme">
      <div className="floating-flower-layer" aria-hidden="true">
        {floatingFlowers.map((flower) => (
          <span
            key={flower.id}
            className={`floating-flower flower-type-${flower.type}`}
            style={{
              left: flower.left,
              top: flower.top,
              width: flower.size,
              height: flower.size,
              animationDelay: flower.delay,
              animationDuration: flower.duration,
            }}
          />
        ))}
      </div>
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

      <motion.section
        className="hero-section wedding-mandap reveal-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="hero-sparkle-layer" aria-hidden="true">
          {heroSparkles.map((sparkle) => (
            <span
              key={sparkle.id}
              className="hero-sparkle"
              style={{
                left: sparkle.left,
                top: sparkle.top,
                width: sparkle.size,
                height: sparkle.size,
                animationDelay: sparkle.delay,
                animationDuration: sparkle.duration,
              }}
            />
          ))}
        </div>
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
            <div className="pill"> Manchikanti & Grandhisila Family's Wedding Invitation </div>
            <h1>{weddingConfig.coupleNames}</h1>
            <p className="hero-subtitle">{weddingConfig.subtitle}</p>

            <div className="pill-row">
              <span className="soft-pill">3 Days of Celebration</span>
            </div>

            <div className="info-grid">
              <div className="info-card hero-highlight-card">
                <CalendarDays className="info-icon rose-text" />
                <div className="info-label hero-highlight-label">Celebration Dates</div>
                <div className="info-value hero-highlight-value">{weddingConfig.datesLabel}</div>
              </div>
              <div className="info-card hero-highlight-card">
                <MapPin className="info-icon amber-text" />
                <div className="info-label hero-highlight-label">Venue</div>
                <div className="info-value hero-highlight-value">{weddingConfig.cityLabel}</div>
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
              className="gallery-large gallery-featured frame-card"
              animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={weddingConfig.heroPhotos[0]} alt="Couple portrait 1" />
            </motion.div>
            <motion.div 
              className="gallery-small gallery-portrait-left frame-card"
              animate={{ y: [0, -15, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <img src={weddingConfig.heroPhotos[1]} alt="Couple portrait 2" />
            </motion.div>
            <motion.div 
              className="gallery-small gallery-portrait-right frame-card"
              animate={{ y: [0, -18, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <img src={weddingConfig.heroPhotos[2]} alt="Couple portrait 3" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="content-wrap section-gap reveal-section"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.85, ease: 'easeOut' }}
      >
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
                    <div><CalendarDays size={16} /> {eventDateLabelById[eventItem.id]}</div>
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
      </motion.section>

      <motion.section
        className="content-wrap form-layout section-gap-bottom flower-garlands reveal-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
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
          {eventVenues.map((eventItem) => (
            <p key={eventItem.id}>
              <b>{eventItem.title}:</b> {eventItem.venue}
              {eventItem.venue ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventItem.venue)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="venue-map-link"
                  aria-label={`Open ${eventItem.title} venue in Google Maps`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4285F4"/>
                    <circle cx="12" cy="9" r="2.5" fill="#34A853"/>
                  </svg>
                </a>
              ) : null}
            </p>
          ))}
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
          
          <div className="guestbook-messages guestbook-chat">
            {guestMessages.length === 0 ? (
              <p className="no-messages">Be the first to share your wishes! ✨</p>
            ) : (
              guestMessages.slice(0, 10).map((msg, index) => (
                <motion.div 
                  key={msg.id}
                  className={`message-row ${index % 2 === 0 ? 'message-row-right' : 'message-row-left'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="message-avatar">{msg.name || 'Guest'}</div>
                  <div className="message-item message-bubble">
                    <p className="message-author">{msg.name || 'Guest'}</p>
                    <p className="message-text">{msg.text}</p>
                    <p className="message-time">{msg.timestamp}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          {guestMessages.length > 10 && (
            <p className="messages-count">+{guestMessages.length - 10} more wishes</p>
          )}
        </div>
      </motion.section>
    </div>
  )
}

export default App
