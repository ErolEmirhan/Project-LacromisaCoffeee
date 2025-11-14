import { getDatabase } from './database';
import { Category, Product } from '../types';

// Varsayılan kategoriler
const defaultCategories: Category[] = [
  { id: 'hot-drinks', name: 'Sıcak İçecekler', icon: '☕' },
  { id: 'cold-drinks', name: 'Soğuk İçecekler', icon: '🥤' },
  { id: 'desserts', name: 'Tatlılar', icon: '🍰' },
  { id: 'snacks', name: 'Atıştırmalıklar', icon: '🥨' },
  { id: 'breakfast', name: 'Kahvaltı', icon: '🍳' }
];

// Varsayılan ürünler
const defaultProducts: Product[] = [
  // Sıcak İçecekler (20 ürün)
  { id: 'p1', name: 'Türk Kahvesi', price: 25, category: 'hot-drinks' },
  { id: 'p2', name: 'Espresso', price: 20, category: 'hot-drinks' },
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
  { id: 'p42', name: 'Tiramisu', price: 48, category: 'desserts' },
  { id: 'p43', name: 'Profiterol', price: 42, category: 'desserts' },
  { id: 'p44', name: 'Ekler', price: 35, category: 'desserts' },
  { id: 'p45', name: 'San Sebastian', price: 50, category: 'desserts' },
  { id: 'p46', name: 'Brownie', price: 38, category: 'desserts' },
  { id: 'p47', name: 'Cookies', price: 25, category: 'desserts' },
  { id: 'p48', name: 'Muffin', price: 28, category: 'desserts' },
  { id: 'p49', name: 'Donuts', price: 22, category: 'desserts' },
  { id: 'p50', name: 'Macarons', price: 55, category: 'desserts' },
  { id: 'p51', name: 'Magnolia', price: 40, category: 'desserts' },
  { id: 'p52', name: 'Supangle', price: 32, category: 'desserts' },
  { id: 'p53', name: 'Sütlaç', price: 28, category: 'desserts' },
  { id: 'p54', name: 'Kazandibi', price: 30, category: 'desserts' },
  { id: 'p55', name: 'Muhallebi', price: 25, category: 'desserts' },
  { id: 'p56', name: 'Fırında Sütlaç', price: 32, category: 'desserts' },
  { id: 'p57', name: 'Waffle', price: 35, category: 'desserts' },
  { id: 'p58', name: 'Pancake', price: 32, category: 'desserts' },
  { id: 'p59', name: 'Crêpe', price: 30, category: 'desserts' },
  { id: 'p60', name: 'Dondurma', price: 20, category: 'desserts' },
  
  // Atıştırmalıklar (20 ürün)
  { id: 'p61', name: 'Kurabiye', price: 15, category: 'snacks' },
  { id: 'p62', name: 'Kraker', price: 12, category: 'snacks' },
  { id: 'p63', name: 'Çikolata', price: 18, category: 'snacks' },
  { id: 'p64', name: 'Gofret', price: 10, category: 'snacks' },
  { id: 'p65', name: 'Cips', price: 15, category: 'snacks' },
  { id: 'p66', name: 'Fındık', price: 25, category: 'snacks' },
  { id: 'p67', name: 'Fıstık', price: 30, category: 'snacks' },
  { id: 'p68', name: 'Kuru Üzüm', price: 20, category: 'snacks' },
  { id: 'p69', name: 'Kuruyemiş Karışık', price: 35, category: 'snacks' },
  { id: 'p70', name: 'Çekirdek', price: 12, category: 'snacks' },
  { id: 'p71', name: 'Popcorn', price: 18, category: 'snacks' },
  { id: 'p72', name: 'Pretzel', price: 16, category: 'snacks' },
  { id: 'p73', name: 'Sandviç', price: 25, category: 'snacks' },
  { id: 'p74', name: 'Toast', price: 20, category: 'snacks' },
  { id: 'p75', name: 'Kruvasan', price: 18, category: 'snacks' },
  { id: 'p76', name: 'Börek', price: 22, category: 'snacks' },
  { id: 'p77', name: 'Simit', price: 8, category: 'snacks' },
  { id: 'p78', name: 'Bagel', price: 15, category: 'snacks' },
  { id: 'p79', name: 'Açma', price: 12, category: 'snacks' },
  { id: 'p80', name: 'Poğaça', price: 14, category: 'snacks' },
  
  // Kahvaltı (20 ürün)
  { id: 'p81', name: 'Sucuklu Yumurta', price: 35, category: 'breakfast' },
  { id: 'p82', name: 'Sahanda Yumurta', price: 25, category: 'breakfast' },
  { id: 'p83', name: 'Omlet', price: 28, category: 'breakfast' },
  { id: 'p84', name: 'Menemen', price: 30, category: 'breakfast' },
  { id: 'p85', name: 'Çılbır', price: 32, category: 'breakfast' },
  { id: 'p86', name: 'Serpme Kahvaltı', price: 85, category: 'breakfast' },
  { id: 'p87', name: 'Kahvaltı Tabağı', price: 45, category: 'breakfast' },
  { id: 'p88', name: 'Tereyağı', price: 12, category: 'breakfast' },
  { id: 'p89', name: 'Peynir', price: 20, category: 'breakfast' },
  { id: 'p90', name: 'Zeytin', price: 15, category: 'breakfast' },
  { id: 'p91', name: 'Domates', price: 8, category: 'breakfast' },
  { id: 'p92', name: 'Salatalık', price: 8, category: 'breakfast' },
  { id: 'p93', name: 'Yeşil Biber', price: 6, category: 'breakfast' },
  { id: 'p94', name: 'Salam', price: 25, category: 'breakfast' },
  { id: 'p95', name: 'Sucuk', price: 30, category: 'breakfast' },
  { id: 'p96', name: 'Kavurma', price: 45, category: 'breakfast' },
  { id: 'p97', name: 'Tahin-Pekmez', price: 18, category: 'breakfast' },
  { id: 'p98', name: 'Yoğurt', price: 15, category: 'breakfast' },
  { id: 'p99', name: 'Bal', price: 18, category: 'breakfast' },
  { id: 'p100', name: 'Reçel', price: 16, category: 'breakfast' }
];

