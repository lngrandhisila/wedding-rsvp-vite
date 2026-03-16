export const weddingConfig = {
  coupleNames: 'Sowmya & Sai Abhiram',
  subtitle:
    'With joyful hearts, we invite you to celebrate our Engagement, Haldi, Marriage, and Cocktail Party over three beautiful days of love, laughter, and togetherness.',
  datesLabel: 'May 7–9, 2026',
  cityLabel: 'Aubrey, Texas & Irving, Texas',
  heroPhotos: [
    '/photos/couple-1.jpg',
    '/photos/couple-2.jpg',
    '/photos/couple-3.jpg',
  ],
  events: [
    {
      id: 'engagement',
      title: 'Engagement',
      day: 'Day 1',
      time: '6:00 PM onwards',
      venue: 'The Bliss at Aubrey – Hall A',
      note: 'Join us for a beautiful evening celebrating the beginning of our forever.',
      theme: 'rose',
      color: '#ff6b9d',
    },
    {
      id: 'haldi',
      title: 'Haldi',
      day: 'Day 2',
      time: '10:00 AM onwards',
      venue: 'The Bliss at Aubrey – Hall B',
      note: 'A joyful Haldi ceremony filled with blessings, laughter, and color.',
      theme: 'haldi',
      color: '#ffd700',
    },
    {
      id: 'marriage',
      title: 'Marriage',
      day: 'Day 3',
      time: '9:00 AM onwards',
      venue: 'The Prism at Irving',
      note: 'We would be honored to have you join us as we exchange vows.',
      theme: 'marriage',
      color: '#ff1493',
    },
    {
      id: 'cocktail',
      title: 'Cocktail Party',
      day: 'Day 3',
      time: '8:00 PM onwards',
      venue: 'The Bliss at Aubrey – Hall C',
      note: 'Celebrate with us over music, dinner, and a memorable evening.',
      theme: 'cocktail',
      color: '#a78bfa',
    },
  ],
}

export const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL || ''