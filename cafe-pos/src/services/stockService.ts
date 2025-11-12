// Stok yönetimi servisi
type StockSnapshot = {
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  updatedAt: string;
};

class StockService {
  private static instance: StockService;
  private stockCache: Map<string, StockSnapshot> = new Map();

  private constructor() {}

  static getInstance(): StockService {
    if (!StockService.instance) {
      StockService.instance = new StockService();
    }
    return StockService.instance;
  }

  private get api() {
    return (window as any)?.electronAPI?.database;
  }

  private normalizeQuantity(value: any): number {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 0;
    }
    const intValue = Math.floor(Number(value));
    return intValue < 0 ? 0 : intValue;
  }

  private normalizeSnapshot(record: any): StockSnapshot {
    const quantity = this.normalizeQuantity(record?.quantity ?? record?.Quantity);
    const minQuantity = this.normalizeQuantity(record?.minQuantity ?? record?.min_quantity);
    const rawMax = record?.maxQuantity ?? record?.max_quantity;
    const fallbackMax = quantity > 0 ? Math.max(quantity, Math.floor(quantity * 1.5)) : Math.max(minQuantity, minQuantity + 100);
    const maxQuantity = this.normalizeQuantity(rawMax !== undefined ? Math.max(rawMax, minQuantity) : fallbackMax);

    return {
      quantity,
      minQuantity,
      maxQuantity,
      updatedAt: record?.updatedAt || record?.updated_at || new Date().toISOString()
    };
  }

  private ensureStock(productId: string, initialQuantity?: number): StockSnapshot {
    if (!this.stockCache.has(productId)) {
      const api = this.api;
      let snapshot: StockSnapshot | null = null;

      if (api?.getStockLevelSync) {
        try {
          const record = api.getStockLevelSync(productId);
          if (record && typeof record.quantity === 'number') {
            snapshot = this.normalizeSnapshot(record);
          }
        } catch (error) {
          console.error('Stok bilgisi alınırken hata:', error);
        }
      }

      if (!snapshot) {
        const seed = this.normalizeQuantity(
          initialQuantity !== undefined ? initialQuantity : Math.floor(Math.random() * 200) + 50
        );

        if (api?.initializeStockLevelSync) {
          try {
            const record = api.initializeStockLevelSync(productId, seed);
            if (record && typeof record.quantity === 'number') {
              snapshot = this.normalizeSnapshot(record);
            }
          } catch (error) {
            console.error('Stok kaydı başlatılırken hata:', error);
          }
        }

        if (!snapshot) {
          snapshot = this.normalizeSnapshot({
            quantity: seed,
            minQuantity: Math.max(0, Math.floor(seed * 0.2)),
            maxQuantity: seed > 0 ? Math.max(seed, Math.floor(seed * 1.5)) : 100,
            updatedAt: new Date().toISOString()
          });
        }
      }

      this.stockCache.set(productId, snapshot);
    }

    return this.stockCache.get(productId)!;
  }

  private updateCache(productId: string, snapshot: StockSnapshot): void {
    this.stockCache.set(productId, snapshot);
  }

  // Ürün stok bilgisini al
  getProductStock(productId: string): number {
    return this.ensureStock(productId).quantity;
  }

  // Ürün stok bilgisini güncelle
  updateProductStock(productId: string, newAmount: number, options?: { minQuantity?: number; maxQuantity?: number }): void {
    const safeAmount = this.normalizeQuantity(newAmount);
    const api = this.api;
    let updated: StockSnapshot | null = null;

    if (api?.setStockLevelSync) {
      try {
        const record = api.setStockLevelSync(productId, safeAmount, options);
        if (record && typeof record.quantity === 'number') {
          updated = this.normalizeSnapshot(record);
        }
      } catch (error) {
        console.error('Stok kaydedilirken hata:', error);
      }
    }

    if (!updated) {
      const current = this.ensureStock(productId);
      updated = this.normalizeSnapshot({
        quantity: safeAmount,
        minQuantity: options?.minQuantity ?? current.minQuantity,
        maxQuantity: options?.maxQuantity ?? current.maxQuantity,
        updatedAt: new Date().toISOString()
      });
    }

    this.updateCache(productId, updated);
  }

  // Stoktan düş (satış)
  decreaseStock(productId: string, amount: number = 1): boolean {
    const safeAmount = this.normalizeQuantity(amount);
    const current = this.ensureStock(productId);

    if (current.quantity < safeAmount) {
      return false;
    }

    const api = this.api;
    let updated: StockSnapshot | null = null;

    if (api?.adjustStockLevelSync) {
      try {
        const record = api.adjustStockLevelSync(productId, -safeAmount);
        if (record && typeof record.quantity === 'number') {
          updated = this.normalizeSnapshot(record);
        }
      } catch (error) {
        console.error('Stok azaltılırken hata:', error);
      }
    }

    if (!updated) {
      updated = this.normalizeSnapshot({
        quantity: current.quantity - safeAmount,
        minQuantity: current.minQuantity,
        maxQuantity: current.maxQuantity,
        updatedAt: new Date().toISOString()
      });
    }

    this.updateCache(productId, updated);
    return true;
  }

  // Stok ekle
  increaseStock(productId: string, amount: number = 1): void {
    const safeAmount = this.normalizeQuantity(amount);
    const current = this.ensureStock(productId);
    const api = this.api;
    let updated: StockSnapshot | null = null;

    if (api?.adjustStockLevelSync) {
      try {
        const record = api.adjustStockLevelSync(productId, safeAmount);
        if (record && typeof record.quantity === 'number') {
          updated = this.normalizeSnapshot(record);
        }
      } catch (error) {
        console.error('Stok artırılırken hata:', error);
      }
    }

    if (!updated) {
      updated = this.normalizeSnapshot({
        quantity: current.quantity + safeAmount,
        minQuantity: current.minQuantity,
        maxQuantity: current.maxQuantity,
        updatedAt: new Date().toISOString()
      });
    }

    this.updateCache(productId, updated);
  }

  // Stok kontrolü yap
  checkStockAvailability(productId: string, requestedAmount: number = 1): boolean {
    const safeRequested = this.normalizeQuantity(requestedAmount);
    const current = this.ensureStock(productId);
    return current.quantity >= safeRequested;
  }

  // Ürün için stok oluştur (ilk kez)
  initializeProductStock(productId: string, initialAmount?: number): void {
    const snapshot = this.ensureStock(productId, initialAmount);
    this.updateCache(productId, snapshot);
  }

  // Tüm ürünler için stok başlat
  initializeAllProductsStock(products: Array<{ id: string }>): void {
    products.forEach(product => {
      this.initializeProductStock(product.id);
    });
  }

  // Stok durumunu al
  getStockStatus(productId: string): {
    current: number;
    min: number;
    max: number;
    status: 'critical' | 'low' | 'normal';
  } {
    const snapshot = this.ensureStock(productId);
    const current = snapshot.quantity;
    const min = snapshot.minQuantity;
    const max = snapshot.maxQuantity || Math.max(min, min + 100);

    let status: 'critical' | 'low' | 'normal';
    if (current <= min) status = 'critical';
    else if (current <= Math.max(min * 1.5, min + 10)) status = 'low';
    else status = 'normal';

    return { current, min, max, status };
  }

  // Düşük stoklu ürünleri al
  getLowStockProducts(products: any[]): any[] {
    return products.filter(product => {
      const status = this.getStockStatus(product.id);
      return status.status === 'critical' || status.status === 'low';
    });
  }

  // Stok raporu oluştur
  generateStockReport(products: any[]): {
    totalProducts: number;
    normalStock: number;
    lowStock: number;
    criticalStock: number;
    totalValue: number;
  } {
    let normalStock = 0;
    let lowStock = 0;
    let criticalStock = 0;
    let totalValue = 0;

    products.forEach(product => {
      const status = this.getStockStatus(product.id);
      const stockValue = status.current * (product.price || 0);

      if (status.status === 'normal') normalStock++;
      else if (status.status === 'low') lowStock++;
      else if (status.status === 'critical') criticalStock++;

      totalValue += stockValue;
    });

    return {
      totalProducts: products.length,
      normalStock,
      lowStock,
      criticalStock,
      totalValue
    };
  }
}

export const stockService = StockService.getInstance();
export default stockService;