import { supabase } from '../lib/supabaseClient';

const seedCategories = [
  { id: 2, name: 'Cafée', icon: '☕' },
  { id: 3, name: 'Thé', icon: '/images/tea.png' },
  { id: 4, name: 'Boissons', icon: '🥤' },
  { id: 6, name: 'Eau Minérale', icon: '💧' },
  { id: 1, name: 'Pâtisseries', icon: '🥐' },
  { id: 0, name: 'Salée', icon: '🧂' },
  { id: 7, name: 'Chicha', icon: '/images/narguille.png' },
  { id: 8, name: 'Jeux', icon: '🃏' },
  { id: 5, name: 'Jus', icon: '🧃' }
];

const seedProducts = [
  { id: 1, name: 'Expresso', price: '1.8 DT', description: '', category_id: 2 },
  { id: 2, name: 'Capussin', price: '1.9 DT', description: '', category_id: 2 },
  { id: 3, name: 'Allongée', price: '1.8 DT', description: '', category_id: 2 },
  { id: 4, name: 'Direct', price: '2.0 DT', description: '', category_id: 2 },
  { id: 5, name: 'Armatora', price: '2.2 DT', description: '', category_id: 2 },
  { id: 6, name: 'Filtre', price: '1.2 DT', description: '', category_id: 2 },
  { id: 7, name: 'Lait Au Chocolat', price: 'Grand 2.0 DT / Petit 1.2 DT', description: '', category_id: 2 },
  { id: 8, name: 'Chocolat Chaud', price: 'Grand 4.0 DT / Petit 3.0 DT', description: '', category_id: 2 },
  { id: 9, name: 'Supplément SIROP', price: '0.2 DT', description: 'Vanille, Caramel et Noisette', category_id: 2 },
  { id: 10, name: 'Thé Vert', price: '1.2 DT', description: '', category_id: 3 },
  { id: 11, name: 'Thé à la Menthe', price: '1.5 DT', description: '', category_id: 3 },
  { id: 12, name: 'Thé aux Amandes', price: '2.5 DT', description: '', category_id: 3 },
  { id: 13, name: 'Jus Frais', price: '2.5 DT', description: 'Orange, Carotte, Citron et Fraise', category_id: 5 },
  { id: 14, name: '0,5 Litre', price: '1.0 DT', description: '', category_id: 6 },
  { id: 15, name: '1 Litre', price: '1.4 DT', description: '', category_id: 6 },
  { id: 16, name: '1,5 Litre', price: '1.6 DT', description: '', category_id: 6 },
  { id: 17, name: 'Tiramisu', price: '4.0 DT', description: 'Chocolat, Caramel', category_id: 1 },
  { id: 18, name: 'Croissant', price: '2.0 DT', description: '', category_id: 1 },
  { id: 19, name: 'Pain au Chocolat', price: '1.8 DT', description: '', category_id: 1 },
  { id: 20, name: 'MilleFeuilles', price: '2.0 DT', description: '', category_id: 1 },
  { id: 21, name: 'Pate Amondes', price: '1.5 DT', description: '', category_id: 1 },
  { id: 22, name: 'Delice', price: '2.0 DT', description: '', category_id: 1 },
  { id: 23, name: 'Gateaux', price: '2.0 DT', description: 'Chocolat, Caramel', category_id: 1 },
  { id: 24, name: 'Hrisa', price: '1.5 DT', description: '', category_id: 1 },
  { id: 25, name: 'Mini Pizza', price: '3.0 DT', description: '', category_id: 0 },
  { id: 26, name: 'Soufflet d\'Escalope', price: '3.5 DT', description: '', category_id: 0 },
  { id: 27, name: 'Fricasé', price: '1.5 DT', description: '', category_id: 0 },
  { id: 28, name: 'Parfum Classique', price: '4.0 DT', description: 'Menthe, Raisin et Pomme', category_id: 7 },
  { id: 29, name: 'Parfum Speciale', price: '5.0 DT', description: 'Love, Mi Amor, Hawaï, Melon, etc...', category_id: 7 },
  { id: 30, name: 'Rami', price: 'Nouveau 4.0 DT / Ancien 2.0 DT', description: '', category_id: 8 },
  { id: 31, name: 'Domino / Chkobba', price: 'Gratuit', description: '', category_id: 8 },
  { id: 32, name: 'Cake', price: '1.5 DT', description: '', category_id: 1 },
  { id: 33, name: 'OH', price: '2.0 DT', description: 'Poire, Berries, Orange Banane et Mangue', category_id: 5 },
  { id: 34, name: 'Tropico', price: '1.5 DT', description: '', category_id: 5 },
  { id: 35, name: 'Jus "Verre"', price: '2.5 DT', description: '', category_id: 5 },
  { id: 36, name: 'Delio', price: '1.5 DT', description: 'Menthe, Fraise, Peche, Poire, Pomme et Ananas', category_id: 4 },
  { id: 37, name: 'Celestia', price: '2.5 DT', description: 'Nature, Citron, Peche, Mokhitou, Fraise&Grenadine', category_id: 4 }
];

