import { create } from 'zustand';
import { Product, Category, CartItem, Cart, Sale, SaleItem } from '../types';
import { 
  saveCategories, 
  saveProducts, 
  savePassword, 
  loadCategories, 
  loadProducts, 
  loadPassword 
} from '../services/localStorage';
import { getDatabaseIPC } from '../services/database-ipc';

// Kategoriler - 5 ana kategori
const categories: Category[] = [
  { id: 'hot-drinks', name: 'Sıcak İçecekler', icon: '☕' },
  { id: 'cold-drinks', name: 'Soğuk İçecekler', icon: '🥤' },
  { id: 'desserts', name: 'Tatlılar', icon: '🍰' },
  { id: 'snacks', name: 'Atıştırmalıklar', icon: '🥨' },
  { id: 'breakfast', name: 'Kahvaltı', icon: '🍳' }
];

// Ürünler - Her kategoride 20 ürün (5 kategori x 20 ürün = 100 ürün)
const products: Product[] = [
  // Sıcak İçecekler (20 ürün)
  { id: 'p1', name: 'Türk Kahvesi', price: 25, category: 'hot-drinks' },
  { id: 'p2', name: 'Espresso', price: 20, category: 'hot-drinks', image: require('../assets/espresso.png') },
  { id: 'p3', name: 'Double Espresso', price: 32, category: 'hot-drinks' },
  { id: 'p4', name: 'Cappuccino', price: 30, category: 'hot-drinks' },
  { id: 'p5', name: 'Latte', price: 35, category: 'hot-drinks' },
  { id: 'p6', name: 'Americano', price: 25, category: 'hot-drinks' },
  { id: 'p7', name: 'Sıcak Çikolata', price: 28, category: 'hot-drinks' },
  { id: 'p8', name: 'Mocha', price: 38, category: 'hot-drinks' },
  { id: 'p9', name: 'Macchiato', price: 33, category: 'hot-drinks' },
  { id: 'p10', name: 'Flat White', price: 36, category: 'hot-drinks' },
  { id: 'p11', name: 'Cortado', price: 34, category: 'hot-drinks' },
  { id: 'p12', name: 'Affogato', price: 42, category: 'hot-drinks' },
  { id: 'p13', name: 'Vienna Coffee', price: 37, category: 'hot-drinks' },
  { id: 'p14', name: 'Chai Latte', price: 32, category: 'hot-drinks' },
  { id: 'p15', name: 'Sahlep', price: 30, category: 'hot-drinks' },
  { id: 'p16', name: 'Sıcak Süt', price: 18, category: 'hot-drinks' },
  { id: 'p17', name: 'Bitki Çayı', price: 22, category: 'hot-drinks' },
  { id: 'p18', name: 'Yeşil Çay', price: 20, category: 'hot-drinks' },
  { id: 'p19', name: 'Earl Grey', price: 24, category: 'hot-drinks' },
  { id: 'p20', name: 'Çay (Bardak)', price: 12, category: 'hot-drinks' },
  
  // Soğuk İçecekler (20 ürün)
  { id: 'p21', name: 'Ice Americano', price: 28, category: 'cold-drinks' },
  { id: 'p22', name: 'Ice Latte', price: 38, category: 'cold-drinks' },
  { id: 'p23', name: 'Frappuccino', price: 40, category: 'cold-drinks' },
  { id: 'p24', name: 'Soğuk Kahve', price: 30, category: 'cold-drinks' },
  { id: 'p25', name: 'Cold Brew', price: 35, category: 'cold-drinks' },
  { id: 'p26', name: 'Limonata', price: 22, category: 'cold-drinks' },
  { id: 'p27', name: 'Ice Tea', price: 25, category: 'cold-drinks' },
  { id: 'p28', name: 'Çilek Milkshake', price: 35, category: 'cold-drinks' },
  { id: 'p29', name: 'Vanilya Milkshake', price: 35, category: 'cold-drinks' },
  { id: 'p30', name: 'Çikolata Milkshake', price: 38, category: 'cold-drinks' },
  { id: 'p31', name: 'Smoothie', price: 42, category: 'cold-drinks' },
  { id: 'p32', name: 'Portakal Suyu', price: 20, category: 'cold-drinks' },
  { id: 'p33', name: 'Elma Suyu', price: 18, category: 'cold-drinks' },
  { id: 'p34', name: 'Şeftali Ice Tea', price: 28, category: 'cold-drinks' },
  { id: 'p35', name: 'Mojito (Alkolsüz)', price: 32, category: 'cold-drinks' },
  { id: 'p36', name: 'Virgin Pina Colada', price: 38, category: 'cold-drinks' },
  { id: 'p37', name: 'Su', price: 8, category: 'cold-drinks' },
  { id: 'p38', name: 'Soda', price: 12, category: 'cold-drinks' },
  { id: 'p39', name: 'Ayran', price: 12, category: 'cold-drinks' },
  { id: 'p40', name: 'Şalgam', price: 15, category: 'cold-drinks' },
  
  // Tatlılar (20 ürün)
  { id: 'p41', name: 'Cheesecake', price: 45, category: 'desserts' },
  { id: 'p42', name: 'Tiramisu', price: 50, category: 'desserts' },
  { id: 'p43', name: 'Brownie', price: 35, category: 'desserts' },
  { id: 'p44', name: 'Sufle', price: 40, category: 'desserts' },
  { id: 'p45', name: 'San Sebastian', price: 42, category: 'desserts' },
  { id: 'p46', name: 'Profiterol', price: 38, category: 'desserts' },
  { id: 'p47', name: 'Magnolia', price: 48, category: 'desserts' },
  { id: 'p48', name: 'Supangle', price: 32, category: 'desserts' },
  { id: 'p49', name: 'Sütlaç', price: 28, category: 'desserts' },
  { id: 'p50', name: 'Kazandibi', price: 30, category: 'desserts' },
  { id: 'p51', name: 'Muhallebi', price: 25, category: 'desserts' },
  { id: 'p52', name: 'Baklava', price: 35, category: 'desserts' },
  { id: 'p53', name: 'Künefe', price: 45, category: 'desserts' },
  { id: 'p54', name: 'Dondurma', price: 22, category: 'desserts' },
  { id: 'p55', name: 'Pasta Dilimi', price: 38, category: 'desserts' },
  { id: 'p56', name: 'Donut', price: 18, category: 'desserts' },
  { id: 'p57', name: 'Kurabiye', price: 15, category: 'desserts' },
  { id: 'p58', name: 'Muffin', price: 20, category: 'desserts' },
  { id: 'p59', name: 'Lokum', price: 30, category: 'desserts' },
  { id: 'p60', name: 'Helva', price: 28, category: 'desserts' },
  
  // Atıştırmalıklar (20 ürün)
  { id: 'p61', name: 'Chips', price: 15, category: 'snacks' },
  { id: 'p62', name: 'Krakerler', price: 12, category: 'snacks' },
  { id: 'p63', name: 'Fındık', price: 25, category: 'snacks' },
  { id: 'p64', name: 'Badem', price: 28, category: 'snacks' },
  { id: 'p65', name: 'Çikolata', price: 18, category: 'snacks' },
  { id: 'p66', name: 'Gofret', price: 14, category: 'snacks' },
  { id: 'p67', name: 'Bisküvi', price: 16, category: 'snacks' },
  { id: 'p68', name: 'Kuruyemiş Karışımı', price: 35, category: 'snacks' },
  { id: 'p69', name: 'Popcorn', price: 20, category: 'snacks' },
  { id: 'p70', name: 'Pretzel', price: 22, category: 'snacks' },
  { id: 'p71', name: 'Nachos', price: 30, category: 'snacks' },
  { id: 'p72', name: 'Çubuk Kraker', price: 13, category: 'snacks' },
  { id: 'p73', name: 'Karışık Kuruyemiş', price: 40, category: 'snacks' },
  { id: 'p74', name: 'Sakız', price: 8, category: 'snacks' },
  { id: 'p75', name: 'Şeker', price: 10, category: 'snacks' },
  { id: 'p76', name: 'Vitamin Şekeri', price: 12, category: 'snacks' },
  { id: 'p77', name: 'Ceviz', price: 32, category: 'snacks' },
  { id: 'p78', name: 'Fıstık', price: 30, category: 'snacks' },
  { id: 'p79', name: 'Leblebi', price: 20, category: 'snacks' },
  { id: 'p80', name: 'Çekirdek', price: 18, category: 'snacks' },
  
  // Kahvaltı (20 ürün)
  { id: 'p81', name: 'Menemen', price: 35, category: 'breakfast' },
  { id: 'p82', name: 'Sahanda Yumurta', price: 28, category: 'breakfast' },
  { id: 'p83', name: 'Omlet', price: 32, category: 'breakfast' },
  { id: 'p84', name: 'Scrambled Eggs', price: 30, category: 'breakfast' },
  { id: 'p85', name: 'Börek', price: 25, category: 'breakfast' },
  { id: 'p86', name: 'Simit', price: 15, category: 'breakfast' },
  { id: 'p87', name: 'Poğaça', price: 18, category: 'breakfast' },
  { id: 'p88', name: 'Açma', price: 12, category: 'breakfast' },
  { id: 'p89', name: 'Croissant', price: 22, category: 'breakfast' },
  { id: 'p90', name: 'Tereyağlı Tost', price: 20, category: 'breakfast' },
  { id: 'p91', name: 'Kaşarlı Tost', price: 25, category: 'breakfast' },
  { id: 'p92', name: 'Karışık Tost', price: 30, category: 'breakfast' },
  { id: 'p93', name: 'Pancake', price: 35, category: 'breakfast' },
  { id: 'p94', name: 'Waffle', price: 38, category: 'breakfast' },
  { id: 'p95', name: 'French Toast', price: 32, category: 'breakfast' },
  { id: 'p96', name: 'Granola', price: 28, category: 'breakfast' },
  { id: 'p97', name: 'Muesli', price: 26, category: 'breakfast' },
  { id: 'p98', name: 'Yoğurt', price: 15, category: 'breakfast' },
  { id: 'p99', name: 'Bal', price: 18, category: 'breakfast' },
  { id: 'p100', name: 'Reçel', price: 16, category: 'breakfast' }
];

