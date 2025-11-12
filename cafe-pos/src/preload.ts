// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// API'leri renderer process'e expose et
contextBridge.exposeInMainWorld('electronAPI', {
  // Yazıcı API'leri
  printReceipt: (receiptData: any) => ipcRenderer.invoke('print-receipt', receiptData),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  
  // Pencere kontrolleri
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  
  // Auto-updater API'leri
  updater: {
    init: () => ipcRenderer.invoke('updater-init'),
    check: () => ipcRenderer.invoke('updater-check'),
    download: () => ipcRenderer.invoke('updater-download'),
    install: () => ipcRenderer.invoke('updater-install')
  },
  
  // Database API'leri
  database: {
    // Kategori işlemleri
    getCategories: () => ipcRenderer.invoke('db-get-categories'),
    addCategory: (category: any) => ipcRenderer.invoke('db-add-category', category),
    updateCategory: (id: string, updates: any) => ipcRenderer.invoke('db-update-category', id, updates),
    deleteCategory: (id: string) => ipcRenderer.invoke('db-delete-category', id),
    
    // Ürün işlemleri
    getProducts: () => ipcRenderer.invoke('db-get-products'),
    getProductsByCategory: (categoryId: string) => ipcRenderer.invoke('db-get-products-by-category', categoryId),
    getProductById: (id: string) => ipcRenderer.invoke('db-get-product-by-id', id),
    addProduct: (product: any) => ipcRenderer.invoke('db-add-product', product),
    updateProduct: (id: string, updates: any) => ipcRenderer.invoke('db-update-product', id, updates),
    deleteProduct: (id: string) => ipcRenderer.invoke('db-delete-product', id),
    
    // Ayar işlemleri
    getSetting: (key: string) => ipcRenderer.invoke('db-get-setting', key),
    setSetting: (key: string, value: string) => ipcRenderer.invoke('db-set-setting', key, value),
    savePassword: (password: string) => ipcRenderer.invoke('db-save-password', password),
    loadPassword: () => ipcRenderer.invoke('db-load-password'),
    
    // Toplu işlemler
    saveCategories: (categories: any[]) => ipcRenderer.invoke('db-save-categories', categories),
    saveProducts: (products: any[]) => ipcRenderer.invoke('db-save-products', products),
    clearAllData: () => ipcRenderer.invoke('db-clear-all-data'),
    getDatabasePath: () => ipcRenderer.invoke('db-get-database-path'),
    
    // Satış işlemleri
    saveSale: (sale: any) => ipcRenderer.invoke('db-save-sale', sale),
    getAllSales: () => ipcRenderer.invoke('db-get-all-sales'),
    getDashboardStats: () => ipcRenderer.invoke('db-get-dashboard-stats'),
    
    // Masa siparişleri işlemleri
    getActiveTableOrders: () => ipcRenderer.invoke('db-get-active-table-orders'),
    saveTableOrder: (tableNumber: number, items: any[], total: number) => ipcRenderer.invoke('db-save-table-order', tableNumber, items, total),
    addToTableOrder: (tableNumber: number, items: any[], total: number) => ipcRenderer.invoke('db-add-to-table-order', tableNumber, items, total),
    closeTableOrder: (tableNumber: number) => ipcRenderer.invoke('db-close-table-order', tableNumber),

    // Müşteri işlemleri
    getCustomers: () => ipcRenderer.invoke('db-get-customers'),
    addCustomer: (name: string, phone?: string) => ipcRenderer.invoke('db-add-customer', name, phone),
    deleteAllCustomers: () => ipcRenderer.invoke('db-delete-all-customers'),
    addCustomerOrder: (customerId: number, items: any[], totalAmount: number, paymentMethod?: string) => 
      ipcRenderer.invoke('db-add-customer-order', customerId, items, totalAmount, paymentMethod),
    getCustomerOrders: (customerId: number) => ipcRenderer.invoke('db-get-customer-orders', customerId),
    getCustomerTotalDebt: (customerId: number) => ipcRenderer.invoke('db-get-customer-total-debt', customerId),
    transferTableOrder: (sourceTable: number, targetTable: number) => ipcRenderer.invoke('db-transfer-table-order', sourceTable, targetTable)
  }
});

// IPC event listener'ları expose et
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on: (channel: string, callback: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});

// TypeScript için global tanım
declare global {
  interface Window {
    electronAPI: {
      printReceipt: (receiptData: any) => Promise<boolean>;
      getPrinters: () => Promise<any[]>;
      toggleFullscreen: () => Promise<void>;
      isFullscreen: () => Promise<boolean>;
      updater: {
        init: () => Promise<{ success: boolean }>;
        check: () => Promise<{ success: boolean }>;
        download: () => Promise<{ success: boolean }>;
        install: () => Promise<{ success: boolean }>;
      };
    };
    electron: {
      ipcRenderer: {
        on: (channel: string, callback: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}