const getLocalProducts = () => {
  const local = localStorage.getItem('cc_products_fallback');
  if (local) {
    return JSON.parse(local);
  }
  localStorage.setItem('cc_products_fallback', JSON.stringify(seedProducts));
  return seedProducts;
};

const saveLocalProducts = (products) => {
  localStorage.setItem('cc_products_fallback', JSON.stringify(products));
};

// Get all categories with their products
export const getMenu = async () => {
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('id');

    if (categoriesError) throw categoriesError;

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('id');

    if (productsError) throw productsError;

    // Group products by category
    const menu = categories.map(category => ({
      ...category,
      items: products.filter(product => String(product.category_id) === String(category.id))
    }));

    return menu;
  } catch (error) {
    console.warn('Supabase fetch failed, silently falling back to local menu seed data:', error);
    const products = getLocalProducts();
    return seedCategories.map(category => ({
      ...category,
      items: products.filter(product => String(product.category_id) === String(category.id))
    }));
  }
};

// Get all products (for admin)
export const getProducts = async () => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('id');

    if (productsError) throw productsError;

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) throw categoriesError;

    return products.map(product => ({
      ...product,
      categoryName: categories.find(c => String(c.id) === String(product.category_id))?.name || 'Unknown'
    }));
  } catch (error) {
    console.warn('Supabase products fetch failed, falling back to local products:', error);
    const products = getLocalProducts();
    return products.map(product => ({
      ...product,
      categoryName: seedCategories.find(c => String(c.id) === String(product.category_id))?.name || 'Unknown'
    }));
  }
};

// Get all categories (for admin)
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id');

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Supabase categories fetch failed, falling back to local categories:', error);
    return seedCategories;
  }
};

// Add new product
export const addProduct = async (productData) => {
  try {
    const parsedCategoryId = isNaN(Number(productData.categoryId))
      ? productData.categoryId
      : Number(productData.categoryId);

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        price: productData.price,
        description: productData.description || '',
        category_id: parsedCategoryId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Supabase add failed, silently performing action locally:', error);
    const products = getLocalProducts();
    const parsedCategoryId = isNaN(Number(productData.categoryId))
      ? productData.categoryId
      : Number(productData.categoryId);

    const newProduct = {
      id: Date.now(),
      name: productData.name,
      price: productData.price,
      description: productData.description || '',
      category_id: parsedCategoryId
    };
    products.push(newProduct);
    saveLocalProducts(products);
    return newProduct;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const parsedCategoryId = isNaN(Number(productData.categoryId))
      ? productData.categoryId
      : Number(productData.categoryId);

    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        price: productData.price,
        description: productData.description || '',
        category_id: parsedCategoryId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Supabase update failed, silently performing action locally:', error);
    const products = getLocalProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const parsedCategoryId = isNaN(Number(productData.categoryId))
      ? productData.categoryId
      : Number(productData.categoryId);

    products[index] = {
      ...products[index],
      name: productData.name,
      price: productData.price,
      description: productData.description || '',
      category_id: parsedCategoryId
    };
    saveLocalProducts(products);
    return products[index];
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Supabase delete failed, silently performing action locally:', error);
    const products = getLocalProducts();
    const filtered = products.filter(p => p.id !== id);
    saveLocalProducts(filtered);
    return true;
  }
};
