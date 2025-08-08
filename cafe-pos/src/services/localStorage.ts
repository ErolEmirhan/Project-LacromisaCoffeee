import { Category, Product } from '../types';
import { getDatabaseIPC } from './database-ipc';

// localStorage'dan SQLite'a geçiş için wrapper fonksiyonlar
// IPC üzerinden SQLite kullanıyoruz

interface AppData {
  categories: Category[];
  products: Product[];
  password: string;
}

export const loadAppData = async (): Promise<Partial<AppData> | null> => {
  try {
    const db = getDatabaseIPC();
    const categories = await db.getCategories();
    const products = await db.getProducts();
    const password = await db.loadPassword();
    
    return {
      categories: categories.length > 0 ? categories : undefined,
      products: products.length > 0 ? products : undefined,
      password: password || undefined
    };
  } catch (error) {
    console.error('Veritabanı okuma hatası:', error);
    return null;
  }
};

export const saveAppData = async (data: Partial<AppData>): Promise<void> => {
  try {
    const db = getDatabaseIPC();
    
    if (data.categories) {
      await db.saveCategories(data.categories);
    }
    
    if (data.products) {
      await db.saveProducts(data.products);
    }
    
    if (data.password) {
      await db.savePassword(data.password);
    }
  } catch (error) {
    console.error('Veritabanı yazma hatası:', error);
  }
};

export const saveCategories = async (categories: Category[]): Promise<void> => {
  try {
    const db = getDatabaseIPC();
    await db.saveCategories(categories);
  } catch (error) {
    console.error('Kategoriler kaydetme hatası:', error);
  }
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  try {
    const db = getDatabaseIPC();
    await db.saveProducts(products);
  } catch (error) {
    console.error('Ürünler kaydetme hatası:', error);
  }
};

export const savePassword = async (password: string): Promise<void> => {
  try {
    const db = getDatabaseIPC();
    await db.savePassword(password);
  } catch (error) {
    console.error('Şifre kaydetme hatası:', error);
  }
};

export const loadCategories = async (): Promise<Category[] | null> => {
  try {
    const db = getDatabaseIPC();
    const categories = await db.getCategories();
    return categories.length > 0 ? categories : null;
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error);
    return null;
  }
};

export const loadProducts = async (): Promise<Product[] | null> => {
  try {
    const db = getDatabaseIPC();
    const products = await db.getProducts();
    return products.length > 0 ? products : null;
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error);
    return null;
  }
};

export const loadPassword = async (): Promise<string | null> => {
  try {
    const db = getDatabaseIPC();
    return await db.loadPassword();
  } catch (error) {
    console.error('Şifre yüklenirken hata:', error);
    return null;
  }
};

export const clearAppData = async (): Promise<void> => {
  try {
    const db = getDatabaseIPC();
    await db.clearAllData();
  } catch (error) {
    console.error('Veritabanı temizleme hatası:', error);
  }
}; 