// Varsayılan kasa şifresi
const DEFAULT_CASHIER_PASSWORD = '1234';

interface StoreState {
  // Data
  categories: Category[];
  products: Product[];
  cart: Cart;
  selectedCategory: string;
  currentPassword: string;
  
  // Authentication
  isAuthenticated: boolean;
  showSplashScreen: boolean;
  loginError: string;
  enteredPassword: string;
  showLogoutConfirm: boolean;
  
  // Admin Panel
  showAdminPanel: boolean;
  
  // Payment
  showPaymentDialog: boolean;
  paymentStatus: 'waiting' | 'processing' | 'success' | 'error';
  paymentAmount: number;
  paymentMode: 'normal' | 'split-items' | 'mixed' | 'customer-special';
  splitItemsPayment: Array<{itemId: string, paid: boolean}>;
  mixedPayment: {
    cashAmount: number;
    cardAmount: number;
    totalAmount: number;
  };
  
  // Receipt Preview
  showReceiptPreview: boolean;
  receiptData: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    totalAmount: number;
    paymentMethod: string;
  } | null;

  // Loading/Splash Progress
  loadingProgress: number;
  dataLoaded: boolean;
  
  // Actions
  setSelectedCategory: (categoryId: string) => void;
  addToCart: (product: Product, options?: { sizeId?: string }) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  getProductsByCategory: (categoryId: string) => Product[];
  calculateTotal: () => number;
  
  // Auth Actions
  addPasswordDigit: (digit: string) => void;
  removePasswordDigit: () => void;
  clearPassword: () => void;
  attemptLogin: () => void;
  completeSplashScreen: () => void;
  logout: () => void;
  showLogoutDialog: () => void;
  hideLogoutDialog: () => void;
  confirmLogout: () => void;
  
  // Admin Actions
  showAdminPanelDialog: () => void;
  hideAdminPanel: () => void;
  
  // Data Loading
  loadData: () => Promise<void>;
  setLoadingProgress: (progress: number) => void;
  
  // Sales
  saveSale: (paymentMethod: 'cash' | 'card' | 'mixed', cashAmount?: number, cardAmount?: number) => Promise<void>;
  
  addProduct: (product: Product) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  checkCurrentPassword: (password: string) => boolean;
  
  // Payment Actions
  startPayment: (amount: number) => void;
  hidePaymentDialog: () => void;
  completePayment: () => void;
  cancelPayment: () => void;
  setPaymentMode: (mode: 'normal' | 'split-items' | 'mixed' | 'customer-special') => void;
  initializeSplitPayment: () => void;
  markItemAsPaid: (itemId: string) => void;
  setMixedPaymentAmounts: (cashAmount: number, cardAmount: number) => void;
  
  // Receipt Preview Actions
  showReceiptPreviewDialog: (data: any) => void;
  hideReceiptPreview: () => void;
}

