import Database from 'better-sqlite3';
import { Category, Product, Sale, SaleItem, DashboardStats } from '../types';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;
  private isInitialized: boolean = false;

  constructor() {
    try {
      // Electron app verilerinin saklanacağı dizini al
      const userDataPath = app.getPath('userData');
      
      // Veritabanı dizinini oluştur
      const dbDir = path.join(userDataPath, 'database');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      this.dbPath = path.join(dbDir, 'cafe-data.db');
      
      // Veritabanını başlat
      this.initializeDatabase();
      
      console.log('✅ SQLite veritabanı başlatıldı:', this.dbPath);
    } catch (error) {
      console.error('❌ Veritabanı başlatma hatası:', error);
      throw error;
    }
  }

  private initializeDatabase(): void {
    try {
      // Veritabanı bağlantısını oluştur
      this.db = new Database(this.dbPath, {
        verbose: console.log,
        fileMustExist: false
      });

      // WAL modunu etkinleştir (daha iyi performans ve güvenlik)
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 10000');
      this.db.pragma('temp_store = MEMORY');

      // Tabloları oluştur
      this.initializeTables();
      
      this.isInitialized = true;
      console.log('✅ Veritabanı başarıyla başlatıldı');
    } catch (error) {
      console.error('❌ Veritabanı başlatma hatası:', error);
      this.db = null;
      this.isInitialized = false;
      throw error;
    }
  }

  private initializeTables(): void {
    if (!this.db) {
      throw new Error('Veritabanı bağlantısı bulunamadı');
    }

    try {
      // Transaction içinde tüm tabloları oluştur
      const transaction = this.db.transaction(() => {
        // Kategoriler tablosu
        this.db!.exec(`
          CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT
          )
        `);

        // Ürünler tablosu
        this.db!.exec(`
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
        this.db!.exec(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Satışlar tablosu
        this.db!.exec(`
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
        this.db!.exec(`
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
        this.db!.exec(`
          CREATE TABLE IF NOT EXISTS table_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number INTEGER NOT NULL,
            items TEXT,
            total_amount REAL NOT NULL,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Masa sipariş detayları tablosu
        this.db!.exec(`
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

        // Müşteriler tablosu
        this.db!.exec(`
          CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Müşteri siparişleri tablosu
        this.db!.exec(`
          CREATE TABLE IF NOT EXISTS customer_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            items TEXT NOT NULL,
            total_amount REAL NOT NULL,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_paid INTEGER DEFAULT 0,
            payment_method TEXT,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
          )
        `);
      });

      transaction();
      console.log('✅ Veritabanı tabloları başarıyla oluşturuldu');
    } catch (error) {
      console.error('❌ Tablo oluşturma hatası:', error);
      throw error;
    }
  }

  // Veritabanı bağlantısını kontrol et
  private ensureConnection(): void {
    if (!this.db || !this.isInitialized) {
      console.log('🔄 Veritabanı bağlantısı yeniden başlatılıyor...');
      this.initializeDatabase();
    }
  }

  // Güvenli transaction wrapper
  private safeTransaction<T>(operation: () => T): T {
    this.ensureConnection();
    
    if (!this.db) {
      throw new Error('Veritabanı bağlantısı bulunamadı');
    }

    try {
      const transaction = this.db.transaction(operation);
      return transaction();
    } catch (error) {
      console.error('❌ Transaction hatası:', error);
      throw error;
    }
  }

  // ==================== KATEGORİ İŞLEMLERİ ====================

  // Tüm kategorileri getir
  getCategories(): Category[] {
    this.ensureConnection();
    if (!this.db) {
      return [];
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return [];
    }
    try {
      const stmt = this.db.prepare('SELECT * FROM products ORDER BY name');
      return stmt.all() as Product[];
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      return [];
    }
  }

  // ==================== MÜŞTERİ İŞLEMLERİ ====================

  // Tüm müşterileri getir
  getCustomers(): Array<{ id: number; name: string; phone?: string; createdAt: string; updatedAt: string }> {
    console.log('🔄 Database getCustomers çağrıldı...');
    this.ensureConnection();
    if (!this.db) {
      console.log('❌ Database bağlantısı yok');
      return [];
    }
    try {
      console.log('📡 SQL sorgusu hazırlanıyor...');
      const stmt = this.db.prepare('SELECT id, name, phone, created_at as createdAt FROM customers ORDER BY id');
      const result = stmt.all() as any[];
      console.log('📋 SQL sorgu sonucu:', result);
      console.log('👥 Müşteri sayısı:', result?.length || 0);
      return result;
    } catch (error) {
      console.error('❌ Müşteriler yüklenirken hata:', error);
      return [];
    }
  }

  // Müşteri siparişi ekle
  addCustomerOrder(customerId: number, items: any[], totalAmount: number, paymentMethod: string = 'Müşteri Özel'): boolean {
    this.ensureConnection();
    if (!this.db) {
      console.error('❌ Müşteri siparişi ekleme hatası: Veritabanı bağlantısı yok');
      return false;
    }
    try {
      console.log('🔄 Müşteri siparişi ekleniyor:', { customerId, totalAmount, paymentMethod });
      
      const itemsJson = JSON.stringify(items);
      const stmt = this.db.prepare(`
        INSERT INTO customer_orders (customer_id, items, total_amount, payment_method) 
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(customerId, itemsJson, totalAmount, paymentMethod);
      console.log('✅ Müşteri siparişi eklendi:', result.changes, 'satır');
      return result.changes > 0;
    } catch (error) {
      console.error('❌ Müşteri siparişi ekleme hatası:', error);
      return false;
    }
  }

  // Müşteri siparişlerini getir
  getCustomerOrders(customerId: number): Array<{ id: number; customerId: number; items: string; totalAmount: number; orderDate: string; isPaid: number; paymentMethod: string }> {
    this.ensureConnection();
    if (!this.db) {
      console.log('❌ Database bağlantısı yok');
      return [];
    }
    try {
      console.log('🔄 Müşteri siparişleri yükleniyor:', customerId);
      const stmt = this.db.prepare(`
        SELECT id, customer_id as customerId, items, total_amount as totalAmount, 
               order_date as orderDate, is_paid as isPaid, payment_method as paymentMethod
        FROM customer_orders 
        WHERE customer_id = ? 
        ORDER BY order_date DESC
      `);
      const result = stmt.all(customerId) as any[];
      console.log('📋 Müşteri siparişleri sonucu:', result);
      return result;
    } catch (error) {
      console.error('❌ Müşteri siparişleri yüklenirken hata:', error);
      return [];
    }
  }

  // Müşteri toplam borcunu hesapla
  getCustomerTotalDebt(customerId: number): number {
    this.ensureConnection();
    if (!this.db) {
      return 0;
    }
    try {
      const stmt = this.db.prepare(`
        SELECT SUM(total_amount) as totalDebt
        FROM customer_orders 
        WHERE customer_id = ? AND is_paid = 0
      `);
      const result = stmt.get(customerId) as any;
      return result?.totalDebt || 0;
    } catch (error) {
      console.error('❌ Müşteri borç hesaplama hatası:', error);
      return 0;
    }
  }

  // Tüm müşterileri sil
  deleteAllCustomers(): boolean {
    this.ensureConnection();
    if (!this.db) {
      console.error('❌ Tüm müşterileri silme hatası: Veritabanı bağlantısı yok');
      return false;
    }
    try {
      console.log('🗑️ Tüm müşteriler siliniyor...');
      
      // Transaction kullanarak güvenli silme
      const transaction = this.db.transaction(() => {
        // Önce customer_orders tablosundan sil (foreign key constraint)
        const deleteOrdersStmt = this.db!.prepare('DELETE FROM customer_orders');
        const ordersResult = deleteOrdersStmt.run();
        console.log('🗑️ Customer orders silindi:', ordersResult.changes, 'satır');
        
        // Sonra customers tablosundan sil
        const deleteCustomersStmt = this.db!.prepare('DELETE FROM customers');
        const customersResult = deleteCustomersStmt.run();
        console.log('🗑️ Customers silindi:', customersResult.changes, 'satır');
        
        // AUTOINCREMENT'i sıfırla (güvenli şekilde)
        try {
          this.db!.exec('DELETE FROM sqlite_sequence WHERE name = "customers"');
          this.db!.exec('DELETE FROM sqlite_sequence WHERE name = "customer_orders"');
        } catch (seqError) {
          console.warn('⚠️ sqlite_sequence sıfırlama hatası (önemli değil):', seqError);
        }
        
        return customersResult.changes >= 0; // 0 veya pozitif sayı başarılı
      });
      
      const result = transaction();
      console.log('✅ Tüm müşteriler başarıyla silindi, sonuç:', result);
      return result;
    } catch (error) {
      console.error('❌ Tüm müşterileri silme hatası:', error);
      return false;
    }
  }

  // Müşteri ekle ve eklenen satırı döndür
  addCustomer(name: string, phone: string | null = null): { id: number; name: string; phone?: string; createdAt: string } | null {
    console.log('🔄 Database addCustomer çağrıldı:', { name, phone });
    this.ensureConnection();
    if (!this.db) {
      console.error('❌ Müşteri ekleme hatası: Veritabanı bağlantısı yok');
      return null;
    }
    try {
      console.log('📡 Tablo varlığı kontrol ediliyor...');
      // Tablo varlığını garantiye al
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tablo kontrol edildi/oluşturuldu, INSERT + RETURNING deneniyor...');
      try {
        const returning = this.db.prepare('INSERT INTO customers (name, phone) VALUES (?, ?) RETURNING id, name, phone, created_at as createdAt').get(name, phone) as any;
        if (returning) {
          console.log('📋 INSERT RETURNING satırı:', returning);
          return returning;
        }
      } catch (retErr) {
        console.warn('⚠️ RETURNING desteklenmiyor, klasik INSERT yöntemine düşülüyor:', retErr);
        const stmt = this.db.prepare('INSERT INTO customers (name, phone) VALUES (?, ?)');
        const result = stmt.run(name, phone ?? null);
        console.log('📋 INSERT sonucu:', result);
        // Önce run() dönen id'yi dene, sonra last_insert_rowid()
        let insertedId: number | null = null;
        const rid = (result as any).lastInsertRowid;
        if (typeof rid === 'bigint') {
          insertedId = Number(rid);
        } else if (typeof rid === 'number') {
          insertedId = rid || null;
        }
        if (!insertedId) {
          try {
            const idRow = this.db.prepare('SELECT last_insert_rowid() as id').get() as any;
            insertedId = Number(idRow?.id) || null;
          } catch {}
        }
        if (result.changes > 0) {
          if (insertedId) {
            const byId = this.db.prepare('SELECT id, name, phone, created_at as createdAt FROM customers WHERE id = ?').get(insertedId) as any;
            if (byId) return byId;
          }
          // Fallback: son satırı oku
          const rowStmt = this.db.prepare('SELECT id, name, phone, created_at as createdAt FROM customers ORDER BY id DESC LIMIT 1');
          const row = rowStmt.get() as any;
          if (row) return row;
          // Hiçbir şekilde satır okunamadıysa null dön
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Müşteri ekleme hatası:', error);
      // Otomatik iyileştirme: tablo yoksa oluştur ve tekrar dene
      const message = (error as any)?.message || '';
      if (message.includes('no such table') && message.includes('customers')) {
        console.log('🔄 Tablo bulunamadı, otomatik oluşturma deneniyor...');
        try {
          this.db!.exec(`
            CREATE TABLE IF NOT EXISTS customers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              phone TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log('✅ Tablo oluşturuldu, tekrar INSERT deneniyor...');
          const retry = this.db!.prepare('INSERT INTO customers (name, phone) VALUES (?, ?)');
          const result = retry.run(name, phone ?? null);
          console.log('📋 Retry INSERT sonucu:', result);
          if (result.changes > 0) {
            let insertedId: number | null = null;
            const rid = (result as any).lastInsertRowid;
            if (typeof rid === 'bigint') {
              insertedId = Number(rid);
            } else if (typeof rid === 'number') {
              insertedId = rid || null;
            }
            if (!insertedId) {
              try {
                const idRow = this.db!.prepare('SELECT last_insert_rowid() as id').get() as any;
                insertedId = Number(idRow?.id) || null;
              } catch {}
            }
            if (insertedId) {
              const byId = this.db!.prepare('SELECT id, name, phone, created_at as createdAt FROM customers WHERE id = ?').get(insertedId) as any;
              if (byId) return byId;
            }
            const rowStmt = this.db!.prepare('SELECT id, name, phone, created_at as createdAt FROM customers ORDER BY id DESC LIMIT 1');
            const row = rowStmt.get() as any;
            return row || null;
          }
          return null;
        } catch (e2) {
          console.error('❌ Müşteri ekleme/otomatik tablo oluşturma hatası:', e2);
          return null;
        }
      }
      return null;
    }
  }

  // Kategoriye göre ürünleri getir
  getProductsByCategory(categoryId: string): Product[] {
    this.ensureConnection();
    if (!this.db) {
      return [];
    }
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
    this.ensureConnection();
    if (!this.db) {
      return null;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return null;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
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
    this.ensureConnection();
    if (this.db) {
      try {
        this.db.close();
        console.log('Veritabanı bağlantısı kapatıldı.');
      } catch (error) {
        console.error('Veritabanı kapatma hatası:', error);
      }
    }
  }

  // Veritabanı yolunu getir
  getDatabasePath(): string {
    return this.dbPath;
  }

  // ==================== MASA SİPARİŞLERİ İŞLEMLERİ ====================

  // Aktif masa siparişlerini getir
  getActiveTableOrders(): { [key: number]: { items: any[], total: number, startTime: Date } } {
    this.ensureConnection();
    if (!this.db) {
      return {};
    }
    try {
      console.log('🔄 Aktif masa siparişleri alınıyor...');
      
      const ordersStmt = this.db.prepare(`
        SELECT * FROM table_orders 
        WHERE is_active = 1 
        ORDER BY table_number
      `);
      const orders = ordersStmt.all() as any[];

      console.log('📊 Bulunan aktif masa siparişleri:', orders.length);

      const itemsStmt = this.db.prepare(`
        SELECT * FROM table_order_items 
        WHERE table_order_id = ?
      `);

      const result: { [key: number]: { items: any[], total: number, startTime: Date } } = {};

      orders.forEach(order => {
        try {
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

          console.log(`✅ Masa ${order.table_number} siparişleri yüklendi:`, items.length, 'ürün');
        } catch (itemError) {
          console.error(`❌ Masa ${order.table_number} sipariş öğeleri yüklenirken hata:`, itemError);
        }
      });

      console.log('✅ Toplam', Object.keys(result).length, 'aktif masa siparişi yüklendi');
      return result;
    } catch (error) {
      console.error('❌ Aktif masa siparişleri getirme hatası:', error);
      return {};
    }
  }

  // Masa siparişi kaydet
  saveTableOrder(tableNumber: number, items: any[], total: number): boolean {
    this.ensureConnection();
    if (!this.db) {
      console.error('❌ Veritabanı bağlantısı bulunamadı');
      return false;
    }
    try {
      console.log('🔄 Masa siparişi kaydediliyor:', { tableNumber, itemsCount: items.length, total });
      
      // Veri doğrulama
      if (!items || items.length === 0) {
        console.error('❌ Sipariş öğeleri boş olamaz');
        return false;
      }

      if (!tableNumber || tableNumber <= 0) {
        console.error('❌ Geçersiz masa numarası:', tableNumber);
        return false;
      }

      if (total <= 0) {
        console.error('❌ Geçersiz toplam tutar:', total);
        return false;
      }

      // Her item için veri doğrulama
      for (const item of items) {
        if (!item.product || !item.product.id || !item.product.name || !item.product.price || !item.product.category) {
          console.error('❌ Geçersiz item yapısı:', item);
          return false;
        }
      }

      // Önce mevcut aktif sipariş var mı kontrol et
      const existingOrderStmt = this.db!.prepare(`
        SELECT * FROM table_orders 
        WHERE table_number = ? AND is_active = 1
      `);
      const existingOrder = existingOrderStmt.get(tableNumber) as any;
      
      if (existingOrder) {
        console.log('⚠️ Masa', tableNumber, 'zaten aktif bir siparişe sahip. Mevcut siparişe ekleniyor...');
        const result = this.addToExistingTableOrderInternal(existingOrder.id, items, total);
        console.log('✅ Mevcut masaya ekleme sonucu:', result);
        return result;
      }

      // Yeni sipariş oluştur
      console.log('🆕 Yeni masa siparişi oluşturuluyor...');
      const result = this.createNewTableOrderInternal(tableNumber, items, total);
      console.log('✅ Yeni masa siparişi oluşturma sonucu:', result);
      return result;
    } catch (error) {
      console.error('❌ Masa siparişi kaydetme hatası:', error);
      return false;
    }
  }

  // Yeni masa siparişi oluştur (internal method)
  private createNewTableOrderInternal(tableNumber: number, items: any[], total: number): boolean {
    this.ensureConnection();
    if (!this.db) {
      console.error('❌ Veritabanı bağlantısı bulunamadı');
      return false;
    }
    try {
      console.log('🔄 Yeni masa siparişi oluşturuluyor:', { tableNumber, itemsCount: items.length, total });
      
      const transaction = this.db!.transaction(() => {
        // Masa siparişini kaydet
        const orderStmt = this.db!.prepare(`
          INSERT INTO table_orders (table_number, total_amount, start_time, is_active) 
          VALUES (?, ?, CURRENT_TIMESTAMP, 1)
        `);
        
        const result = orderStmt.run(tableNumber, total);
        const orderId = result.lastInsertRowid;

        if (!orderId) {
          throw new Error('Masa siparişi oluşturulamadı');
        }

        console.log('✅ Masa siparişi oluşturuldu, ID:', orderId);

        // Sipariş detaylarını kaydet
        const itemStmt = this.db!.prepare(`
          INSERT INTO table_order_items (table_order_id, product_id, product_name, quantity, unit_price, total_price, category) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          const itemResult = itemStmt.run(
            orderId,
            item.product.id,
            item.product.name,
            item.quantity,
            item.product.price,
            item.product.price * item.quantity,
            item.product.category
          );
          
          if (!itemResult.lastInsertRowid) {
            throw new Error(`Sipariş öğesi kaydedilemedi: ${item.product.name}`);
          }
        }

        console.log('✅', items.length, 'sipariş öğesi kaydedildi');
      });

      transaction();
      console.log('✅ Masa siparişi başarıyla kaydedildi');
      return true;
    } catch (error) {
      console.error('❌ Yeni masa siparişi oluşturma hatası:', error);
      return false;
    }
  }

  // Mevcut masaya sipariş ekle (internal method)
  private addToExistingTableOrderInternal(orderId: number, items: any[], total: number): boolean {
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
    try {
      console.log('🔄 Mevcut masaya sipariş ekleniyor:', { orderId, itemsCount: items.length, total });
      
      const transaction = this.db!.transaction(() => {
        // Mevcut siparişe ekle
        const itemStmt = this.db!.prepare(`
          INSERT INTO table_order_items (table_order_id, product_id, product_name, quantity, unit_price, total_price, category) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of items) {
          const itemResult = itemStmt.run(
            orderId,
            item.product.id,
            item.product.name,
            item.quantity,
            item.product.price,
            item.product.price * item.quantity,
            item.product.category
          );
          
          if (!itemResult.lastInsertRowid) {
            throw new Error(`Sipariş öğesi eklenemedi: ${item.product.name}`);
          }
        }

        // Toplam tutarı güncelle
        const updateStmt = this.db!.prepare(`
          UPDATE table_orders 
          SET total_amount = total_amount + ? 
          WHERE id = ?
        `);
        const updateResult = updateStmt.run(total, orderId);
        
        if (updateResult.changes === 0) {
          throw new Error('Masa siparişi toplam tutarı güncellenemedi');
        }

        console.log('✅', items.length, 'sipariş öğesi mevcut masaya eklendi');
      });

      transaction();
      console.log('✅ Masaya sipariş başarıyla eklendi');
      return true;
    } catch (error) {
      console.error('❌ Mevcut masaya sipariş ekleme hatası:', error);
      return false;
    }
  }

  // Mevcut masaya sipariş ekle (public method)
  addToTableOrder(tableNumber: number, items: any[], total: number): boolean {
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
    try {
      console.log('🔄 Masaya sipariş ekleniyor:', { tableNumber, itemsCount: items.length, total });
      
      // Veri doğrulama
      if (!items || items.length === 0) {
        console.error('❌ Sipariş öğeleri boş olamaz');
        return false;
      }

      if (!tableNumber || tableNumber <= 0) {
        console.error('❌ Geçersiz masa numarası:', tableNumber);
        return false;
      }

      if (total <= 0) {
        console.error('❌ Geçersiz toplam tutar:', total);
        return false;
      }

      // Her item için veri doğrulama
      for (const item of items) {
        if (!item.product || !item.product.id || !item.product.name || !item.product.price || !item.product.category) {
          console.error('❌ Geçersiz item yapısı:', item);
          return false;
        }
      }

      // Mevcut siparişi bul
      const existingOrderStmt = this.db!.prepare(`
        SELECT * FROM table_orders 
        WHERE table_number = ? AND is_active = 1
      `);
      const existingOrder = existingOrderStmt.get(tableNumber) as any;

      if (existingOrder) {
        console.log('✅ Mevcut masa siparişi bulundu, ID:', existingOrder.id);
        return this.addToExistingTableOrderInternal(existingOrder.id, items, total);
      } else {
        console.log('⚠️ Mevcut masa siparişi bulunamadı, yeni sipariş oluşturuluyor...');
        return this.createNewTableOrderInternal(tableNumber, items, total);
      }
    } catch (error) {
      console.error('❌ Masaya sipariş ekleme hatası:', error);
      return false;
    }
  }

  // Masa siparişini ödeme ile kapat
  closeTableOrder(tableNumber: number): boolean {
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
    try {
      console.log('🔄 Masa siparişi kapatılıyor:', { tableNumber });
      
      if (!tableNumber || tableNumber <= 0) {
        console.error('❌ Geçersiz masa numarası:', tableNumber);
        return false;
      }

      const transaction = this.db!.transaction(() => {
        // Masa siparişini pasif yap
        const updateStmt = this.db!.prepare(`
          UPDATE table_orders 
          SET is_active = 0 
          WHERE table_number = ? AND is_active = 1
        `);
        const result = updateStmt.run(tableNumber);
        
        if (result.changes === 0) {
          throw new Error(`Masa ${tableNumber} için aktif sipariş bulunamadı`);
        }

        console.log('✅ Masa siparişi başarıyla kapatıldı');
      });

      transaction();
      return true;
    } catch (error) {
      console.error('❌ Masa siparişi kapatma hatası:', error);
      return false;
    }
  }

  // ==================== SATIŞ İŞLEMLERİ ====================

  // Satış kaydet
  saveSale(sale: Sale): boolean {
    this.ensureConnection();
    if (!this.db) {
      return false;
    }
    try {
      const transaction = this.db!.transaction(() => {
        // Satış bilgisini kaydet
        const saleStmt = this.db!.prepare(`
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
        const itemStmt = this.db!.prepare(`
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
    this.ensureConnection();
    if (!this.db) {
      return [];
    }
    try {
      const salesStmt = this.db!.prepare(`
        SELECT * FROM sales 
        ORDER BY created_at DESC
      `);
      const sales = salesStmt.all() as any[];

      const itemsStmt = this.db!.prepare(`
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
    this.ensureConnection();
    if (!this.db) {
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
    try {
      const today = new Date().toISOString().split('T')[0];
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Bugünkü satışlar
      const todayStmt = this.db!.prepare(`
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
      const weeklyStmt = this.db!.prepare(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as total_amount
        FROM sales 
        WHERE date >= ?
      `);
      const weeklySales = weeklyStmt.get(oneWeekAgo) as any;

      // Aylık satışlar
      const monthlyStmt = this.db!.prepare(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as total_amount
        FROM sales 
        WHERE date >= ?
      `);
      const monthlySales = monthlyStmt.get(oneMonthAgo) as any;

      // En çok satılan ürünler
      const topProductsStmt = this.db!.prepare(`
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
      const topCategoriesStmt = this.db!.prepare(`
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
      const hourlyStatsStmt = this.db!.prepare(`
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
      const paymentStatsStmt = this.db!.prepare(`
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

  // Masa aktarım fonksiyonu
  transferTableOrder(sourceTable: number, targetTable: number): boolean {
    this.ensureConnection();
    if (!this.db) {
      console.error('❌ Masa aktarım hatası: Veritabanı bağlantısı yok');
      return false;
    }
    try {
      console.log(`🔄 Masa ${sourceTable} -> Masa ${targetTable} aktarımı başlıyor...`);
      
      // Transaction kullanarak güvenli aktarım
      const transaction = this.db.transaction(() => {
        // Kaynak masadan siparişi al
        const getSourceStmt = this.db!.prepare('SELECT * FROM table_orders WHERE table_number = ? AND is_active = 1');
        const sourceOrder = getSourceStmt.get(sourceTable) as any;
        
        if (!sourceOrder) {
          console.error(`❌ Masa ${sourceTable} için aktif sipariş bulunamadı`);
          return false;
        }

        // Kaynak masanın sipariş detaylarını al
        const getSourceItemsStmt = this.db!.prepare('SELECT * FROM table_order_items WHERE table_order_id = ?');
        const sourceItems = getSourceItemsStmt.all(sourceOrder.id) as any[];
        
        if (!sourceItems || sourceItems.length === 0) {
          console.error(`❌ Masa ${sourceTable} için sipariş detayları bulunamadı`);
          return false;
        }

        // Hedef masanın boş olduğunu kontrol et
        const getTargetStmt = this.db!.prepare('SELECT * FROM table_orders WHERE table_number = ? AND is_active = 1');
        const targetOrder = getTargetStmt.get(targetTable);
        
        if (targetOrder) {
          console.error(`❌ Masa ${targetTable} zaten dolu`);
          return false;
        }

        // Kaynak masayı kapat
        const closeSourceStmt = this.db!.prepare('UPDATE table_orders SET is_active = 0 WHERE table_number = ? AND is_active = 1');
        const closeResult = closeSourceStmt.run(sourceTable);
        console.log(`🗑️ Masa ${sourceTable} kapatıldı:`, closeResult.changes, 'satır');

        // Hedef masaya siparişi aktar
        const insertTargetStmt = this.db!.prepare(`
          INSERT INTO table_orders (table_number, total_amount, start_time, is_active) 
          VALUES (?, ?, ?, 1)
        `);
        const insertResult = insertTargetStmt.run(
          targetTable, 
          sourceOrder.total_amount, 
          sourceOrder.start_time
        );
        console.log(`✅ Masa ${targetTable} aktarımı tamamlandı:`, insertResult.changes, 'satır');

        // Hedef masanın sipariş detaylarını aktar
        const targetOrderId = insertResult.lastInsertRowid;
        for (const item of sourceItems) {
          const insertItemStmt = this.db!.prepare(`
            INSERT INTO table_order_items (table_order_id, product_id, product_name, quantity, unit_price, total_price, category)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          const itemResult = insertItemStmt.run(
            targetOrderId,
            item.product_id,
            item.product_name,
            item.quantity,
            item.unit_price,
            item.total_price,
            item.category
          );
          console.log(`📦 Ürün aktarımı: ${item.product_name} x${item.quantity}`);
        }

        return true;
      });
      
      const result = transaction();
      console.log('✅ Masa aktarımı başarıyla tamamlandı, sonuç:', result);
      return result;
    } catch (error) {
      console.error('❌ Masa aktarım hatası:', error);
      return false;
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