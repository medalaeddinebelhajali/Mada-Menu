import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMenu } from '../api/products';
import { motion, AnimatePresence } from 'framer-motion';
import './MenuPage.css';

interface MenuItem {
  id: number;
  name: string;
  price: string;
  description: string;
  category_id: string | number;
}

interface Category {
  id: string | number;
  name: string;
  icon: string;
  items: MenuItem[];
}

interface CartItem {
  id: number;
  name: string;
  price: string;
  count: number;
}

const MenuPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | number>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getPromoPrice = (item: MenuItem): string | null => {
    if (!item.description) return null;
    const match = item.description.match(/\[PROMO_PRICE:(.*?)\]/i);
    return match ? match[1] : null;
  };

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getMenu();
      setCategories(data);
      setActiveCategory('all');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selectCategory = (categoryId: string | number) => {
    setActiveCategory(categoryId);

    const element = document.querySelector('.menu-container');
    if (element) {
      const yOffset = -140; // Offset for sticky navbar + search
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      if (window.scrollY > y) {
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const renderIcon = (icon: string) => {
    const isImage = /\.(png|jpg|jpeg|svg|webp)$/i.test(icon);
    if (isImage) {
      return <img src={icon} alt="icon" className="category-icon-img" />;
    }
    return <span className="category-icon-emoji">{icon}</span>;
  };

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) => (i.id === item.id ? { ...i, count: i.count + 1 } : i));
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, count: 1 }];
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === itemId);
      if (existing && existing.count > 1) {
        return prevCart.map((i) => (i.id === itemId ? { ...i, count: i.count - 1 } : i));
      }
      return prevCart.filter((i) => i.id !== itemId);
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearCart = () => setCart([]);

  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + parsePrice(item.price) * item.count, 0).toFixed(1);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.count, 0);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendWhatsAppOrder = () => {
    let orderText = "Bonjour, je souhaite commander :\n\n";
    cart.forEach(item => {
      orderText += `• ${item.count}x ${item.name} (${item.price})\n`;
    });
    orderText += `\n*Total Estimé : ${getCartTotal()} DT*`;
    
    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Chargement du menu...</div>
      </div>
    );
  }

  // Find all products with [PROMO] in their description or name
  const promoProducts = categories
    .flatMap((c) => c.items || [])
    .filter(
      (item) =>
        (item.description && item.description.toLowerCase().includes('[promo]')) ||
        item.name.toLowerCase().includes('[promo]')
    );

  // Filter products by active category & search query
  const displayedCategories = (activeCategory === 'all'
    ? categories
    : categories.filter((c) => c.id === activeCategory)
  )
    .map((category) => {
      const items = (category.items || []).filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...category, filteredItems: items };
    })
    .filter((c) => c.filteredItems.length > 0);

  return (
    <div className="single-menu-page">
      {/* Hero Cover Section */}
      <div className="hero-cover">
        <div className="hero-overlay">
          <Link to="/apropos" className="about-link">À Propos de Nous</Link>
          <img src="/images/logo.png" alt="Carthage Logo" className="logo-img" />
          <div className="hero-divider"></div>
          <p className="hero-subtitle">Djerba</p>
          <p className="hero-tagline">Une expérience authentique au cœur de Djerba</p>
        </div>
      </div>

      {/* Sticky Controls Panel */}
      <div className="sticky-controls">
        {/* Category Navbar */}
        <div className="sticky-navbar">
          <div className="nav-container">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <button
                className={`nav-category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => selectCategory('all')}
              >
                <span className="category-icon-emoji">🍽️</span>
                <span>Tous</span>
              </button>
            </motion.div>

            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  className={`nav-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => selectCategory(cat.id)}
                >
                  {renderIcon(cat.icon)}
                  <span>{cat.name}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search Panel */}
        <div className="search-panel">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un produit (ex. café, chkobba, pizza...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="menu-container">
        {/* Promotional Products Section */}
        {promoProducts.length > 0 && (
          <div className="promo-section">
            <div className="section-header">
              <span className="category-icon-emoji">🔥</span>
              <h3 className="section-title">Offres du Jour</h3>
            </div>
            <div className={`promo-cards-slider ${promoProducts.length === 1 ? 'single-promo' : ''}`}>
              {promoProducts.map((promoItem, index) => (
                <motion.div 
                  key={promoItem.id}
                  className="promo-banner-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => addToCart({
                    ...promoItem,
                    price: getPromoPrice(promoItem) || promoItem.price
                  })}
                >
                  <div className="promo-badge">🔥 Offre du Jour</div>
                  <div className="promo-content">
                    <div className="promo-text-details">
                      <h3 className="promo-product-name">{promoItem.name.replace(/\[PROMO\]/gi, '').trim()}</h3>
                      <p className="promo-product-desc">
                        {promoItem.description 
                          ? promoItem.description.replace(/\[PROMO\]/gi, '').replace(/\[PROMO_PRICE:.*?\]/gi, '').trim() 
                          : "Découvrez notre offre du jour !"}
                      </p>
                    </div>
                    <div className="promo-price-action">
                      {getPromoPrice(promoItem) ? (
                        <div className="promo-price-container">
                          <span className="promo-original-price">{promoItem.price}</span>
                          <span className="promo-price">{getPromoPrice(promoItem)}</span>
                        </div>
                      ) : (
                        <span className="promo-price">{promoItem.price}</span>
                      )}
                      <span className="promo-add-btn">+ Ajouter</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {displayedCategories.length > 0 ? (
          displayedCategories.map((category) => (
            <div key={category.id} id={`category-${category.id}`} className="menu-section">
              <div className="section-header">
                {renderIcon(category.icon)}
                <h3 className="section-title">{category.name}</h3>
              </div>

              <motion.div
                className="items-grid"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
              >
                {category.filteredItems.map((item) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const cartItem = cart.find((i) => i.id === item.id);
                  return (
                    <motion.div
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                      }}
                      className="menu-item-card-wrapper"
                    >
                      <div className="menu-item-card" onClick={() => addToCart({
                        ...item,
                        price: getPromoPrice(item) || item.price
                      })}>
                        <div className="item-main-content">
                          <div className="item-header">
                            <span className="item-name">{item.name.replace(/\[PROMO\]/gi, '').trim()}</span>
                            {getPromoPrice(item) ? (
                              <div className="item-price-container">
                                <span className="item-price-original">{item.price}</span>
                                <span className="item-price promo-highlight">{getPromoPrice(item)}</span>
                              </div>
                            ) : (
                              <span className="item-price">{item.price}</span>
                            )}
                          </div>
                          {item.description && <p className="item-description">{item.description.replace(/\[PROMO\]/gi, '').replace(/\[PROMO_PRICE:.*?\]/gi, '').trim()}</p>}
                        </div>
                        
                        {/* Interactive Counter / Add badge */}
                        {/*
                        <div className="card-action-overlay">
                          {cartItem ? (
                            <div className="quantity-adjuster" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => removeFromCart(item.id)} className="counter-btn">-</button>
                              <span className="counter-val">{cartItem.count}</span>
                              <button onClick={() => addToCart(item)} className="counter-btn">+</button>
                            </div>
                          ) : (
                            <span className="add-badge">+ Ajouter</span>
                          )}
                        </div>*/}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <span className="no-results-icon">🤷‍♂️</span>
            <h3>Aucun produit trouvé</h3>
            <p>Essayez une autre recherche ou changez de catégorie.</p>
          </div>
        )}

        {/* Thank You Footer */}
        <div className="thank-you-footer">
          <h2 className="thank-you-title">Merci!</h2>
          <p className="thank-you-arabic">شكرا</p>
          <div className="thank-you-divider"></div>
          <p className="thank-you-text">Café Carthage</p>
        </div>
      </div>

      {/* Floating Selection Tray */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`selection-tray-container ${isCartOpen ? 'expanded' : ''}`}
          >

            {/* Tray Header */}
            <div className="tray-header" onClick={() => setIsCartOpen(!isCartOpen)}>
              <div className="tray-summary">
                <span className="tray-badge">{getCartCount()}</span>
                <span className="tray-label">Articles sélectionnés</span>
              </div>
              <div className="tray-pricing">
                <span className="tray-total-label">Total :</span>
                <span className="tray-total">{getCartTotal()} DT</span>
                <span className="tray-arrow">{isCartOpen ? '▼' : '▲'}</span>
              </div>
            </div>

            {/* Tray Items List (Visible when expanded) */}
            {/*isCartOpen && (
              <div className="tray-body">
                <div className="tray-items-list">
                  {cart.map((item) => (
                    <div key={item.id} className="tray-item">
                      <div className="tray-item-info">
                        <span className="tray-item-name">{item.name}</span>
                        <span className="tray-item-price">{item.price}</span>
                      </div>
                      <div className="tray-item-actions">
                        <button onClick={() => removeFromCart(item.id)} className="tray-counter-btn">-</button>
                        <span className="tray-counter-val">{item.count}</span>
                        <button onClick={() => addToCart(item)} className="tray-counter-btn">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tray-footer">
                  <button onClick={clearCart} className="clear-tray-btn">Vider</button>
                  <button onClick={sendWhatsAppOrder} className="submit-order-btn">
                    💬 Commander via WhatsApp
                  </button>
                </div>
              </div>
            )*/}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;
