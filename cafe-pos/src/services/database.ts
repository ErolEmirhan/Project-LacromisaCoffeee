import Database from 'better-sqlite3';
import { Category, Product, Sale, SaleItem, DashboardStats } from '../types';
import { app } from 'electron';
import path from 'path';

class DatabaseService {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // Electron app verilerinin saklanacağı dizini al
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'cafe-data.db');
    
    // Veritabanını aç veya oluştur
    this.db = new Database(this.dbPath);
    
    // Tabloları oluştur
    this.initializeTables();
    
    console.log('SQLite veritabanı başlatıldı:', this.dbPath);
  }

  private initializeTables(): void {
    try {
      // Kategoriler tablosu
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT
        )
      `);

      // Ürünler tablosu
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          category TEXT NOT NULL,
          image TEXT,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category) REFERENCES categories(id)
        )
      `);

      // Uygulama ayarları tablosu
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Satışlar tablosu
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS sales (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          total_amount REAL NOT NULL,
          payment_method TEXT NOT NULL,
          cash_amount REAL,
          card_amount REAL,
          customer_count INTEGER,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Satış detayları tablosu
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS sale_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sale_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price REAL NOT NULL,
          total_price REAL NOT NULL,
          category TEXT NOT NULL,
          FOREIGN KEY (sale_id) REFERENCES sales(id)
        )
      `);

      // Masa siparişleri tablosu
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS table_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_number INTEGER NOT NULL,
          total_amount REAL NOT NULL,
          start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Masa sipariş detayları tablosu
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS table_order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_order_id INTEGER NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price REAL NOT NULL,
          total_price REAL NOT NULL,
          category TEXT NOT NULL,
          FOREIGN KEY (table_order_id) REFERENCES table_orders(id)
        )
      `);

      console.log('Veritabanı tabloları hazır!');
    } catch (error) {
      console.error('Tablo oluşturma hatası:', error);
      throw error;
    }
  }

  // ==================== KATEGORİ İŞLEMLERİ ====================

  // Tüm kategorileri getir
  getCategories(): Category[] {
    try {
      const stmt = this.db.prepare('SELECT * FROM categories ORDER BY name');
      return stmt.all() as Category[];
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      return [];
    }
  }

  // Kategori ekle
  addCategory(category: Category): boolean {
    try {
      const stmt = this.db.prepare('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)');
      const result = stmt.run(category.id, category.name, category.icon || null);
      return result.changes > 0;
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      return false;
    }
  }

  // Kategori güncelle
  updateCategory(id: string, updates: Partial<Category>): boolean {
    try {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(id);
      
      const stmt = this.db.prepare(`UPDATE categories SET ${fields} WHERE id = ?`);
      const result = stmt.run(...values);
      return result.changes > 0;
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
      return false;
    }
  }

  // Kategori sil
  deleteCategory(id: string): boolean {
    try {
      // Önce bu kategorideki ürünlerin olup olmadığını kontrol et
      const productCheck = this.db.prepare('SELECT COUNT(*) as count FROM products WHERE category = ?');
      const result = productCheck.get(id) as { count: number };
      
      if (result.count > 0) {
        console.error('Bu kategoride ürünler var, silinemiyor!');
        return false;
      }

      const stmt = this.db.prepare('DELETE FROM categories WHERE id = ?');
      const deleteResult = stmt.run(id);
      return deleteResult.changes > 0;
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      return false;
    }
  }

  // ==================== ÜRÜN İŞLEMLERİ ====================

  // Tüm ürünleri getir
  getProducts(): Product[] {
    try {
      const stmt = this.db.prepare('SELECT * FROM products ORDER BY name');
      return stmt.all() as Product[];
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      return [];
    }
  }

  // Kategoriye göre ürünleri getir
  getProductsByCategory(categoryId: string): Product[] {
    try {
      const stmt = this.db.prepare('SELECT * FROM products WHERE category = ? ORDER BY name');
      return stmt.all(categoryId) as Product[];
    } catch (error) {
      console.error('Kategori ürünleri yüklenirken hata:', error);
      return [];
    }
  }

  // ID'ye göre ürün getir
  getProductById(id: string): Product | null {
    try {
      const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
      return stmt.get(id) as Product || null;
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error);
      return null;
    }
  }

  // Ürün ekle
  addProduct(product: Product): boolean {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO products (id, name, price, category, image, description) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        product.id, 
        product.name, 
        product.price, 
        product.category, 
        product.image || null, 
        product.description || null
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      return false;
    }
  }

  // Ürün güncelle
  updateProduct(id: string, updates: Partial<Product>): boolean {
    try {
      const fields = Object.keys(updates)
        .filter(key => key !== 'id') // ID güncellenemesin
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => updates[key as keyof Product]);
      
      values.push(id);
      
      const stmt = this.db.prepare(`UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
      const result = stmt.run(...values);
      return result.changes > 0;
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      return false;
    }
  }

  // Ürün sil
  deleteProduct(id: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      return false;
    }
  }

  // ==================== AYARLAR İŞLEMLERİ ====================

  // Ayar getir
  getSetting(key: string): string | null {
    try {
      const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
      const result = stmt.get(key) as { value: string } | undefined;
      return result ? result.value : null;
    } catch (error) {
      console.error('Ayar yüklenirken hata:', error);
      return null;
    }
  }

  // Ayar kaydet/güncelle
  setSetting(key: string, value: string): boolean {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
      const result = stmt.run(key, value);
      return result.changes > 0;
    } catch (error) {
      console.error('Ayar kaydetme hatası:', error);
      return false;
    }
  }

  // Şifre kaydet
  savePassword(password: string): boolean {
    return this.setSetting('cashier_password', password);
  }

  // Şifre yükle
  loadPassword(): string | null {
    return this.getSetting('cashier_password');
  }

  // ==================== VERİTABANI İŞLEMLERİ ====================

  // Kategorileri toplu kaydet (ilk kurulum için)
  saveCategories(categories: Category[]): boolean {
    try {
      const stmt = this.db.prepare('INSERT OR REPLACE INTO categories (id, name, icon) VALUES (?, ?, ?)');
      
      const transaction = this.db.transaction((cats: Category[]) => {
        for (const category of cats) {
          stmt.run(category.id, category.name, category.icon || null);
        }
      });
      
      transaction(categories);
      return true;
    } catch (error) {
      console.error('Kategoriler kaydetme hatası:', error);
      return false;
    }
  }

  // Ürünleri toplu kaydet (ilk kurulum için)
  saveProducts(products: Product[]): boolean {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO products (id, name, price, category, image, description) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const transaction = this.db.transaction((prods: Product[]) => {
        for (const product of prods) {
          stmt.run(
            product.id, 
            product.name, 
            product.price, 
            product.category, 
            product.image || null, 
            product.description || null
          );
        }
      });
      
      transaction(products);
      return true;
    } catch (error) {
      console.error('Ürünler kaydetme hatası:', error);
      return false;
    }
  }

  // Veritabanını temizle
  clearAllData(): boolean {
    try {
      this.db.exec('DELETE FROM products');
      this.db.exec('DELETE FROM categories');
      this.db.exec('DELETE FROM settings');
      return true;
    } catch (error) {
      console.error('Veritabanı temizleme hatası:', error);
      return false;
    }
  }

  // Veritabanı bağlantısını kapat
  close(): void {
    try {
      this.db.close();
      console.log('Veritabanı bağlantısı kapatıldı.');
    } catch (error) {
      console.error('Veritabanı kapatma hatası:', error);
    }
  }

  // Veritabanı yolunu getir
  getDatabasePath(): string {
    return this.dbPath;
  }

  // ==================== MASA SİPARİŞLERİ İŞLEMLERİ ====================

  // Aktif masa siparişlerini getir
  getActiveTableOrders(): { [key: number]: { items: any[], total: number, startTime: Date } } {
    try {
      const ordersStmt = this.db.prepare(`
        SELECT * FROM table_orders 
        WHERE is_active = 1 
        ORDER BY table_number
      `);
      const orders = ordersStmt.all() as any[];

      const itemsStmt = this.db.prepare(`
        SELECT * FROM table_order_items 
        WHERE table_order_id = ?
      `);

      const result: { [key: number]: { items: any[], total: number, startTime: Date } } = {};

      orders.forEach(order => {
        const items = itemsStmt.all(order.id).map((item: any) => ({
          product: {
            id: item.product_id,
            name: item.product_name,
            price: item.unit_price,
            category: item.category
          },
          quantity: item.quantity
        }));

        result[order.table_number] = {
          items,
          total: order.total_amount,
          startTime: new Date(order.start_time)
        };
      });

      return result;
    } catch (error) {
      console.error('Aktif masa siparişleri getirme hatası:', error);
      return {};
    }
  }

  // Masa siparişi kaydet
  saveTableOrder(tableNumber: number, items: any[], total: number): boolean {
    try {
      const transaction = this.db.transaction(() => {
        // Masa siparişini kaydet
        const orderStmt = this.db.prepare(`
          INSERT INTO table_orders (table_number, total_amount, start_time, is_active) 
          VALUES (?, ?, CURRENT_TIMESTAMP, 1)
        `);
        
        const result = orderStmt.run(tableNumber, total);
        const orderId = result.lastInsertRowid;

        // Sipariş detaylarını kaydet
        const itemStmt = this.db.prepare(`
          INSERT INTO table_order_items (table_order_id, product_id, product_name, quantity, unit_price, total_price, category) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          itemStmt.run(
            orderId,
            item.product.id,
            item.product.name,
            item.quantity,
            item.product.price,
            item.product.price * item.quantity,
            item.product.category
          );
        }
      });

      transaction();
      return true;
    } catch (error) {
      console.error('Masa siparişi kaydetme hatası:', error);
      return false;
    }
  }

  // Mevcut masaya sipariş ekle
  addToTableOrder(tableNumber: number, items: any[], total: number): boolean {
    try {
      const transaction = this.db.transaction(() => {
        // Mevcut siparişi bul
        const existingOrderStmt = this.db.prepare(`
          SELECT * FROM table_orders 
          WHERE table_number = ? AND is_active = 1
        `);
        const existingOrder = existingOrderStmt.get(tableNumber) as any;

        if (existingOrder) {
          // Mevcut siparişe ekle
          const itemStmt = this.db.prepare(`
            INSERT INTO table_order_items (table_order_id, product_id, product_name, quantity, unit_price, total_price, category) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          for (const item of items) {
            itemStmt.run(
              existingOrder.id,
              item.product.id,
              item.product.name,
              item.quantity,
              item.product.price,
              item.product.price * item.quantity,
              item.product.category
            );
          }

          // Toplam tutarı güncelle
          const updateStmt = this.db.prepare(`
            UPDATE table_orders 
            SET total_amount = total_amount + ? 
            WHERE id = ?
          `);
          updateStmt.run(total, existingOrder.id);
        } else {
          // Yeni sipariş oluştur
          this.saveTableOrder(tableNumber, items, total);
        }
      });

      transaction();
      return true;
    } catch (error) {
      console.error('Masaya sipariş ekleme hatası:', error);
      return false;
    }
  }

  // Masa siparişini ödeme ile kapat
  closeTableOrder(tableNumber: number): boolean {
    try {
      const transaction = this.db.transaction(() => {
        // Masa siparişini pasif yap
        const updateStmt = this.db.prepare(`
          UPDATE table_orders 
          SET is_active = 0 
          WHERE table_number = ? AND is_active = 1
        `);
        updateStmt.run(tableNumber);
      });

      transaction();
      return true;
    } catch (error) {
      console.error('Masa siparişi kapatma hatası:', error);
      return false;
    }
  }

  // ==================== SATIŞ İŞLEMLERİ ====================

  // Satış kaydet
  saveSale(sale: Sale): boolean {
    try {
      const transaction = this.db.transaction(() => {
        // Satış bilgisini kaydet
        const saleStmt = this.db.prepare(`
          INSERT INTO sales (id, date, time, total_amount, payment_method, cash_amount, card_amount, customer_count, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        saleStmt.run(
          sale.id,
          sale.date,
          sale.time,
          sale.totalAmount,
          sale.paymentMethod,
          sale.cashAmount || null,
          sale.cardAmount || null,
          sale.customerCount || null,
          sale.notes || null
        );

        // Satış detaylarını kaydet
        const itemStmt = this.db.prepare(`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, total_price, category) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of sale.items) {
          itemStmt.run(
            sale.id,
            item.productId,
            item.productName,
            item.quantity,
            item.unitPrice,
            item.totalPrice,
            item.category
          );
        }
      });

      transaction();
      return true;
    } catch (error) {
      console.error('Satış kaydetme hatası:', error);
      return false;
    }
  }

  // Tüm satışları getir
  getAllSales(): Sale[] {
    try {
      const salesStmt = this.db.prepare(`
        SELECT * FROM sales 
        ORDER BY created_at DESC
      `);
      const sales = salesStmt.all() as any[];

      const itemsStmt = this.db.prepare(`
        SELECT * FROM sale_items 
        WHERE sale_id = ?
      `);

      return sales.map(sale => ({
        id: sale.id,
        date: sale.date,
        time: sale.time,
        totalAmount: sale.total_amount,
        paymentMethod: sale.payment_method,
        cashAmount: sale.cash_amount,
        cardAmount: sale.card_amount,
        customerCount: sale.customer_count,
        notes: sale.notes,
        createdAt: sale.created_at,
        items: itemsStmt.all(sale.id).map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          category: item.category
        }))
      }));
    } catch (error) {
      console.error('Satışları getirme hatası:', error);
      return [];
    }
  }

  // Dashboard istatistiklerini getir
  getDashboardStats(): DashboardStats {
    try {
      const today = new Date().toISOString().split('T')[0];
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Bugünkü satışlar
      const todayStmt = this.db.prepare(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as total_amount,
          COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN 1 ELSE 0 END), 0) as cash_sales,
          COALESCE(SUM(CASE WHEN payment_method = 'card' THEN 1 ELSE 0 END), 0) as card_sales,
          COALESCE(SUM(CASE WHEN payment_method = 'mixed' THEN 1 ELSE 0 END), 0) as mixed_sales
        FROM sales 
        WHERE date = ?
      `);
      const todaySales = todayStmt.get(today) as any;

      // Haftalık satışlar
      const weeklyStmt = this.db.prepare(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as total_amount
        FROM sales 
        WHERE date >= ?
      `);
      const weeklySales = weeklyStmt.get(oneWeekAgo) as any;

      // Aylık satışlar
      const monthlyStmt = this.db.prepare(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as total_amount
        FROM sales 
        WHERE date >= ?
      `);
      const monthlySales = monthlyStmt.get(oneMonthAgo) as any;

      // En çok satılan ürünler
      const topProductsStmt = this.db.prepare(`
        SELECT 
          product_name,
          SUM(quantity) as quantity,
          SUM(total_price) as total_sales
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE s.date >= ?
        GROUP BY product_name
        ORDER BY quantity DESC
        LIMIT 10
      `);
      const topProducts = topProductsStmt.all(oneWeekAgo) as any[];

      // En çok satılan kategoriler
      const topCategoriesStmt = this.db.prepare(`
        SELECT 
          category as category_name,
          SUM(quantity) as quantity,
          SUM(total_price) as total_sales
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE s.date >= ?
        GROUP BY category
        ORDER BY quantity DESC
        LIMIT 5
      `);
      const topCategories = topCategoriesStmt.all(oneWeekAgo) as any[];

      // Saatlik istatistikler (bugün)
      const hourlyStatsStmt = this.db.prepare(`
        SELECT 
          CAST(substr(time, 1, 2) AS INTEGER) as hour,
          COUNT(*) as sales,
          COALESCE(SUM(total_amount), 0) as amount
        FROM sales
        WHERE date = ?
        GROUP BY hour
        ORDER BY hour
      `);
      const hourlyStats = hourlyStatsStmt.all(today) as any[];

      // Ödeme yöntemi istatistikleri
      const paymentStatsStmt = this.db.prepare(`
        SELECT 
          payment_method,
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as amount
        FROM sales
        WHERE date >= ?
        GROUP BY payment_method
      `);
      const paymentStats = paymentStatsStmt.all(oneWeekAgo) as any[];

      const paymentMethodStats = {
        cash: { count: 0, amount: 0 },
        card: { count: 0, amount: 0 },
        mixed: { count: 0, amount: 0 }
      };

      paymentStats.forEach((stat: any) => {
        paymentMethodStats[stat.payment_method as keyof typeof paymentMethodStats] = {
          count: stat.count,
          amount: stat.amount
        };
      });

      return {
        todaySales: {
          count: todaySales.count || 0,
          totalAmount: todaySales.total_amount || 0,
          cashSales: todaySales.cash_sales || 0,
          cardSales: todaySales.card_sales || 0,
          mixedSales: todaySales.mixed_sales || 0
        },
        weeklySales: {
          count: weeklySales.count || 0,
          totalAmount: weeklySales.total_amount || 0
        },
        monthlySales: {
          count: monthlySales.count || 0,
          totalAmount: monthlySales.total_amount || 0
        },
        topProducts: topProducts.map(p => ({
          productName: p.product_name,
          quantity: p.quantity,
          totalSales: p.total_sales
        })),
        topCategories: topCategories.map(c => ({
          categoryName: c.category_name,
          quantity: c.quantity,
          totalSales: c.total_sales
        })),
        hourlyStats: hourlyStats.map(h => ({
          hour: h.hour,
          sales: h.sales,
          amount: h.amount
        })),
        paymentMethodStats
      };
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
}

// Singleton pattern - tek instance kullan
let databaseInstance: DatabaseService | null = null;

export const getDatabase = (): DatabaseService => {
  if (!databaseInstance) {
    databaseInstance = new DatabaseService();
  }
  return databaseInstance;
};

export const closeDatabase = (): void => {
  if (databaseInstance) {
    databaseInstance.close();
    databaseInstance = null;
  }
};

export default DatabaseService; 