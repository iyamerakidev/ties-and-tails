import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft,
  Copy, Heart, Instagram, Leaf, Menu, Minus, PackageCheck,
  PawPrint, Plus, Search, ShieldCheck, ShoppingBag,
  SlidersHorizontal, Sparkles, Trash2, X,
} from 'lucide-react'
import { categories, getProduct, peso, products } from './data'

const IMG = '/images/'

function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage may be unavailable */ }
  }, [key, value])
  return [value, setValue]
}

function Brand({ onClick }) {
  return (
    <a className="brand" href="#home" onClick={onClick} aria-label="Ties and Tails home">
      <img src={`${IMG}brand-mark.png`} alt="" className="brand-logo" />
      <span className="brand-type"><strong>TIES <em>&</em> TAILS</strong><small>the everyday pet edit</small></span>
    </a>
  )
}

function IconButton({ label, onClick, children, count = 0, className = '' }) {
  return (
    <button className={`icon-button ${className}`} type="button" aria-label={label} onClick={onClick}>
      {children}
      {count > 0 && <span className="icon-count">{count > 99 ? '99+' : count}</span>}
    </button>
  )
}

function ProductCard({ product, onOpen, onQuickAdd, isFavorite, onFavorite }) {
  return (
    <article className="product-card">
      <button className="product-visual" style={{ backgroundColor: product.color }} onClick={() => onOpen(product)} type="button" aria-label={`View ${product.name}, ${product.subtitle}`}>
        <span className="product-badge">{product.badge}</span>
        <img src={product.image} alt={`${product.name} — ${product.subtitle}`} loading="lazy" />
        <span className="product-view">View details <ArrowUpRight size={15} /></span>
      </button>
      <button className={`favorite-dot ${isFavorite ? 'is-active' : ''}`} onClick={() => onFavorite(product.id)} type="button" aria-label={isFavorite ? `Remove ${product.subtitle} from wishlist` : `Save ${product.subtitle} to wishlist`} aria-pressed={isFavorite}>
        <Heart size={19} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.8} />
      </button>
      <div className="product-bottom">
        <span className="product-kicker">{product.categoryName}</span>
        <button type="button" className="product-name-button" onClick={() => onOpen(product)}>
          <span className="product-title">{product.name}</span>
          <span className="product-subtitle">{product.subtitle}</span>
        </button>
        <div className="product-price-row">
          <div><span className="product-price">{peso(product.price)}</span><span className="product-from">{product.variants.length > 1 ? 'from' : 'demo price'}</span></div>
          <button type="button" className="mini-add" onClick={() => onQuickAdd(product)} aria-label={`Add ${product.subtitle} to bag`}><Plus size={19} /></button>
        </div>
      </div>
    </article>
  )
}

function CountSelector({ count, onMinus, onPlus, min = 1 }) {
  return (
    <div className="count-selector">
      <button type="button" onClick={onMinus} disabled={count <= min} aria-label="Decrease quantity"><Minus size={16} /></button>
      <span aria-live="polite">{count}</span>
      <button type="button" onClick={onPlus} aria-label="Increase quantity"><Plus size={16} /></button>
    </div>
  )
}