// Varsayılan şifre
const DEFAULT_PASSWORD = '1234';

export const setupDatabase = async (): Promise<void> => {
  try {
    const db = getDatabase();
    
    // Mevcut veri kontrolü
    const existingCategories = db.getCategories();
    const existingProducts = db.getProducts();
    const existingPassword = db.loadPassword();
    
    // Kategoriler varsa kurulum yapmayalım
    if (existingCategories.length > 0) {
      console.log('✅ Veritabanında zaten veri var, kurulum atlanıyor.');
      return;
    }
    
    console.log('🔧 İlk kurulum başlatılıyor...');
    
    // Kategorileri ekle
    const categoriesSuccess = db.saveCategories(defaultCategories);
    if (categoriesSuccess) {
      console.log('✅ Kategoriler eklendi:', defaultCategories.length);
    } else {
      throw new Error('Kategoriler eklenemedi');
    }
    
    // Ürünleri ekle
    const productsSuccess = db.saveProducts(defaultProducts);
    if (productsSuccess) {
      console.log('✅ Ürünler eklendi:', defaultProducts.length);
    } else {
      throw new Error('Ürünler eklenemedi');
    }
    
    // Varsayılan şifreyi ekle (eğer yoksa)
    if (!existingPassword) {
      const passwordSuccess = db.savePassword(DEFAULT_PASSWORD);
      if (passwordSuccess) {
        console.log('✅ Varsayılan şifre ayarlandı:', DEFAULT_PASSWORD);
      } else {
        throw new Error('Şifre ayarlanamadı');
      }
    }
    
    console.log('🎉 Veritabanı kurulumu başarıyla tamamlandı!');
    console.log(`📊 ${defaultCategories.length} kategori, ${defaultProducts.length} ürün hazır.`);
    
  } catch (error) {
    console.error('❌ Veritabanı kurulum hatası:', error);
    throw error;
  }
};

export { defaultCategories, defaultProducts }; 