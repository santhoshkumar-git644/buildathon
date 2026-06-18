import { useEffect, useMemo, useState } from 'react'

type Screen = 'home' | 'listings' | 'detail' | 'booking' | 'confirmation' | 'account' | 'owner'
type BookingTab = 'upcoming' | 'past' | 'cancelled'
type SortOption = 'popularity' | 'rating' | 'price' | 'distance'
type ReviewSort = 'recent' | 'highest' | 'lowest'

interface Service {
  name: string
  duration: number
  price: number
  category: string
}

interface Review {
  rating: number
  date: string
  comment: string
  author: string
  photo?: string
}

interface Staff {
  name: string
  specialty: string
}

interface Salon {
  id: number
  name: string
  city: string
  area: string
  rating: number
  reviewCount: number
  distance: number
  tags: string[]
  address: string
  hours: string
  images: string[]
  services: Service[]
  staff: Staff[]
  reviews: Review[]
}

interface Filters {
  categories: string[]
  priceMax: number
  ratingMin: number
  area: string
  openNow: boolean
  availableToday: boolean
}

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune']
const CATEGORIES = ['Hair', 'Skincare', 'Nails', 'Bridal', "Men's Grooming", 'Spa']
const TIME_SLOTS = ['10:00 AM', '11:30 AM', '01:00 PM', '03:30 PM', '05:00 PM', '07:00 PM']

const DEFAULT_FILTERS: Filters = {
  categories: [],
  priceMax: 5000,
  ratingMin: 0,
  area: '',
  openNow: false,
  availableToday: false,
}

