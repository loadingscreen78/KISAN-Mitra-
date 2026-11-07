import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BugIcon,
  FlaskIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlantIcon,
  PlusIcon,
  ShoppingCartIcon,
  SquaresFourIcon,
  StarIcon,
  TruckIcon,
  WrenchIcon,
  XIcon,
} from '@phosphor-icons/react';
import { cartManager } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { pageColumn } from '@/lib/layout';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', name: 'All products', icon: SquaresFourIcon },
  { id: 'fertilizers', name: 'Fertilizers', icon: FlaskIcon },
  { id: 'seeds', name: 'Seeds', icon: PlantIcon },
  { id: 'pesticides', name: 'Crop protection', icon: BugIcon },
  { id: 'tools', name: 'Tools', icon: WrenchIcon },
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

const getDiscountPercentage = (original: number, current: number) =>
  Math.round(((original - current) / original) * 100);

const Shop = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const updateCartDisplay = () => {
      const itemCounts: Record<string, number> = {};
      cartManager.getCart().forEach((item) => {
        itemCounts[item.id] = item.quantity;
      });
      setCartItems(itemCounts);
      setCartCount(cartManager.getCartCount());
      setCartTotal(cartManager.getCartTotal());
    };
    updateCartDisplay();
    return cartManager.onCartChange(updateCartDisplay);
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
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

  const toggleWishlist = (productId: string) => {
    setWishlist((previous) => ({ ...previous, [productId]: !previous[productId] }));
  };

  const currentCategory = categories.find((category) => category.id === selectedCategory);

  return (
    <div className={cn('min-h-screen', cartCount > 0 ? 'pb-tabbar-cta' : 'pb-tabbar')}>
      <PageHeader
        title={t('ui.shop_title')}
        subtitle={t('ui.shop_subtitle')}
        actions={
          <button
            type="button"
            onClick={() => navigate('/cart')}
            aria-label={`${t('ui.cart')}, ${t('ui.items_count', { count: cartCount })}`}
            className="glass-icon-button relative"
          >
            <ShoppingCartIcon size={20} aria-hidden="true" />
            {cartCount > 0 && (
              <span className="caption-3 figures absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-leaf-600 px-1 text-white ring-2 ring-[#F4F4F0]">
                {cartCount}
              </span>
            )}
          </button>
        }
      />

      <main className={cn(pageColumn('wide'), 'stagger space-y-6 pt-2')}>
        <div className="space-y-4">
          <label className="relative block">
            <span className="sr-only">{t('ui.search_products')}</span>
            <MagnifyingGlassIcon
              size={20}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-field-500"
            />
            <input
              type="search"
              placeholder={t('ui.search_products')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="glass-input h-12 w-full pl-12 pr-12 text-field-900 placeholder:text-field-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={t('ui.clear_search')}
                className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-field-500 hover:text-field-900"
              >
                <XIcon size={16} weight="bold" aria-hidden="true" />
              </button>
            )}
          </label>

          <div
            role="tablist"
            aria-label="Categories"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 [scrollbar-width:none]"
          >
            {categories.map((category) => {
              const selected = selectedCategory === category.id;
              const CategoryIcon = category.icon;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'button-sm flex h-10 shrink-0 items-center gap-2 rounded-full px-4 transition-[background-color,color,transform] duration-300 active:scale-95',
                    selected ? 'glass-tinted' : 'glass-pill text-field-700 hover:text-field-900',
                  )}
                >
                  <CategoryIcon size={16} weight={selected ? 'fill' : 'regular'} aria-hidden="true" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <section aria-labelledby="products-heading" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="products-heading" className="title-3 text-field-800">
              {currentCategory?.name}
            </h2>
            <span className="caption-5 figures text-field-500">{t('ui.items_count', { count: filteredProducts.length })}</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="glass-panel flex flex-col items-center rounded-3xl px-6 py-12 text-center">
              <span className="icon-tile h-14 w-14 rounded-2xl text-field-600">
                <MagnifyingGlassIcon size={28} weight="duotone" aria-hidden="true" />
              </span>
              <h3 className="title-3 mt-4 text-field-900">{t('ui.no_products')}</h3>
              <p className="body-6 mt-1 max-w-xs text-field-500">{t('ui.no_products_body')}</p>
              <Button variant="glass" className="mt-6" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                {t('ui.clear_search')}
              </Button>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const quantity = cartItems[product.id] ?? 0;
                const saved = Boolean(wishlist[product.id]);
                return (
                  <li key={product.id} className="glass-panel flex flex-col rounded-3xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="caption-4 flex flex-wrap items-center gap-2 text-field-500">
                          {product.brand}
                          {product.organic && (
                            <span className="caption-3 rounded-full bg-leaf-600/10 px-2 py-0.5 text-leaf-800">{t('ui.organic')}</span>
                          )}
                        </p>
                        <h3 className="title-3 mt-1 text-field-900">{product.name}</h3>
                        <p className="caption-5 text-field-500">{product.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-pressed={saved}
                        aria-label={t('ui.save_item')}
                        className="-mr-1 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-field-500 transition-transform duration-500 ease-spring hover:text-field-900 active:scale-90"
                      >
                        <HeartIcon size={20} weight={saved ? 'fill' : 'regular'} className={cn(saved && 'text-red-600')} aria-hidden="true" />
                      </button>
                    </div>

                    <p className="caption-5 mt-2 flex items-center gap-1 text-field-500">
                      <StarIcon size={14} weight="fill" className="text-amber-500" aria-hidden="true" />
                      <span className="caption-3 figures text-field-800">{product.rating}</span>
                      <span className="figures">({product.reviews.toLocaleString('en-IN')})</span>
                    </p>

                    <p className="mt-3 flex flex-wrap items-baseline gap-2">
                      <span className="heading-6 figures text-field-900">₹{product.price}</span>
                      <span className="caption-5 figures text-field-500 line-through">₹{product.originalPrice}</span>
                      <span className="caption-3 figures text-leaf-700">
                        {t('ui.off', { percent: getDiscountPercentage(product.originalPrice, product.price) })}
                      </span>
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-field-900/10 pt-4">
                      <span className="caption-5 flex items-center gap-1 text-field-500">
                        <TruckIcon size={16} aria-hidden="true" />
                        {t('ui.free_delivery')}
                      </span>

                      {quantity > 0 ? (
                        <div className="glass-pill flex items-center gap-1 p-1">
                          <button
                            type="button"
                            onClick={() => cartManager.removeFromCart(product.id)}
                            aria-label={t('ui.decrease')}
                            className="grid h-9 w-9 place-items-center rounded-full bg-white text-field-800 shadow-[0_1px_2px_rgb(27_31_25/0.15)] transition-transform duration-500 ease-spring active:scale-90"
                          >
                            <MinusIcon size={14} weight="bold" aria-hidden="true" />
                          </button>
                          <span className="body-4 figures min-w-8 text-center text-field-900" aria-live="polite">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(product.id)}
                            aria-label={t('ui.increase')}
                            className="grid h-9 w-9 place-items-center rounded-full bg-leaf-600 text-white transition-transform duration-500 ease-spring active:scale-90"
                          >
                            <PlusIcon size={14} weight="bold" aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <Button size="sm" className="h-11 rounded-full px-4" onClick={() => addToCart(product.id)}>
                          <PlusIcon weight="bold" aria-hidden="true" />
                          {t('ui.add_to_cart')}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {cartCount > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-tabbar z-40 animate-slide-up px-4">
          <div className="pointer-events-auto mx-auto max-w-md">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="glass-tinted flex h-14 w-full items-center justify-between rounded-full px-6 transition-transform duration-500 ease-spring active:scale-[0.98] active:duration-200"
            >
              <span className="button-md flex items-center gap-2">
                <ShoppingCartIcon size={20} weight="fill" aria-hidden="true" />
                {t('ui.view_cart')}
                <span className="caption-4 figures text-white/75">{t('ui.items_count', { count: cartCount })}</span>
              </span>
              <span className="button-md figures">₹{cartTotal}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
