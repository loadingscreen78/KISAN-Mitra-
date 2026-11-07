import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  ShoppingCart, 
  Star, 
  Heart,
  Plus,
  Minus,
  Package,
  Truck,
  Shield,
  Zap,
  Sparkles,
  Sprout
} from 'lucide-react';
import { cartManager } from '@/lib/cart';
import AmbientBackground from '@/components/AmbientBackground';
import GlassBottomNav from '@/components/GlassBottomNav';

const Shop = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    updateCartDisplay();
    const unsubscribe = cartManager.onCartChange(() => {
      updateCartDisplay();
    });
    return unsubscribe;
  }, []);

  const updateCartDisplay = () => {
    const cart = cartManager.getCart();
    const itemCounts: Record<string, number> = {};
    cart.forEach(item => {
      itemCounts[item.id] = item.quantity;
    });
    setCartItems(itemCounts);
    setCartCount(cartManager.getCartCount());
    setCartTotal(cartManager.getCartTotal());
  };

  const categories = [
    { id: 'all', name: 'All Products', icon: Package },
    { id: 'fertilizers', name: 'Fertilizers', icon: Zap },
    { id: 'seeds', name: 'Seeds', icon: Sprout },
    { id: 'pesticides', name: 'Pesticides', icon: Shield },
    { id: 'tools', name: 'Tools', icon: Package }
  ];

  const products = [
    {
      id: '1',
      name: 'Organic NPK Fertilizer',
      brand: 'FarmGrow',
      price: 245,
      originalPrice: 299,
      rating: 4.5,
      reviews: 1243,
      category: 'fertilizers',
      inStock: true,
      bestseller: true,
      organic: true,
      size: '1kg',
      features: ['Organic', 'Fast Acting', 'All Crops']
    },
    {
      id: '2',
      name: 'Tomato Hybrid Seeds',
      brand: 'SeedMaster',
      price: 120,
      originalPrice: 150,
      rating: 4.8,
      reviews: 856,
      category: 'seeds',
      inStock: true,
      bestseller: false,
      organic: false,
      size: '50g',
      features: ['Hybrid', 'Disease Resistant', 'High Yield']
    },
    {
      id: '3',
      name: 'Copper Fungicide Spray',
      brand: 'CropCare',
      price: 180,
      originalPrice: 210,
      rating: 4.3,
      reviews: 634,
      category: 'pesticides',
      inStock: true,
      bestseller: false,
      organic: false,
      size: '500ml',
      features: ['Broad Spectrum', 'Rain Resistant', 'Safe for Fruits']
    },
    {
      id: '4',
      name: 'Soil pH Testing Kit',
      brand: 'AgriTech',
      price: 350,
      originalPrice: 420,
      rating: 4.6,
      reviews: 412,
      category: 'tools',
      inStock: true,
      bestseller: true,
      organic: false,
      size: '1 kit (50 tests)',
      features: ['Digital Display', 'Instant Results', 'Multi-Nutrient']
    },
    {
      id: '5',
      name: 'Bio-Neem Pest Spray',
      brand: 'EcoAgri',
      price: 160,
      originalPrice: 195,
      rating: 4.7,
      reviews: 980,
      category: 'pesticides',
      inStock: true,
      bestseller: true,
      organic: true,
      size: '250ml',
      features: ['100% Organic', 'Eco-Friendly', 'Safe for Bees']
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      cartManager.addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        size: product.size,
        brand: product.brand
      });
    }
  };

  const removeFromCart = (productId: string) => {
    cartManager.removeFromCart(productId);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-background to-emerald-50/20 pb-36">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Floating Expo-Glass Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 border-b border-white/60 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/home')}
              aria-label="Back"
              className="p-2.5 glass-panel rounded-full hover:bg-white/90 text-slate-700 transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-800" />
            </button>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Agri Supplies & Seeds
            </h1>
          </div>
          
          <button 
            onClick={() => navigate('/cart')}
            aria-label="Shopping Cart"
            className="relative p-2.5 glass-panel rounded-full hover:bg-white/90 text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Content Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Search Bar in Glass */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search fertilizers, seeds, pesticides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 text-sm glass-input shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Filter className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap text-xs font-bold transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md border border-emerald-400/40'
                    : 'glass-panel text-slate-600 hover:text-emerald-700 hover:bg-white/80'
                }`}
              >
                <category.icon className="w-3.5 h-3.5" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Products List in Glass Cards */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <span className="text-[11px] font-semibold text-emerald-800 glass-pill px-2.5 py-0.5">
              {filteredProducts.length} items
            </span>
          </div>

          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="glass-card-interactive p-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 glass-pill px-2 py-0.5">
                        {product.brand}
                      </span>
                      {product.organic && (
                        <span className="text-[10px] font-bold text-green-700 bg-green-500/10 px-2 py-0.5 rounded-full">
                          🌿 Organic
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{product.size}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                        <span>{product.rating}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">({product.reviews})</span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2.5">
                      <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 px-1.5 py-0.5 rounded-md">
                        {getDiscountPercentage(product.originalPrice, product.price)}% OFF
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2 glass-panel rounded-full hover:bg-white text-slate-400 transition-colors"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        wishlist[product.id] 
                          ? 'fill-red-500 text-red-500' 
                          : 'hover:text-red-500'
                      }`} 
                    />
                  </button>
                </div>

                {/* Add to Cart Actions */}
                <div className="mt-3.5 pt-3 border-t border-white/60 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" /> Free rural delivery
                  </div>

                  <div>
                    {cartItems[product.id] > 0 ? (
                      <div className="flex items-center space-x-2 glass-panel p-1 rounded-full">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs text-slate-900 min-w-[20px] text-center">
                          {cartItems[product.id]}
                        </span>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-emerald-500 active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-md active:scale-95 transition-all"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Cart Checkout Pill */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button 
              onClick={() => navigate('/cart')}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 px-5 rounded-2xl shadow-[0_12px_30px_-3px_rgba(16,185,129,0.6)] border border-emerald-400/40 flex items-center justify-between text-sm font-extrabold active:scale-95 transition-transform"
            >
              <span className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>View Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
              </span>
              <span>₹{cartTotal}</span>
            </button>
          </div>
        </div>
      )}

      {/* Unified Bottom Navigation */}
      <GlassBottomNav activeTab="shop" />
    </div>
  );
};

export default Shop;