function ProductDialog({ product, onClose, onAdd, onToggleFavorite, isFavorite }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
        <button className="modal-close" onClick={onClose} type="button" aria-label="Close product details"><X size={21} /></button>
        <div className="modal-image" style={{ background: product.color }}>
          <img src={product.image} alt={`${product.name}, ${product.subtitle}`} />
          <span className="modal-photo-note">Actual packaging shown for reference</span>
        </div>
        <div className="modal-info">
          <div className="eyebrow">TIES & TAILS / {product.categoryName.toUpperCase()}</div>
          <h2 id="product-dialog-title">{product.name}</h2>
          <p className="modal-subtitle">{product.subtitle}</p>
          <div className="modal-price">{peso(selectedVariant.price)} <span>Sample price</span></div>
          <p className="modal-desc">{product.details}</p>
          <div className="modal-features">{product.features.map((f) => <span key={f}><Check size={14} /> {f}</span>)}</div>
          <div className="variant-section">
            <div className="option-title">Choose your option <span>{selectedVariant.label}</span></div>
            <div className="variant-grid">{product.variants.map((v) => <button type="button" className={`variant-btn ${selectedVariant.label === v.label ? 'selected' : ''}`} key={v.label} onClick={() => setSelectedVariant(v)}>{v.label}</button>)}</div>
          </div>
          <div className="modal-action-row">
            <CountSelector count={quantity} onMinus={() => setQuantity((q) => Math.max(1, q - 1))} onPlus={() => setQuantity((q) => q + 1)} />
            <button type="button" className="btn btn-dark add-full" onClick={() => onAdd(product, selectedVariant, quantity)}>Add to bag · {peso(selectedVariant.price * quantity)} <ShoppingBag size={18} /></button>
          </div>
          <button type="button" className="modal-save" onClick={() => onToggleFavorite(product.id)}><Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'Saved to your wishlist' : 'Save to wishlist'}</button>
          <p className="demo-fine-print">This is a storefront demo. Final prices, stock, sizes, and delivery terms must be confirmed before accepting real orders.</p>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ items, onClose, onRemove, onUpdateQuantity, onBrowse, onCopied }) {
  const [step, setStep] = useState('bag')
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' })
  const [copyState, setCopyState] = useState('')
  const fullItems = items.map((item) => ({ ...item, product: getProduct(item.id) })).filter((item) => item.product)
  const subtotal = fullItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const totalQty = fullItems.reduce((sum, i) => sum + i.quantity, 0)

  const copyInquiry = async (event) => {
    event.preventDefault()
    const content = [
      'TIES & TAILS — ORDER INQUIRY (NOT A PLACED ORDER)',
      '',
      ...fullItems.map((item) => `• ${item.product.name} (${item.product.subtitle}) — ${item.variant} × ${item.quantity} = ${peso(item.unitPrice * item.quantity)}`),
      '',
      `Example subtotal: ${peso(subtotal)}`,
      'Shipping: To be confirmed by the shop',
      'All prices in this inquiry are demonstration values.',
      '',
      `Name: ${customer.name}`,
      `Phone: ${customer.phone}`,
      `Email: ${customer.email}`,
      `Delivery address: ${customer.address}`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(content)
      setCopyState('copied')
      onCopied()
    } catch {
      // Fallback: let the shopper select the inquiry manually.
      window.prompt('Select and copy your order inquiry', content)
      setCopyState('manual')
    }
  }
  return (
    <div className="overlay drawer-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="drawer-head">
          <div className="drawer-heading">
            {step === 'checkout' && <button type="button" className="plain-icon" onClick={() => setStep('bag')} aria-label="Back to bag"><ChevronLeft size={24} /></button>}
            <div><span className="eyebrow">THE EVERYDAY PET EDIT</span><h2 id="cart-title">{step === 'bag' ? 'Your little bag' : 'Checkout preview'}</h2></div>
          </div>
          <button type="button" className="plain-icon" onClick={onClose} aria-label="Close bag"><X size={23} /></button>
        </div>
        {step === 'bag' ? (
          <>
            <div className="drawer-content">
              {fullItems.length === 0 ? <div className="empty-state"><ShoppingBag size={48} strokeWidth={1.3} /><h3>Your bag is having a little nap.</h3><p>Find something lovely for your four-legged bestie.</p><button className="btn btn-dark" type="button" onClick={onBrowse}>Explore the shop <ArrowRight size={17} /></button></div> : <>
                <p className="drawer-caption">{totalQty} {totalQty === 1 ? 'item' : 'items'} in your bag</p>
                <div className="cart-items">{fullItems.map((item) => <div className="cart-item" key={`${item.id}-${item.variant}`}>
                  <div className="cart-item-picture" style={{ background: item.product.color }}><img src={item.product.image} alt="" /></div>
                  <div className="cart-item-details"><div className="cart-item-title">{item.product.name}</div><div className="cart-item-subtitle">{item.product.subtitle} · {item.variant}</div><strong>{peso(item.unitPrice * item.quantity)}</strong><div className="cart-item-controls"><CountSelector count={item.quantity} onMinus={() => onUpdateQuantity(item.id, item.variant, -1)} onPlus={() => onUpdateQuantity(item.id, item.variant, 1)} /><button className="remove-button" type="button" aria-label="Remove item" onClick={() => onRemove(item.id, item.variant)}><Trash2 size={16} /></button></div></div>
                </div>)}</div>
              </>}
            </div>
            {fullItems.length > 0 && <div className="drawer-footer">
              <div className="drawer-total"><span>Subtotal</span><strong>{peso(subtotal)}</strong></div>
              <p className="shipping-help">Example prices only. Shipping and official prices are confirmed by the shop.</p>
              <button className="btn btn-dark btn-wide" onClick={() => setStep('checkout')}>Continue to checkout preview <ArrowRight size={17} /></button>
              <button className="continue-shop" onClick={onBrowse} type="button">Keep browsing</button>
            </div>}
          </>
        ) : (
          <form className="checkout-form" onSubmit={copyInquiry}>
            <p className="checkout-note"><ShieldCheck size={19} /> This is a demo checkout. No payment is taken and no order is submitted.</p>
            <h3>Contact & delivery details</h3>
            <label>Full name<input required autoComplete="name" placeholder="Your full name" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} /></label>
            <label>Email address<input type="email" required autoComplete="email" placeholder="you@example.com" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} /></label>
            <label>Mobile number<input required inputMode="tel" autoComplete="tel" placeholder="09XX XXX XXXX" value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} /></label>
            <label>Delivery address<textarea rows="3" required autoComplete="street-address" placeholder="Street, barangay, city, province" value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} /></label>
            <div className="checkout-summary"><div><span>Items subtotal</span><strong>{peso(subtotal)}</strong></div><div><span>Shipping</span><span>To be confirmed</span></div></div>
            <button type="submit" className="btn btn-dark btn-wide"><Copy size={18} /> {copyState === 'copied' ? 'Copy again' : 'Copy order inquiry'}</button>
            {copyState === 'copied' && <p className="copied-message"><Check size={16} /> Inquiry copied. Send it to Ties & Tails to ask about availability and final prices.</p>}
            <a className="instagram-checkout" href="https://www.instagram.com/tiesandtails.ph/" target="_blank" rel="noreferrer"><Instagram size={17} /> Message @tiesandtails.ph <ArrowUpRight size={15} /></a>
          </form>
        )}
      </aside>
    </div>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [sort, setSort] = useState('featured')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useStoredState('tt-wishlist-v1', [])
  const [cart, setCart] = useStoredState('tt-bag-v1', [])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const searchRef = useRef(null)

  const cartCount = cart.reduce((sum, p) => sum + p.quantity, 0)
  const visibleProducts = useMemo(() => {
    const query = search.toLowerCase().trim()
    let result = products.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory
      const matchesSearch = !query || `${p.name} ${p.subtitle} ${p.categoryName} ${p.features.join(' ')}`.toLowerCase().includes(query)
      const matchesSaved = !favoritesOnly || favorites.includes(p.id)
      return matchesCategory && matchesSearch && matchesSaved
    })
    if (sort === 'price-asc') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)
    if (sort === 'name') result = [...result].sort((a, b) => `${a.name} ${a.subtitle}`.localeCompare(`${b.name} ${b.subtitle}`))
    return result
  }, [activeCategory, search, sort, favoritesOnly, favorites])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    if (!selectedProduct && !cartOpen && !menuOpen) return
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedProduct(null)
        setCartOpen(false)
        setMenuOpen(false)
      }
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onEscape)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onEscape) }
  }, [selectedProduct, cartOpen, menuOpen])

  const goTo = (id) => {
    setMenuOpen(false)
    setCartOpen(false)
    setSelectedProduct(null)
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
  }
  const chooseCategory = (category) => {
    setActiveCategory(category)
    setFavoritesOnly(false)
    goTo('shop')
  }
  const showFavorites = () => {
    setFavoritesOnly((current) => !current)
    setActiveCategory('all')
    goTo('shop')
  }
  const toggleFavorite = (id) => {
    setFavorites((list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id])
  }
  const addToCart = (product, variant = product.variants[0], quantity = 1) => {
    setCart((items) => {
      const match = items.find((i) => i.id === product.id && i.variant === variant.label)
      if (match) return items.map((i) => (i.id === product.id && i.variant === variant.label) ? { ...i, quantity: i.quantity + quantity } : i)
      return [...items, { id: product.id, variant: variant.label, unitPrice: variant.price, quantity }]
    })
    setSelectedProduct(null)
    setToast(`${product.subtitle} added to your bag`)
  }
  const removeItem = (id, variant) => setCart((items) => items.filter((i) => !(i.id === id && i.variant === variant)))
  const updateQuantity = (id, variant, delta) => setCart((items) => items.map((i) => (i.id === id && i.variant === variant) ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
  const openSearch = () => {
    setSearchOpen((v) => !v)
    if (!searchOpen) window.setTimeout(() => searchRef.current?.focus(), 0)
  }

  return (
    <div className="site" id="home">
      <div className="announcement"><Sparkles size={13} /><span>A little love for every paw, every day.</span><Sparkles size={13} /></div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand onClick={() => setMenuOpen(false)} />
          <nav className="desktop-nav" aria-label="Main navigation">
            <a className="nav-selected" href="#home">Home</a>
            <button onClick={() => chooseCategory('all')} type="button">Shop all</button>
            <a href="#categories">Categories</a>
            <a href="#our-story">Our story</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="header-actions">
            <IconButton label="Search products" onClick={openSearch}><Search size={21} strokeWidth={1.7} /></IconButton>
            <IconButton label="View wishlist" count={favorites.length} onClick={showFavorites} className="header-wishlist"><Heart size={21} strokeWidth={1.7} /></IconButton>
            <IconButton label={`Open shopping bag, ${cartCount} items`} count={cartCount} onClick={() => setCartOpen(true)}><ShoppingBag size={21} strokeWidth={1.7} /></IconButton>
            <IconButton label={menuOpen ? 'Close menu' : 'Open menu'} className="mobile-menu-button" onClick={() => setMenuOpen((v) => !v)}>{menuOpen ? <X size={24} /> : <Menu size={24} />}</IconButton>
          </div>
        </div>
        {searchOpen && <form className="search-panel" onSubmit={(e) => { e.preventDefault(); goTo('shop'); setSearchOpen(false) }}><Search size={20} /><input ref={searchRef} aria-label="Search catalog" placeholder="Try lavender litter, slow feeder, pet wipes..." value={search} onChange={(e) => setSearch(e.target.value)} /><button type="submit">Search <ArrowRight size={17} /></button><button type="button" className="search-x" onClick={() => { setSearch(''); setSearchOpen(false) }} aria-label="Close search"><X size={18} /></button></form>}
      </header>
      {menuOpen && <div className="mobile-menu" role="dialog" aria-label="Mobile navigation"><a href="#home" onClick={() => setMenuOpen(false)}>Home <ArrowUpRight size={18} /></a><button onClick={() => chooseCategory('all')}>Shop all <ArrowUpRight size={18} /></button><a href="#categories" onClick={() => setMenuOpen(false)}>Categories <ArrowUpRight size={18} /></a><a href="#our-story" onClick={() => setMenuOpen(false)}>Our story <ArrowUpRight size={18} /></a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact <ArrowUpRight size={18} /></a><span>GOOD THINGS FOR GOOD PETS ♡</span></div>}

      <main>
        <section className="hero-section">
          <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> THE EVERYDAY PET EDIT <PawPrint size={15} /></div>
              <h1>Life is better <span>with paws</span> in it.</h1>
              <p>Thoughtfully picked little essentials for the furry best friends who make your house feel like home.</p>
              <div className="hero-buttons"><button type="button" className="btn btn-dark" onClick={() => chooseCategory('all')}>Shop the collection <ArrowUpRight size={18} /></button><button type="button" className="text-link" onClick={() => goTo('our-story')}>Get to know us <ArrowRight size={18} /></button></div>
              <div className="hero-handnote"><span className="sketch-heart">♡</span> your partner in crime<br /> for everything pet.</div>
            </div>
            <div className="hero-art">
              <div className="hero-picture"><img src={`${IMG}lifestyle.webp`} alt="Happy golden retriever and fluffy gray cat with Ties and Tails pet essentials" fetchPriority="high" /><span className="photo-frame-label">HAPPY PETS, HAPPY HOMES</span></div>
              <div className="hero-float"><span className="float-icon"><PawPrint size={20} /></span><div><strong>For their little world</strong><small>and all the joy they bring.</small></div></div>
              <span className="hero-squiggle">✳</span>
            </div>
          </div>
          <div className="hero-bottom-swoop" />
        </section>

        <div className="perks-strip"><div className="container perks-inner"><div><Leaf size={22} /><span>Thoughtfully selected</span></div><i /><div><Heart size={22} /><span>Made for everyday moments</span></div><i /><div><PackageCheck size={22} /><span>Pet care, simplified</span></div></div></div>

        <section className="categories-section section-space" id="categories">
          <div className="container">
            <div className="section-top"><div><span className="eyebrow section-eyebrow">A LITTLE SOMETHING FOR EVERY PET</span><h2>Shop by <em>category.</em></h2></div><button type="button" className="text-link section-view-all" onClick={() => chooseCategory('all')}>Explore everything <ArrowUpRight size={18} /></button></div>
            <div className="categories-grid">
              {categories.filter((c) => c.id !== 'all').map((category, index) => <button type="button" onClick={() => chooseCategory(category.id)} className={`category-card category-${index}`} key={category.id}>
                <div className="category-photo"><img src={category.image} alt="" loading="lazy" /></div>
                <div className="category-copy"><div><span>{category.count}</span><h3>{category.label}</h3></div><span className="round-arrow"><ArrowUpRight size={20} /></span></div>
              </button>)}
            </div>
          </div>
        </section>

        <section className="shop-section section-space" id="shop">
          <div className="container">
            <div className="shop-heading"><div><span className="eyebrow section-eyebrow">THE GOOD STUFF, ALL IN ONE PLACE</span><h2>{favoritesOnly ? <>Your <em>saved favorites.</em></> : <>Everyday <em>essentials.</em></>}</h2><p>A little of everything to make their everyday feel extra special.</p></div><span className="demo-pricing"><Sparkles size={14} /> Catalog demo · example prices</span></div>
            <div className="shop-controls">
              <div className="category-filters" role="group" aria-label="Filter product category">{categories.map((category) => <button key={category.id} type="button" onClick={() => { setActiveCategory(category.id); setFavoritesOnly(false) }} className={activeCategory === category.id && !favoritesOnly ? 'active' : ''}>{category.label}</button>)}<button type="button" className={favoritesOnly ? 'active' : ''} onClick={showFavorites}><Heart size={14} /> Saved</button></div>
              <div className="sort-wrap"><SlidersHorizontal size={16} /><label htmlFor="sort-products">Sort</label><select id="sort-products" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">A–Z</option></select><ChevronDown size={15} /></div>
            </div>
            {search.trim() && <div className="search-result">Searching for “{search}” <button type="button" onClick={() => setSearch('')}>Clear search <X size={14} /></button></div>}
            {visibleProducts.length > 0 ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} onQuickAdd={addToCart} isFavorite={favorites.includes(product.id)} onFavorite={toggleFavorite} />)}</div> : <div className="no-products"><PawPrint size={40} strokeWidth={1.5} /><h3>No little treasures found yet.</h3><p>Try another search or take a look at the whole collection.</p><button type="button" className="btn btn-dark" onClick={() => { setActiveCategory('all'); setFavoritesOnly(false); setSearch('') }}>See all essentials <ArrowRight size={17} /></button></div>}
            {visibleProducts.length > 0 && <p className="products-count">Showing {visibleProducts.length} of {products.length} thoughtfully picked essentials</p>}
          </div>
        </section>

        <section className="litter-feature section-space" id="our-story">
          <div className="container feature-grid">
            <div className="feature-photo-wrap"><div className="feature-photo"><img src={`${IMG}litter-guide.webp`} alt="Lavender premium bentonite cat litter bag" loading="lazy" /></div><div className="feature-sticker">4 lovely<br /><em>scents!</em><span>✳</span></div></div>
            <div className="feature-copy"><div className="eyebrow"><span className="eyebrow-line" /> LITTLE THINGS, BIG DIFFERENCE</div><h2>The litter routine, <em>a little lovelier.</em></h2><p>From lavender to coffee, our bentonite selection is all about making everyday care feel simpler, fresher, and a bit more you.</p><div className="feature-benefits"><div><span><Check size={17} /></span><div><strong>Quick clumping</strong><small>For an easier scoop-and-go routine</small></div></div><div><span><Check size={17} /></span><div><strong>Low dust</strong><small>Made with everyday cleanup in mind</small></div></div><div><span><Check size={17} /></span><div><strong>Odor control</strong><small>Help keep their little corner fresh</small></div></div></div><button type="button" className="btn btn-dark" onClick={() => chooseCategory('litter')}>Find their favorite scent <ArrowUpRight size={18} /></button></div>
          </div>
        </section>

        <section className="community-section" id="contact"><div className="container community-grid"><div><span className="eyebrow community-eyebrow">COME SAY HELLO</span><h2>Good pets. Good days. <em>Good company.</em></h2><p>Keep up with the cutest new arrivals, everyday pet tips, and all the little things we're excited about.</p><a className="btn btn-light" href="https://www.instagram.com/tiesandtails.ph/" target="_blank" rel="noreferrer"><Instagram size={18} /> Follow @tiesandtails.ph <ArrowUpRight size={17} /></a></div><div className="community-deco"><span className="big-heart">♡</span><span className="community-note">See you on<br />the pet side!</span><PawPrint size={110} strokeWidth={0.9} /></div></div></section>
      </main>

      <footer className="footer"><div className="container footer-main"><div className="footer-brand"><Brand /><p>Your partner in crime for everything pet. Curated with care for the little companions who make life a whole lot brighter.</p></div><div className="footer-column"><h3>Explore</h3><button onClick={() => chooseCategory('all')}>Shop all</button><button onClick={() => chooseCategory('litter')}>Cat litter</button><button onClick={() => chooseCategory('bowls')}>Feeding bowls</button><button onClick={() => chooseCategory('boxes')}>Litter boxes</button><button onClick={() => chooseCategory('wipes')}>Pet wipes</button></div><div className="footer-column"><h3>Find us</h3><a href="https://www.instagram.com/tiesandtails.ph/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14} /></a><span className="footer-unlinked">Facebook · add official page</span><p>Online shop preview<br />Based in the Philippines</p></div><div className="footer-note"><PawPrint size={30} /><h3>A happy tail starts here.</h3><p>Little essentials, lots of love.</p></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Ties & Tails. Concept storefront.</span><span>Designed with <Heart size={12} fill="currentColor" /> for our furry friends.</span></div></footer>

      <div className="mobile-bottom-nav" aria-label="Quick navigation"><button onClick={() => goTo('home')}><PawPrint size={21} /><span>Home</span></button><button onClick={() => chooseCategory('all')}><Search size={21} /><span>Shop</span></button><button onClick={showFavorites}><Heart size={21} fill={favoritesOnly ? 'currentColor' : 'none'} /><span>Saved</span></button><button onClick={() => setCartOpen(true)} className="bottom-bag"><ShoppingBag size={21} /><span>Bag{cartCount > 0 ? ` (${cartCount})` : ''}</span></button></div>

      {toast && <div role="status" className="toast"><Check size={18} /> {toast} <button type="button" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button></div>}
      {selectedProduct && <ProductDialog key={selectedProduct.id} product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} onToggleFavorite={toggleFavorite} isFavorite={favorites.includes(selectedProduct.id)} />}
      {cartOpen && <CartDrawer items={cart} onClose={() => setCartOpen(false)} onRemove={removeItem} onUpdateQuantity={updateQuantity} onBrowse={() => goTo('shop')} onCopied={() => setToast('Inquiry copied; send it to the shop to confirm details')} />}
    </div>
  )
}

export default App
