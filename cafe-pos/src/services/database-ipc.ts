import { Category, Product, Sale, DashboardStats } from '../types';

// IPC üzerinden database işlemleri yapan servis
export class DatabaseIPCService {
  
  // ==================== KATEGORİ İŞLEMLERİ ====================
  
  async getCategories(): Promise<Category[]> {
    try {
      const result = await (window as any).electronAPI.database.getCategories();
      return result || [];
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      return [];
    }
  }

  async addCategory(category: Category): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.addCategory(category);
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      return false;
    }
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.updateCategory(id, updates);
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      return false;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.deleteCategory(id);
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      return false;
    }
  }

  // ==================== ÜRÜN İŞLEMLERİ ====================

  async getProducts(): Promise<Product[]> {
    try {
      const result = await (window as any).electronAPI.database.getProducts();
      return result || [];
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      return [];
    }
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const result = await (window as any).electronAPI.database.getProductsByCategory(categoryId);
      return result || [];
    } catch (error) {
      console.error('Kategori ürünleri yüklenirken hata:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await (window as any).electronAPI.database.getProductById(id);
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error);
      return null;
    }
  }

  async addProduct(product: Product): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.addProduct(product);
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      return false;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.updateProduct(id, updates);
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      return false;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.deleteProduct(id);
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      return false;
    }
  }

  // ==================== AYARLAR İŞLEMLERİ ====================

  async getSetting(key: string): Promise<string | null> {
    try {
      return await (window as any).electronAPI.database.getSetting(key);
    } catch (error) {
      console.error('Ayar yüklenirken hata:', error);
      return null;
    }
  }

  async setSetting(key: string, value: string): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.setSetting(key, value);
    } catch (error) {
      console.error('Ayar kaydetme hatası:', error);
      return false;
    }
  }

  async savePassword(password: string): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.savePassword(password);
    } catch (error) {
      console.error('Şifre kaydetme hatası:', error);
      return false;
    }
  }

  async loadPassword(): Promise<string | null> {
    try {
      return await (window as any).electronAPI.database.loadPassword();
    } catch (error) {
      console.error('Şifre yüklenirken hata:', error);
      return null;
    }
  }

  // ==================== VERİTABANI İŞLEMLERİ ====================

  async saveCategories(categories: Category[]): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.saveCategories(categories);
    } catch (error) {
      console.error('Kategoriler kaydetme hatası:', error);
      return false;
    }
  }

  async saveProducts(products: Product[]): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.saveProducts(products);
    } catch (error) {
      console.error('Ürünler kaydetme hatası:', error);
      return false;
    }
  }

  async clearAllData(): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.clearAllData();
    } catch (error) {
      console.error('Veritabanı temizleme hatası:', error);
      return false;
    }
  }

  async getDatabasePath(): Promise<string> {
    try {
      return await (window as any).electronAPI.database.getDatabasePath();
    } catch (error) {
      console.error('Veritabanı yolu alınırken hata:', error);
      return '';
    }
  }

  // ==================== SATIŞ İŞLEMLERİ ====================

  async saveSale(sale: Sale): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.saveSale(sale);
    } catch (error) {
      console.error('Satış kaydetme hatası:', error);
      return false;
    }
  }

  async getAllSales(): Promise<Sale[]> {
    try {
      const result = await (window as any).electronAPI.database.getAllSales();
      return result || [];
    } catch (error) {
      console.error('Satışları alma hatası:', error);
      return [];
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await (window as any).electronAPI.database.getDashboardStats();
    } catch (error) {
      console.error('Dashboard istatistikleri alma hatası:', error);
      return {
        todaySales: { count: 0, totalAmount: 0, cashSales: 0, cardSales: 0, mixedSales: 0 },
        weeklySales: { count: 0, totalAmount: 0 },
        monthlySales: { count: 0, totalAmount: 0 },
        topProducts: [],
        topCategories: [],
        hourlyStats: [],
        paymentMethodStats: {
          cash: { count: 0, amount: 0 },
          card: { count: 0, amount: 0 },
          mixed: { count: 0, amount: 0 }
        }
      };
    }
  }

  // ==================== MASA SİPARİŞLERİ İŞLEMLERİ ====================

  async getActiveTableOrders(): Promise<{ [key: number]: { items: any[], total: number, startTime: Date } }> {
    try {
      const result = await (window as any).electronAPI.database.getActiveTableOrders();
      return result || {};
    } catch (error) {
      console.error('Aktif masa siparişleri alma hatası:', error);
      return {};
    }
  }

  async saveTableOrder(tableNumber: number, items: any[], total: number): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.saveTableOrder(tableNumber, items, total);
    } catch (error) {
      console.error('Masa siparişi kaydetme hatası:', error);
      return false;
    }
  }

  async addToTableOrder(tableNumber: number, items: any[], total: number): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.addToTableOrder(tableNumber, items, total);
    } catch (error) {
      console.error('Masaya sipariş ekleme hatası:', error);
      return false;
    }
  }

  async closeTableOrder(tableNumber: number): Promise<boolean> {
    try {
      return await (window as any).electronAPI.database.closeTableOrder(tableNumber);
    } catch (error) {
      console.error('Masa siparişi kapatma hatası:', error);
      return false;
    }
  }
}

// Singleton instance
let databaseIPCInstance: DatabaseIPCService | null = null;

export const getDatabaseIPC = (): DatabaseIPCService => {
  if (!databaseIPCInstance) {
    databaseIPCInstance = new DatabaseIPCService();
  }
  return databaseIPCInstance;
};

export default DatabaseIPCService; 