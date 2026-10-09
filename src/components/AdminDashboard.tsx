import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts, getCategories, addProduct, updateProduct, deleteProduct } from '../api/products';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminDashboard.css';

interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  category_id: string | number;
  categoryName?: string;
}

interface Category {
  id: string | number;
  name: string;
  icon: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
    isPromo: false,
    promoPrice: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ADMIN_USER = "e7d9f30c08ff75b134bd6f6d54a22d25e6ceb5ddaa2f1a42721f279665d4c34a";
  const ADMIN_HASH = "6a13f0c7a3ba956bab2bcd38138002f12cd0e5b94a19e3467c1e41b884425765";

  async function sha256(text: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const checkAdmin = useCallback(async () => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (!username || !password) {
      navigate("/login");
      return;
    }

    const hashed1 = await sha256(username);
    const hashed2 = await sha256(password);

    if (hashed1 !== ADMIN_USER || hashed2 !== ADMIN_HASH) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchData = useCallback(async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.price || !formData.categoryId) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Clean up description and append [PROMO] / [PROMO_PRICE] tags
    let cleanDesc = formData.description
      .replace(/\[PROMO\]/gi, '')
      .replace(/\[PROMO_PRICE:.*?\]/gi, '')
      .trim();

    if (formData.isPromo) {
      cleanDesc += ' [PROMO]';
      if (formData.promoPrice.trim()) {
        cleanDesc += ` [PROMO_PRICE:${formData.promoPrice.trim()}]`;
      }
    }

    const payload = {
      name: formData.name,
      price: formData.price,
      description: cleanDesc,
      categoryId: formData.categoryId
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setSuccess('Produit mis à jour avec succès !');
      } else {
        await addProduct(payload);
        setSuccess('Produit ajouté avec succès !');
      }
      
      setFormData({ name: '', price: '', description: '', categoryId: '', isPromo: false, promoPrice: '' });
      setEditingId(null);
      fetchData();
    } catch (error) {
      setError('Échec de la sauvegarde du produit');
    }
  };

  const handleEdit = (product: Product) => {
    const hasPromo = product.description ? product.description.toLowerCase().includes('[promo]') : false;
    
    const priceMatch = product.description ? product.description.match(/\[PROMO_PRICE:(.*?)\]/i) : null;
    const promoPrice = priceMatch ? priceMatch[1] : '';

    const cleanDesc = product.description 
      ? product.description.replace(/\[PROMO\]/gi, '').replace(/\[PROMO_PRICE:.*?\]/gi, '').trim() 
      : '';

    setFormData({
      name: product.name,
      price: product.price,
      description: cleanDesc,
      categoryId: String(product.category_id),
      isPromo: hasPromo,
      promoPrice: promoPrice
    });
    setEditingId(product.id);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      return;
    }

    try {
      await deleteProduct(id);
      setSuccess('Produit supprimé avec succès !');
      fetchData();
    } catch (error) {
      setError('Erreur lors de la suppression du produit');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', price: '', description: '', categoryId: '', isPromo: false, promoPrice: '' });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderIcon = (icon: string) => {
    const isImage = /\.(png|jpg|jpeg|svg|webp)$/i.test(icon);
    if (isImage) {
      return <img src={icon} alt="icon" className="category-icon-img" />;
    }
    return <span className="category-icon-emoji">{icon}</span>;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard">
        {/* Header Section */}
        <div className="admin-header-card">
          <div className="header-left">
            <h1>Tableau de bord</h1>
            <p>Gérez le menu de Café Carthage</p>
          </div>
          <div className="header-right">
            <Link to="/" className="btn btn-secondary">
              👁️ Voir le Menu
            </Link>
            <button type="button" onClick={handleLogout} className="btn btn-logout">
              Déconnecter
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              className="alert error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              className="alert success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="admin-content">
          {/* Form Card */}
          <div className="form-card">
            <h2>{editingId ? '✏️ Modifier le Produit' : '➕ Ajouter un Produit'}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">Nom du Produit *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex. Cappuccino"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Prix *</label>
                <input
                  type="text"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="ex. 2.5 DT ou Gratuit"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Catégorie *</label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optionnelle)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="ex. Caramel, Noisette..."
                />
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="isPromo" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="isPromo"
                    checked={formData.isPromo}
                    onChange={(e) => setFormData({ ...formData, isPromo: e.target.checked })}
                    className="promo-checkbox"
                  />
                  Mettre en Promotion (Offre du Jour)
                </label>
              </div>

              {formData.isPromo && (
                <div className="form-group">
                  <label htmlFor="promoPrice">Prix après promotion (ex: 1.5 DT)</label>
                  <input
                    type="text"
                    id="promoPrice"
                    value={formData.promoPrice}
                    onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                    placeholder="ex. 1.5 DT"
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancel} className="btn btn-cancel">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Card */}
          <div className="products-list-card">
            <div className="list-header">
              <h2>Produits Existants</h2>
              <span className="count-badge">{products.length} produits</span>
            </div>

            {products.length === 0 ? (
              <div className="empty-list">
                <p>Aucun produit dans le menu. Ajoutez-en un !</p>
              </div>
            ) : (
              <div className="products-grid-layout">
                {products.map((product) => (
                  <div key={product.id} className="dashboard-product-card">
                    <div className="product-info-panel">
                      <div className="product-title-row">
                        <h3>
                          {product.name}
                          {product.description && product.description.toLowerCase().includes('[promo]') && (
                            <span className="promo-badge-mini">
                              🔥 Promo {product.description.match(/\[PROMO_PRICE:(.*?)\]/i) ? `(${product.description.match(/\[PROMO_PRICE:(.*?)\]/i)![1]})` : ''}
                            </span>
                          )}
                        </h3>
                        <span className="price-tag">{product.price}</span>
                      </div>
                      <span className="category-tag">
                        {product.categoryName}
                      </span>
                      {product.description && (
                        <p className="product-desc-text">
                          {product.description.replace(/\[PROMO\]/gi, '').replace(/\[PROMO_PRICE:.*?\]/gi, '').trim()}
                        </p>
                      )}
                    </div>
                    <div className="product-actions-panel">
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn-action btn-edit-action"
                        title="Modifier"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="btn-action btn-delete-action"
                        title="Supprimer"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
