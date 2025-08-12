// Ürün tipi
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  // Opsiyonel boyutlar (ör. Küçük/Orta/Büyük)
  sizes?: Array<{
    id: string;      // 'small' | 'medium' | 'large' gibi
    name: string;    // Görünen ad: 'Küçük', 'Orta', 'Büyük'
    price: number;   // Bu boyutun fiyatı
  }>;
}

// Kategori tipi
export interface Category {
  id: string;
  name: string;
  icon?: string;
}

// Sepet item tipi
export interface CartItem {
  // Aynı ürünün farklı boyutlarını ayırmak için benzersiz satır anahtarı
  lineId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  selectedSizeId?: string;
  selectedSizeName?: string;
}

// Sepet tipi
export interface Cart {
  items: CartItem[];
  total: number;
}

// Satış tipi
export interface Sale {
  id: string;
  date: string; // ISO string format
  time: string; // HH:mm format
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mixed';
  cashAmount?: number; // Nakit karma ödemeler için
  cardAmount?: number; // Kart karma ödemeler için
  customerCount?: number;
  notes?: string;
  createdAt: string; // ISO string format
}

// Satış item tipi
export interface SaleItem {
  productId: string;
  productName: string; // Boyut varsa: "Latte (Büyük)"
  quantity: number;
  unitPrice: number;   // Seçilen boyutun fiyatı
  totalPrice: number;  // quantity * unitPrice
  category: string;
}

// Dashboard istatistikleri
export interface DashboardStats {
  todaySales: {
    count: number;
    totalAmount: number;
    cashSales: number;
    cardSales: number;
    mixedSales: number;
  };
  weeklySales: {
    count: number;
    totalAmount: number;
  };
  monthlySales: {
    count: number;
    totalAmount: number;
  };
  topProducts: Array<{
    productName: string;
    quantity: number;
    totalSales: number;
  }>;
  topCategories: Array<{
    categoryName: string;
    quantity: number;
    totalSales: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    sales: number;
    amount: number;
  }>;
  paymentMethodStats: {
    cash: { count: number; amount: number };
    card: { count: number; amount: number };
    mixed: { count: number; amount: number };
  };
} 

// Müşteri tipi
export interface Customer {
  id: number;
  name: string;
  phone?: string;
  createdAt: string;
}