export const useStore = create<StoreState>((set, get) => {
  // İlk state'i default değerlerle başlat
  // Veriler async olarak yüklenecek
  
  return {
    // Initial state
    categories: categories,
    products: products,
    cart: { items: [], total: 0 },
    selectedCategory: 'hot-drinks',
    currentPassword: DEFAULT_CASHIER_PASSWORD,
    
    // Auth state
    isAuthenticated: false,
    showSplashScreen: false,
    loginError: '',
    enteredPassword: '',
    showLogoutConfirm: false,
    
    // Admin Panel state
    showAdminPanel: false,
    
      // Payment state
  showPaymentDialog: false,
  paymentStatus: 'waiting',
  paymentAmount: 0,
      paymentMode: 'normal',
  splitItemsPayment: [],
  mixedPayment: {
    cashAmount: 0,
    cardAmount: 0,
    totalAmount: 0
  },
    
    // Receipt Preview state
    showReceiptPreview: false,
    receiptData: null,

    // Loading/Splash
    loadingProgress: 0,
    dataLoaded: false,
  
  // Actions
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),

  setLoadingProgress: (progress: number) => set({ loadingProgress: Math.max(0, Math.min(100, progress)) }),
  
  addToCart: (product, options) => set((state) => {
    const sizeId = options?.sizeId;
    const selectedSize = sizeId && product.sizes ? product.sizes.find(s => s.id === sizeId) : undefined;
    const unitPrice = selectedSize ? selectedSize.price : product.price;
    const lineId = `${product.id}${selectedSize ? `__${selectedSize.id}` : ''}`;

    const existingItem = state.cart.items.find(item => item.lineId === lineId);

    let newItems: CartItem[];
    if (existingItem) {
      newItems = state.cart.items.map(item =>
        item.lineId === lineId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      const newItem: CartItem = {
        lineId,
        product,
        quantity: 1,
        unitPrice,
        selectedSizeId: selectedSize?.id,
        selectedSizeName: selectedSize?.name,
      };
      newItems = [...state.cart.items, newItem];
    }

    const newTotal = newItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    return {
      cart: {
        items: newItems,
        total: newTotal
      }
    };
  }),
  
  removeFromCart: (lineId) => set((state) => {
    const newItems = state.cart.items.filter(item => item.lineId !== lineId);
    const newTotal = newItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    return {
      cart: {
        items: newItems,
        total: newTotal
      }
    };
  }),
  
  updateQuantity: (lineId, quantity) => set((state) => {
    let newItems;
    
    if (quantity <= 0) {
      newItems = state.cart.items.filter(item => item.lineId !== lineId);
    } else {
      newItems = state.cart.items.map(item =>
        item.lineId === lineId
          ? { ...item, quantity }
          : item
      );
    }
    
    const newTotal = newItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    return {
      cart: {
        items: newItems,
        total: newTotal
      }
    };
  }),
  
  clearCart: () => set({ cart: { items: [], total: 0 } }),
  
  getProductsByCategory: (categoryId) => {
    return get().products.filter(product => product.category === categoryId);
  },
  
  calculateTotal: () => {
    const { cart } = get();
    return cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  },
  
  // Auth Actions
  addPasswordDigit: (digit) => set((state) => {
    if (state.enteredPassword.length < 4) {
      return { 
        enteredPassword: state.enteredPassword + digit,
        loginError: ''
      };
    }
    return state;
  }),
  
  removePasswordDigit: () => set((state) => ({
    enteredPassword: state.enteredPassword.slice(0, -1),
    loginError: ''
  })),
  
  clearPassword: () => set({
    enteredPassword: '',
    loginError: ''
  }),
  
  attemptLogin: () => set((state) => {
    if (state.enteredPassword === state.currentPassword) {
      return {
        isAuthenticated: false, // Önce splash göster
        showSplashScreen: true,
        loginError: '',
        enteredPassword: ''
      };
    } else {
      return {
        loginError: 'Hatalı şifre! Tekrar deneyin.',
        enteredPassword: ''
      };
    }
  }),
  
  completeSplashScreen: () => set({
    isAuthenticated: true,
    showSplashScreen: false
  }),
  
  logout: () => set({
    isAuthenticated: false,
    showSplashScreen: false,
    enteredPassword: '',
    loginError: '',
    cart: { items: [], total: 0 },
    showLogoutConfirm: false
  }),
  
  showLogoutDialog: () => set({ showLogoutConfirm: true }),
  
  hideLogoutDialog: () => set({ showLogoutConfirm: false }),
  
  confirmLogout: () => set({
    isAuthenticated: false,
    showSplashScreen: false,
    enteredPassword: '',
    loginError: '',
    cart: { items: [], total: 0 },
    showLogoutConfirm: false,
    showPaymentDialog: false,
    paymentStatus: 'waiting',
    paymentAmount: 0
  }),
  
  // Payment Actions
  startPayment: (amount) => set({
    showPaymentDialog: true,
    paymentStatus: 'waiting',
    paymentAmount: amount
  }),
  
  hidePaymentDialog: () => set({
    showPaymentDialog: false,
    paymentStatus: 'waiting',
    paymentAmount: 0
  }),
  
  completePayment: () => set((state) => ({
    showPaymentDialog: false,
    paymentStatus: 'waiting',
    paymentAmount: 0,
    cart: { items: [], total: 0 }
  })),
  
  cancelPayment: () => set({
    showPaymentDialog: false,
    paymentStatus: 'waiting',
    paymentAmount: 0,
    paymentMode: 'normal',
    splitItemsPayment: [],
    mixedPayment: { cashAmount: 0, cardAmount: 0, totalAmount: 0 }
  }),

  setPaymentMode: (mode) => set((state) => ({
    paymentMode: mode,
    splitItemsPayment: mode === 'split-items' ? 
      state.cart.items.map(item => ({ itemId: item.lineId, paid: false })) : [],
    mixedPayment: mode === 'mixed' ? 
      { cashAmount: 0, cardAmount: 0, totalAmount: state.paymentAmount } : 
      { cashAmount: 0, cardAmount: 0, totalAmount: 0 }
  })),

  initializeSplitPayment: () => set((state) => ({
    splitItemsPayment: state.cart.items.map(item => ({ itemId: item.lineId, paid: false }))
  })),

  markItemAsPaid: (itemId) => set((state) => ({
    splitItemsPayment: state.splitItemsPayment.map(item => 
      item.itemId === itemId ? { ...item, paid: true } : item
    )
  })),

  setMixedPaymentAmounts: (cashAmount, cardAmount) => set((state) => ({
    mixedPayment: {
      cashAmount,
      cardAmount,
      totalAmount: state.paymentAmount
    }
  })),
  
  // Receipt Preview Actions
  showReceiptPreviewDialog: (data) => set({
    showReceiptPreview: true,
    receiptData: data
  }),
  
  hideReceiptPreview: () => set({
    showReceiptPreview: false,
    receiptData: null
  }),
  
  // Admin Panel Actions
  showAdminPanelDialog: () => set({ showAdminPanel: true }),
  
  hideAdminPanel: () => set({ showAdminPanel: false }),
  
  addProduct: async (product: Product) => {
    try {
      const db = getDatabaseIPC();
      const success = await db.addProduct(product);
      
      if (success) {
        set((state) => ({
          products: [...state.products, product]
        }));
      } else {
        console.error('Ürün veritabanına eklenemedi');
      }
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
    }
  },
  
  removeProduct: async (productId: string) => {
    try {
      const db = getDatabaseIPC();
      const success = await db.deleteProduct(productId);
      
      if (success) {
        set((state) => ({
          products: state.products.filter(p => p.id !== productId)
        }));
      } else {
        console.error('Ürün veritabanından silinemedi');
      }
    } catch (error) {
      console.error('Ürün silme hatası:', error);
    }
  },
  
  updateProduct: async (productId: string, updates: Partial<Product>) => {
    try {
      const db = getDatabaseIPC();
      const success = await db.updateProduct(productId, updates);
      
      if (success) {
        set((state) => ({
          products: state.products.map(p => 
            p.id === productId ? { ...p, ...updates } : p
          )
        }));
      } else {
        console.error('Ürün veritabanında güncellenemedi');
      }
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
    }
      },
    
    // Verileri yükle
    loadData: async () => {
      try {
        if (get().dataLoaded) {
          set({ loadingProgress: 100 });
          return;
        }
        set({ loadingProgress: 5 });
        const db = getDatabaseIPC();
        set({ loadingProgress: 10 });
        const [loadedCategories, loadedProducts, loadedPassword] = await Promise.all([
          db.getCategories(),
          db.getProducts(),
          db.loadPassword()
        ]);
        set({ loadingProgress: 70 });
        // Boyut migrasyonu: Veritabanından gelen ürünlerde sizes yoksa bazı bilinen ürünlere default sizes ekle
        const migratedProducts = (loadedProducts.length > 0 ? loadedProducts : products).map((p) => {
          if (p.sizes && p.sizes.length > 0) return p;
          switch (p.id) {
            case 'p5': // Latte
              return { ...p, sizes: [
                { id: 'small', name: 'Küçük', price: 32 },
                { id: 'medium', name: 'Orta', price: 35 },
                { id: 'large', name: 'Büyük', price: 39 },
              ] };
            case 'p6': // Americano
              return { ...p, sizes: [
                { id: 'small', name: 'Küçük', price: 22 },
                { id: 'medium', name: 'Orta', price: 25 },
                { id: 'large', name: 'Büyük', price: 28 },
              ] };
            case 'p22': // Ice Latte
              return { ...p, sizes: [
                { id: 'small', name: 'Küçük', price: 35 },
                { id: 'medium', name: 'Orta', price: 38 },
                { id: 'large', name: 'Büyük', price: 42 },
              ] };
            case 'p26': // Limonata
              return { ...p, sizes: [
                { id: 'small', name: 'Küçük', price: 20 },
                { id: 'medium', name: 'Orta', price: 22 },
                { id: 'large', name: 'Büyük', price: 26 },
              ] };
            default:
              return p;
          }
        });

        set({
          categories: loadedCategories.length > 0 ? loadedCategories : categories,
          products: migratedProducts,
          currentPassword: loadedPassword || DEFAULT_CASHIER_PASSWORD,
          loadingProgress: 95
        });
        set({ loadingProgress: 100, dataLoaded: true });
        
        console.log('✅ Veriler başarıyla yüklendi:', {
          categories: loadedCategories.length,
          products: loadedProducts.length,
          hasPassword: !!loadedPassword
        });
      } catch (error) {
        console.error('❌ Veri yükleme hatası:', error);
        set({ loadingProgress: 100 });
      }
         },
     
     // Satış kaydet
     saveSale: async (paymentMethod: 'cash' | 'card' | 'mixed', cashAmount?: number, cardAmount?: number) => {
       try {
         const state = get();
         if (state.cart.items.length === 0) return;

         const now = new Date();
         const sale: Sale = {
           id: `sale_${Date.now()}`,
           date: now.toISOString().split('T')[0],
           time: now.toTimeString().split(' ')[0].substring(0, 5),
           totalAmount: state.cart.total,
           paymentMethod,
           cashAmount,
           cardAmount,
           items: state.cart.items.map(item => ({
             productId: item.product.id,
             productName: item.product.name + (item.selectedSizeName ? ` (${item.selectedSizeName})` : ''),
             quantity: item.quantity,
             unitPrice: item.unitPrice,
             totalPrice: item.unitPrice * item.quantity,
             category: item.product.category
           })),
           createdAt: now.toISOString()
         };

         const db = getDatabaseIPC();
         const success = await db.saveSale(sale);
         
         if (success) {
           console.log(`✅ Satış başarıyla kaydedildi: ${sale.date} ${sale.time} - ${sale.totalAmount} TL (${sale.paymentMethod})`);
           console.log(`📊 Gerçek zaman: ${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}`);
         } else {
           console.error('❌ Satış kaydedilemedi');
         }
       } catch (error) {
         console.error('Satış kaydetme hatası:', error);
       }
     },
     
     changePassword: async (newPassword: string) => {
       try {
         await savePassword(newPassword);
         set({ currentPassword: newPassword });
       } catch (error) {
         console.error('Şifre kaydetme hatası:', error);
       }
     },
  
  checkCurrentPassword: (password: string) => {
    const state = get();
    return state.currentPassword === password;
  },
  };
}); 