// Stok yönetimi servisi
class StockService {
  private static instance: StockService;
  
  private constructor() {}

  static getInstance(): StockService {
    if (!StockService.instance) {
      StockService.instance = new StockService();
    }
    return StockService.instance;
  }

  // Ürün stok bilgisini al
  getProductStock(productId: string): number {
    const stock = localStorage.getItem(`stock_${productId}`);
    return stock ? parseInt(stock) : 0;
  }

  // Ürün stok bilgisini güncelle
  updateProductStock(productId: string, newAmount: number): void {
    localStorage.setItem(`stock_${productId}`, Math.max(0, newAmount).toString());
  }

  // Stoktan düş (satış)
  decreaseStock(productId: string, amount: number = 1): boolean {
    const currentStock = this.getProductStock(productId);
    if (currentStock >= amount) {
      this.updateProductStock(productId, currentStock - amount);
      return true;
    }
    return false; // Yetersiz stok
  }

  // Stok ekle
  increaseStock(productId: string, amount: number = 1): void {
    const currentStock = this.getProductStock(productId);
    this.updateProductStock(productId, currentStock + amount);
  }

  // Stok kontrolü yap
  checkStockAvailability(productId: string, requestedAmount: number = 1): boolean {
    const currentStock = this.getProductStock(productId);
    return currentStock >= requestedAmount;
  }

  // Ürün için stok oluştur (ilk kez)
  initializeProductStock(productId: string, initialAmount?: number): void {
    const existingStock = localStorage.getItem(`stock_${productId}`);
    if (!existingStock) {
      const amount = initialAmount || Math.floor(Math.random() * 200) + 50;
      this.updateProductStock(productId, amount);
    }
  }

  // Tüm ürünler için stok başlat
  initializeAllProductsStock(products: any[]): void {
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
    const current = this.getProductStock(productId);
    const min = Math.floor(current * 0.2);
    const max = Math.floor(current * 1.5);
    
    let status: 'critical' | 'low' | 'normal';
    if (current <= min) status = 'critical';
    else if (current <= min * 1.5) status = 'low';
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