const INITIAL_SALONS: Salon[] = [
  {
    id: 1,
    name: 'Velvet Mirror Studio',
    city: 'Mumbai',
    area: 'Bandra West',
    rating: 4.8,
    reviewCount: 214,
    distance: 2.1,
    tags: ['Open Now', 'Bridal Specialist'],
    address: '14 Seabreeze Lane, Bandra West, Mumbai',
    hours: '09:00 AM - 09:00 PM',
    images: ['Front Lounge', 'Color Bar', 'Bridal Room'],
    services: [
      { name: 'Precision Haircut', duration: 45, price: 900, category: 'Hair' },
      { name: 'Hydra Facial', duration: 60, price: 1800, category: 'Skincare' },
      { name: 'Bridal Makeup Trial', duration: 90, price: 3500, category: 'Bridal' },
      { name: 'Gel Manicure', duration: 50, price: 1200, category: 'Nails' },
    ],
    staff: [
      { name: 'Rhea Kapoor', specialty: 'Bridal Artist' },
      { name: 'Aniket Rao', specialty: 'Color Specialist' },
      { name: 'Maya S', specialty: 'Skin Therapist' },
    ],
    reviews: [
      { rating: 5, date: '2026-05-30', comment: 'Incredible bridal look and very smooth booking.', author: 'Priya N' },
      { rating: 4, date: '2026-05-22', comment: 'Great haircut and service was on time.', author: 'Isha M' },
    ],
  },
  {
    id: 2,
    name: 'Urban Rituals Salon',
    city: 'Mumbai',
    area: 'Andheri East',
    rating: 4.5,
    reviewCount: 162,
    distance: 4.4,
    tags: ['Available Today', 'Men Friendly'],
    address: '8 Palm Avenue, Andheri East, Mumbai',
    hours: '10:00 AM - 10:00 PM',
    images: ['Entrance', 'Spa Beds', 'Nail Corner'],
    services: [
      { name: 'Beard Sculpt', duration: 30, price: 650, category: "Men's Grooming" },
      { name: 'Deep Tissue Spa', duration: 75, price: 2200, category: 'Spa' },
      { name: 'Hair Smoothening', duration: 120, price: 4800, category: 'Hair' },
    ],
    staff: [
      { name: 'Karan V', specialty: "Men's Grooming" },
      { name: 'Ritika G', specialty: 'Spa Therapist' },
    ],
    reviews: [{ rating: 4, date: '2026-06-01', comment: 'Nice vibe and clean setup.', author: 'Rahul P' }],
  },
  {
    id: 3,
    name: 'Gloss House',
    city: 'Delhi',
    area: 'Connaught Place',
    rating: 4.7,
    reviewCount: 188,
    distance: 1.6,
    tags: ['Open Now', 'Luxury'],
    address: '22 Regal Arcade, Connaught Place, Delhi',
    hours: '09:30 AM - 08:30 PM',
    images: ['Reception', 'Styling Zone', 'Private Suite'],
    services: [
      { name: 'Root Touch-Up', duration: 70, price: 2100, category: 'Hair' },
      { name: 'Korean Glow Facial', duration: 65, price: 2400, category: 'Skincare' },
      { name: 'Acrylic Nail Art', duration: 80, price: 2000, category: 'Nails' },
    ],
    staff: [{ name: 'Zeenat F', specialty: 'Skin Expert' }],
    reviews: [{ rating: 5, date: '2026-05-28', comment: 'Bridal trial was absolutely stunning.', author: 'Sakshi B' }],
  },
  {
    id: 4,
    name: 'Blush Theory',
    city: 'Bengaluru',
    area: 'Indiranagar',
    rating: 4.6,
    reviewCount: 121,
    distance: 3.2,
    tags: ['Available Today', 'Couple Packages'],
    address: '5 Orchard Street, Indiranagar, Bengaluru',
    hours: '10:00 AM - 09:00 PM',
    images: ['Studio Floor', 'Nail Bar', 'Treatment Pods'],
    services: [
      { name: 'Layer Cut + Blow Dry', duration: 55, price: 1100, category: 'Hair' },
      { name: 'Spa Detox Ritual', duration: 90, price: 2600, category: 'Spa' },
      { name: 'Executive Grooming', duration: 40, price: 800, category: "Men's Grooming" },
    ],
    staff: [{ name: 'Neha A', specialty: 'Cut & Styling' }],
    reviews: [{ rating: 5, date: '2026-05-29', comment: 'Very professional and welcoming team.', author: 'Aarav K' }],
  },
]

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [city, setCity] = useState(() => localStorage.getItem('city') || 'Mumbai')
  const [search, setSearch] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [salons, setSalons] = useState<Salon[]>([])
  const [selectedSalonId, setSelectedSalonId] = useState(1)

  useEffect(() => {
    fetch('http://localhost:5000/api/salons')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSalons(data)
      })
      .catch((err) => console.error(err))
  }, [])
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('popularity')
  const [showMap, setShowMap] = useState(false)
  const [listView, setListView] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [bookingStep, setBookingStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [bookingDate, setBookingDate] = useState('')
  const [bookingSlot, setBookingSlot] = useState('')
  const [selectedStylist, setSelectedStylist] = useState('No Preference')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [bookingTab, setBookingTab] = useState<BookingTab>('upcoming')
  const [reviewSort, setReviewSort] = useState<ReviewSort>('recent')
  const [newRating, setNewRating] = useState(0)
  const [newReviewText, setNewReviewText] = useState('')
  const [newPhotoName, setNewPhotoName] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authStep, setAuthStep] = useState<'details' | 'otp'>('details')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authCity, setAuthCity] = useState(city)
  const [authOtp, setAuthOtp] = useState('')
  const [toast, setToast] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('city', city)
    setIsLoading(true)
    const timer = window.setTimeout(() => setIsLoading(false), 600)
    return () => window.clearTimeout(timer)
  }, [city])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const citySalons = useMemo(() => salons.filter((salon) => salon.city === city), [salons, city])

  const selectedSalon = useMemo(
    () => salons.find((salon) => salon.id === selectedSalonId) ?? citySalons[0] ?? null,
    [salons, selectedSalonId, citySalons],
  )

  const filteredSalons = useMemo(() => {
    const query = search.trim().toLowerCase()
    const list = citySalons.filter((salon) => {
      const categoryMatch =
        filters.categories.length === 0 ||
        salon.services.some((service) => filters.categories.includes(service.category))
      const priceMatch = salon.services.some((service) => service.price <= filters.priceMax)
      const ratingMatch = salon.rating >= filters.ratingMin
      const areaMatch = !filters.area || salon.area.toLowerCase().includes(filters.area.toLowerCase())
      const openMatch = !filters.openNow || salon.tags.includes('Open Now')
      const todayMatch = !filters.availableToday || salon.tags.includes('Available Today')
      const queryMatch =
        !query ||
        salon.name.toLowerCase().includes(query) ||
        salon.area.toLowerCase().includes(query) ||
        salon.services.some((service) => service.name.toLowerCase().includes(query))

      return categoryMatch && priceMatch && ratingMatch && areaMatch && openMatch && todayMatch && queryMatch
    })

    return [...list].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'price') {
        return Math.min(...a.services.map((service) => service.price)) - Math.min(...b.services.map((service) => service.price))
      }
      if (sortBy === 'distance') return a.distance - b.distance
      return b.reviewCount - a.reviewCount
    })
  }, [citySalons, filters, search, sortBy])

  const paginatedSalons = useMemo(() => filteredSalons.slice(0, page * 6), [filteredSalons, page])

  const totalCost = useMemo(() => {
    if (!selectedSalon) return 0
    return selectedSalon.services
      .filter((service) => selectedServices.includes(service.name))
      .reduce((sum, service) => sum + service.price, 0)
  }, [selectedSalon, selectedServices])

  const reviewedSalon = useMemo(() => {
    if (!selectedSalon) return [] as Review[]
    const all = [...selectedSalon.reviews]
    if (reviewSort === 'highest') return all.sort((a, b) => b.rating - a.rating)
    if (reviewSort === 'lowest') return all.sort((a, b) => a.rating - b.rating)
    return all.sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }, [selectedSalon, reviewSort])

  const myBookings = [
    { id: 'BK-83411', salon: 'Velvet Mirror Studio', date: '2026-06-22', status: 'upcoming' },
    { id: 'BK-81403', salon: 'Urban Rituals Salon', date: '2026-06-03', status: 'past' },
    { id: 'BK-80177', salon: 'Gloss House', date: '2026-05-29', status: 'cancelled' },
  ]

  const nearbyCity = CITIES.find((item) => item !== city && salons.some((salon) => salon.city === item))

  function goToSalonDetails(id: number) {
    setSelectedSalonId(id)
    setScreen('detail')
  }

  function beginBooking(id?: number) {
    if (id) setSelectedSalonId(id)
    setBookingStep(1)
    setSelectedServices([])
    setBookingDate('')
    setBookingSlot('')
    setSelectedStylist('No Preference')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setCustomerNotes('')
    setScreen('booking')
  }

  function submitBooking() {
    const id = `BK-${Math.floor(10000 + Math.random() * 90000)}`
    setBookingId(id)
    setScreen('confirmation')
    setToast('Booking confirmed successfully.')
  }

  function postReview() {
    if (!selectedSalon || !newRating || !newReviewText.trim()) {
      setToast('Please add a rating and review comment.')
      return
    }

    const nextReview: Review = {
      rating: newRating,
      date: new Date().toISOString().slice(0, 10),
      comment: newReviewText,
      author: 'You',
      photo: newPhotoName || undefined,
    }

    setSalons((prev) =>
      prev.map((salon) =>
        salon.id === selectedSalon.id
          ? {
              ...salon,
              reviews: [nextReview, ...salon.reviews],
              reviewCount: salon.reviewCount + 1,
              rating: (salon.rating * salon.reviewCount + nextReview.rating) / (salon.reviewCount + 1),
            }
          : salon,
      ),
    )
    setNewRating(0)
    setNewReviewText('')
    setNewPhotoName('')
    setToast('Thanks! Your review has been posted.')
  }

  function stepReady() {
    if (bookingStep === 1) return selectedServices.length > 0
    if (bookingStep === 2) return Boolean(bookingDate && bookingSlot)
    if (bookingStep === 4) return Boolean(customerName && customerPhone && customerEmail)
    return true
  }

  function startSignup() {
    setAuthMode('signup')
    setAuthStep('details')
    setSignedIn(false)
  }

  function startLogin() {
    setAuthMode('login')
    setAuthStep('details')
    setSignedIn(false)
  }

  function submitAuthDetails() {
    if (!authEmail || !authPhone || (authMode === 'signup' && (!authName || !authCity))) {
      setToast('Please enter the required details first.')
      return
    }

    setAuthStep('otp')
    setToast('OTP sent to your phone.')
  }

  function verifyOtp() {
    if (authOtp.trim().length < 4) {
      setToast('Enter the OTP to continue.')
      return
    }

    setSignedIn(true)
    setScreen('account')
    setToast('Login successful.')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="logo" type="button" onClick={() => setScreen('home')}>ShearCity</button>

        <div className={`topbar-links ${mobileMenu ? 'open' : ''}`}>
          <label className="city-control">
            <span>City</span>
            <select value={city} onChange={(event) => setCity(event.target.value)}>
              {CITIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="search-control">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search salon, service, area" />
          </label>

          <button className="ghost" type="button" onClick={() => setScreen('account')}>Login / Signup</button>
        </div>

        <button className="hamburger" type="button" onClick={() => setMobileMenu((value) => !value)}>Menu</button>
      </header>

      <main>
        {screen === 'home' && (
          <>
            <section className="hero-section">
              <div>
                <h1>Beauty appointments in your city, booked in minutes.</h1>
                <p>Discover salons across {city}, compare ratings and prices, and lock your slot instantly.</p>
                <div className="hero-actions">
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try: Haircut in Bandra" />
                  <button type="button" onClick={() => setScreen('listings')}>Find Salons</button>
                </div>
              </div>
              <div className="hero-card">
                <strong>Top picks in {city}</strong>
                <ul>
                  {citySalons.slice(0, 3).map((salon) => (
                    <li key={salon.id}><span>{salon.name}</span><small>{salon.rating.toFixed(1)} stars</small></li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="section-block">
              <div className="section-head"><h2>Featured salons</h2><button className="ghost" type="button" onClick={() => setScreen('listings')}>View all</button></div>
              <div className="featured-grid">
                {citySalons.slice(0, 4).map((salon) => (
                  <article key={salon.id} className="featured-card" onClick={() => goToSalonDetails(salon.id)}>
                    <div className="thumb">{salon.images[0]}</div>
                    <h3>{salon.name}</h3>
                    <p>{salon.area} • {salon.distance} km</p>
                    <span>{salon.rating.toFixed(1)} stars</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="section-block"><h2>Categories</h2><div className="chips-row">{CATEGORIES.map((category) => <button key={category} className="chip" type="button" onClick={() => { setFilters({ ...DEFAULT_FILTERS, categories: [category] }); setScreen('listings') }}>{category}</button>)}</div></section>

            <section className="section-block how-it-works"><h2>How it works</h2><div className="steps-grid"><article><strong>1. Search</strong><p>Find nearby salons by service, rating, and availability.</p></article><article><strong>2. Book</strong><p>Pick your services, date, and preferred stylist.</p></article><article><strong>3. Relax</strong><p>Show up and enjoy your appointment, stress free.</p></article></div></section>

            <section className="section-block testimonials"><h2>What customers say</h2><div className="testimonial-grid">{salons.length > 0 && salons.slice(0, 3).map((salon) => salon.reviews && salon.reviews.length > 0 ? <blockquote key={salon.id}><p>{salon.reviews[0].comment}</p><cite>{salon.reviews[0].author} at {salon.name}</cite></blockquote> : null)}</div></section>

            <section className="owner-cta"><div><h2>Own a salon?</h2><p>Grow bookings and manage your calendar from one dashboard.</p></div><button type="button" onClick={() => setScreen('owner')}>List your salon</button></section>
          </>
        )}

        {screen === 'listings' && (
          <section className="listing-layout">
            <aside className="filters-panel">
              <h2>Filters</h2>
              <div><p>Services</p>{CATEGORIES.map((category) => <label key={category} className="checkbox-line"><input type="checkbox" checked={filters.categories.includes(category)} onChange={(event) => setFilters((prev) => ({ ...prev, categories: event.target.checked ? [...prev.categories, category] : prev.categories.filter((item) => item !== category) }))} />{category}</label>)}</div>
              <div><p>Max Price: Rs {filters.priceMax}</p><input type="range" min={500} max={5000} step={100} value={filters.priceMax} onChange={(event) => setFilters((prev) => ({ ...prev, priceMax: Number(event.target.value) }))} /></div>
              <div><p>Rating</p><select value={filters.ratingMin} onChange={(event) => setFilters((prev) => ({ ...prev, ratingMin: Number(event.target.value) }))}><option value={0}>Any</option><option value={4}>4+ stars</option><option value={4.5}>4.5+ stars</option></select></div>
              <div><p>Area</p><input placeholder="Area or locality" value={filters.area} onChange={(event) => setFilters((prev) => ({ ...prev, area: event.target.value }))} /></div>
              <label className="checkbox-line"><input type="checkbox" checked={filters.openNow} onChange={(event) => setFilters((prev) => ({ ...prev, openNow: event.target.checked }))} />Open Now</label>
              <label className="checkbox-line"><input type="checkbox" checked={filters.availableToday} onChange={(event) => setFilters((prev) => ({ ...prev, availableToday: event.target.checked }))} />Available Today</label>
              <button className="ghost" type="button" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear all filters</button>
            </aside>

            <div className="listing-main">
              <div className="listing-tools"><div className="chips-row compact">{filters.categories.map((item) => <button key={item} className="chip removable" type="button" onClick={() => setFilters((prev) => ({ ...prev, categories: prev.categories.filter((category) => category !== item) }))}>{item} x</button>)}</div><div className="tool-actions"><select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}><option value="popularity">Sort: Popularity</option><option value="rating">Sort: Rating</option><option value="price">Sort: Price</option><option value="distance">Sort: Distance</option></select><button className="ghost" type="button" onClick={() => setListView((v) => (v === 'grid' ? 'list' : 'grid'))}>{listView === 'grid' ? 'List View' : 'Grid View'}</button><button className="ghost" type="button" onClick={() => setShowMap((value) => !value)}>{showMap ? 'Hide Map' : 'Map View'}</button></div></div>

              {showMap && <div className="map-box">Interactive map preview for {city} listings.</div>}
              {isLoading && <div className="skeleton-grid">{[...Array(6)].map((_, index) => <div className="skeleton-card" key={index}></div>)}</div>}

              {!isLoading && filteredSalons.length === 0 && <div className="empty-state"><h3>No salons found in this area.</h3><p>Try clearing filters or switch to {nearbyCity || 'another'} city for more options.</p><button type="button" onClick={() => { setCity(nearbyCity || 'Mumbai'); setFilters(DEFAULT_FILTERS) }}>Show nearby city</button></div>}

              {!isLoading && filteredSalons.length > 0 && <div className={`salon-results ${listView}`}>{paginatedSalons.map((salon) => <article key={salon.id} className="salon-card"><div className="thumb">{salon.images[0]}</div><div><h3>{salon.name}</h3><p>{salon.rating.toFixed(1)} ({salon.reviewCount}) • {salon.distance} km • {salon.area}</p><p>Starts from Rs {Math.min(...salon.services.map((service) => service.price))}</p><div className="chips-row compact">{salon.tags.map((tag) => <span key={tag} className="chip soft">{tag}</span>)}</div><div className="card-actions"><button type="button" onClick={() => goToSalonDetails(salon.id)}>View Details</button><button className="ghost" type="button" onClick={() => beginBooking(salon.id)}>Book Now</button></div></div></article>)}</div>}

              {!isLoading && paginatedSalons.length < filteredSalons.length && <button className="load-more" type="button" onClick={() => setPage((value) => value + 1)}>Load more salons</button>}
            </div>
          </section>
        )}

        {screen === 'detail' && selectedSalon && (
          <section className="detail-layout">
            <div className="gallery-row">{selectedSalon.images.map((label) => <div key={label} className="gallery-item">{label}</div>)}</div>
            <div className="detail-header"><div><h2>{selectedSalon.name}</h2><p>{selectedSalon.address}</p><p>{selectedSalon.distance} km away • Open {selectedSalon.hours}</p></div><div className="detail-meta"><strong>{selectedSalon.rating.toFixed(1)} stars</strong><span>{selectedSalon.reviewCount} reviews</span><button className="ghost" type="button" onClick={() => setToast('Saved to favorites.')}>Save</button><button className="ghost" type="button" onClick={() => setToast('Share link copied.')}>Share</button></div></div>

            <div className="rating-breakdown">{[5, 4, 3, 2, 1].map((star) => { const count = selectedSalon.reviews.filter((review) => review.rating === star).length; const percent = Math.max(8, (count / Math.max(1, selectedSalon.reviews.length)) * 100); return <div key={star} className="bar-row"><span>{star} star</span><div className="bar-track"><div className="bar-fill" style={{ width: `${percent}%` }}></div></div><span>{count}</span></div> })}</div>

            <section className="section-block"><h3>Services & pricing</h3><table><thead><tr><th>Service</th><th>Duration</th><th>Price</th></tr></thead><tbody>{selectedSalon.services.map((service) => <tr key={service.name}><td>{service.name}</td><td>{service.duration} mins</td><td>Rs {service.price}</td></tr>)}</tbody></table></section>

            <section className="section-block"><h3>Stylists</h3><div className="staff-grid">{selectedSalon.staff.map((member) => <article key={member.name} className="staff-card"><div className="avatar">{member.name.slice(0, 1)}</div><strong>{member.name}</strong><p>{member.specialty}</p></article>)}</div></section>

            <section className="section-block"><div className="section-head"><h3>Reviews</h3><select value={reviewSort} onChange={(event) => setReviewSort(event.target.value as ReviewSort)}><option value="recent">Most recent</option><option value="highest">Highest rating</option><option value="lowest">Lowest rating</option></select></div><div className="review-form"><p>Leave a review</p><div className="star-input">{[1, 2, 3, 4, 5].map((value) => <button key={value} className={value <= newRating ? 'active' : ''} type="button" onClick={() => setNewRating(value)}>Star {value}</button>)}</div><textarea placeholder="Write your review" value={newReviewText} onChange={(event) => setNewReviewText(event.target.value)} /><input type="text" placeholder="Optional photo file name" value={newPhotoName} onChange={(event) => setNewPhotoName(event.target.value)} /><button type="button" onClick={postReview}>Post review</button></div><div className="review-list">{reviewedSalon.map((review, index) => <article key={`${review.author}-${index}`} className="review-card"><p>{review.rating} stars • {review.date}</p><strong>{review.author}</strong><p>{review.comment}</p>{review.photo && <small>Photo: {review.photo}</small>}</article>)}</div></section>

            <button className="sticky-cta" type="button" onClick={() => beginBooking()}>Book Appointment</button>
          </section>
        )}

        {screen === 'booking' && selectedSalon && (
          <section className="booking-layout">
            <h2>Book appointment at {selectedSalon.name}</h2>
            <div className="stepper">{[1, 2, 3, 4, 5].map((step) => <span key={step} className={bookingStep === step ? 'active' : ''}>Step {step}</span>)}</div>

            {bookingStep === 1 && <div className="step-card"><h3>Step 1 - Select services</h3>{selectedSalon.services.map((service) => <label key={service.name} className="checkbox-line"><input type="checkbox" checked={selectedServices.includes(service.name)} onChange={(event) => setSelectedServices((prev) => event.target.checked ? [...prev, service.name] : prev.filter((name) => name !== service.name))} />{service.name} - Rs {service.price} ({service.duration} mins)</label>)}</div>}
            {bookingStep === 2 && <div className="step-card"><h3>Step 2 - Date and time</h3><input type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} /><div className="slot-grid">{TIME_SLOTS.map((slot, index) => { const unavailable = index % 3 === 0; return <button key={slot} className={bookingSlot === slot ? 'active' : ''} disabled={unavailable} type="button" onClick={() => setBookingSlot(slot)}>{slot} {unavailable ? '(Unavailable)' : ''}</button> })}</div></div>}
            {bookingStep === 3 && <div className="step-card"><h3>Step 3 - Select stylist</h3><select value={selectedStylist} onChange={(event) => setSelectedStylist(event.target.value)}><option>No Preference</option>{selectedSalon.staff.map((member) => <option key={member.name}>{member.name}</option>)}</select></div>}
            {bookingStep === 4 && <div className="step-card form-grid"><h3>Step 4 - Customer details</h3><input placeholder="Full name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} /><input placeholder="Phone" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} /><input placeholder="Email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} /><textarea placeholder="Notes for the salon" value={customerNotes} onChange={(event) => setCustomerNotes(event.target.value)} /></div>}
            {bookingStep === 5 && <div className="step-card"><h3>Step 5 - Review and confirm</h3><p>Services: {selectedServices.join(', ')}</p><p>Slot: {bookingDate || 'No date selected'} at {bookingSlot || 'No time selected'}</p><p>Stylist: {selectedStylist}</p><p>Total: Rs {totalCost}</p></div>}

            <div className="booking-actions"><button className="ghost" type="button" disabled={bookingStep === 1} onClick={() => setBookingStep((step) => Math.max(1, step - 1))}>Back</button>{bookingStep < 5 ? <button type="button" disabled={!stepReady()} onClick={() => setBookingStep((step) => Math.min(5, step + 1))}>Continue</button> : <button type="button" onClick={submitBooking}>Confirm booking</button>}</div>
          </section>
        )}

        {screen === 'confirmation' && <section className="confirmation-card"><h2>Booking confirmed</h2><p>Your booking ID: {bookingId}</p><p>{selectedSalon?.name} • {bookingDate} • {bookingSlot}</p><p>Total: Rs {totalCost}</p><div className="card-actions"><button type="button" onClick={() => setToast('Calendar invite generated.')}>Add to calendar</button><button className="ghost" type="button" onClick={() => setScreen('home')}>Back to Home</button></div></section>}

        {screen === 'account' && (
          <section className="account-layout">
            {!signedIn ? (
              <div className="account-grid">
                <article className="section-block">
                  <div className="section-head">
                    <h2>{authMode === 'signup' ? 'Sign Up' : 'Login / Signup'}</h2>
                    <div className="card-actions">
                      <button type="button" className={authMode === 'login' ? 'chip active' : 'chip'} onClick={startLogin}>
                        Login
                      </button>
                      <button type="button" className={authMode === 'signup' ? 'chip active' : 'chip'} onClick={startSignup}>
                        Sign Up
                      </button>
                    </div>
                  </div>

                  {authStep === 'details' && (
                    <div className="form-grid">
                      {authMode === 'signup' && (
                        <>
                          <input placeholder="Full name" value={authName} onChange={(event) => setAuthName(event.target.value)} />
                          <select value={authCity} onChange={(event) => setAuthCity(event.target.value)}>
                            {CITIES.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                      <input placeholder="Email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} />
                      <input placeholder="Phone number" value={authPhone} onChange={(event) => setAuthPhone(event.target.value)} />
                      <input placeholder={authMode === 'signup' ? 'Create password' : 'Password'} type="password" />
                      <button type="button" onClick={submitAuthDetails}>
                        {authMode === 'signup' ? 'Continue to OTP' : 'Login'}
                      </button>
                    </div>
                  )}

                  {authStep === 'otp' && (
                    <div className="form-grid">
                      <p>Enter the OTP sent to {authPhone || 'your phone'}.</p>
                      <input placeholder="Enter OTP" value={authOtp} onChange={(event) => setAuthOtp(event.target.value)} />
                      <div className="card-actions">
                        <button type="button" className="ghost" onClick={() => setAuthStep('details')}>
                          Back
                        </button>
                        <button type="button" onClick={verifyOtp}>
                          Verify OTP
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              </div>
            ) : (
              <div className="account-grid">
                <article className="section-block">
                  <h2>My bookings</h2>
                  <div className="chips-row compact">
                    {(['upcoming', 'past', 'cancelled'] as BookingTab[]).map((tab) => (
                      <button key={tab} className={`chip ${bookingTab === tab ? 'active' : ''}`} type="button" onClick={() => setBookingTab(tab)}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="review-list">
                    {myBookings
                      .filter((item) => item.status === bookingTab)
                      .map((item) => (
                        <article key={item.id} className="review-card">
                          <strong>{item.salon}</strong>
                          <p>
                            {item.id} • {item.date}
                          </p>
                          {item.status === 'upcoming' && (
                            <div className="card-actions">
                              <button className="ghost" type="button" onClick={() => setCancelModalOpen(true)}>
                                Cancel
                              </button>
                              <button className="ghost" type="button" onClick={() => setToast('Reschedule flow coming soon.') }>
                                Reschedule
                              </button>
                            </div>
                          )}
                        </article>
                      ))}
                  </div>
                </article>

                <article className="section-block">
                  <h2>Saved salons</h2>
                  <div className="review-list">
                    {salons.slice(0, 2).map((salon) => (
                      <article key={salon.id} className="review-card">
                        <strong>{salon.name}</strong>
                        <p>{salon.area}</p>
                      </article>
                    ))}
                  </div>
                </article>
              </div>
            )}
          </section>
        )}

        {screen === 'owner' && <section className="owner-layout"><h2>Salon owner dashboard</h2><div className="owner-grid"><article className="section-block"><h3>Salon profile</h3><div className="form-grid"><input placeholder="Salon name" /><input placeholder="Address" /><input placeholder="Hours" /><textarea placeholder="Services and pricing" /><button type="button" onClick={() => setToast('Salon profile saved.')}>Save</button></div></article><article className="section-block"><h3>Incoming bookings</h3><div className="review-list"><article className="review-card"><strong>BK-92013</strong><p>Hair smoothening • Today 05:00 PM</p></article><article className="review-card"><strong>BK-92018</strong><p>Bridal trial • Tomorrow 11:30 AM</p></article></div></article><article className="section-block"><h3>Reviews management</h3><div className="review-list"><article className="review-card"><p>"Loved the facial package"</p><button className="ghost" type="button" onClick={() => setToast('Reply sent to customer.')}>Respond</button></article></div></article><article className="section-block"><h3>Analytics</h3><div className="stats-grid"><div><strong>36</strong><p>Bookings this week</p></div><div><strong>Rs 82,000</strong><p>Revenue estimate</p></div></div></article></div></section>}
      </main>

      <footer><nav><button type="button" onClick={() => setScreen('home')}>About</button><button type="button" onClick={() => setToast('Contact: hello@shearcity.com')}>Contact</button><button type="button" onClick={() => setToast('Social links opened.')}>Social</button><button type="button" onClick={() => setToast('Terms & Privacy page coming soon.')}>Terms/Privacy</button></nav></footer>

      <nav className="mobile-bottom-nav"><button type="button" onClick={() => setScreen('home')}>Home</button><button type="button" onClick={() => setScreen('listings')}>Search</button><button type="button" onClick={() => setScreen('account')}>Bookings</button><button type="button" onClick={() => setScreen('account')}>Profile</button></nav>

      {toast && <div className="toast">{toast}</div>}

      {cancelModalOpen && <div className="modal-backdrop"><div className="modal-box"><h3>Cancel booking?</h3><p>This action cannot be undone.</p><div className="card-actions"><button className="ghost" type="button" onClick={() => { setCancelModalOpen(false); setToast('Booking cancelled.') }}>Yes, cancel</button><button type="button" onClick={() => setCancelModalOpen(false)}>Keep booking</button></div></div></div>}
    </div>
  )
}

export default App
