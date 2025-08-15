const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// HTTP sunucusu oluştur
const httpServer = createServer((req, res) => {
  // Telefon erişimi için HTML sayfasını sun
  if (req.url === '/' || req.url === '/index.html') {
    // public/index.html dosyasını oku ve sun
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    try {
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } else {
        // Eğer dosya yoksa basit bir HTML döndür
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Cafe POS - Mobil</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>Cafe POS - Mobil Arayüz</h1>
    <p>WebSocket bağlantısı kuruluyor...</p>
    <div id="tables"></div>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        socket.on('connect', () => {
            console.log('WebSocket bağlantısı kuruldu');
            document.body.innerHTML += '<p>✅ Bağlantı kuruldu!</p>';
            socket.emit('client_ready', { clientType: 'mobile' });
        });
        
        socket.on('current_table_orders', (orders) => {
            console.log('Masa siparişleri alındı:', orders);
            const tablesDiv = document.getElementById('tables');
            tablesDiv.innerHTML = '<h2>Aktif Masalar</h2>';
            
            Object.keys(orders).forEach(tableNumber => {
                const order = orders[tableNumber];
                tablesDiv.innerHTML += \`
                    <div style="border: 1px solid #ccc; margin: 10px; padding: 10px;">
                        <h3>Masa \${tableNumber}</h3>
                        <p>Toplam: \${order.total} TL</p>
                        <p>Ürün Sayısı: \${order.itemsCount}</p>
                    </div>
                \`;
            });
        });
    </script>
</body>
</html>
        `);
      }
    } catch (error) {
      res.writeHead(500);
      res.end('Sunucu hatası');
    }
    return;
  }
  
  // Diğer istekler için 404
  res.writeHead(404);
  res.end('Sayfa bulunamadı');
});

// Socket.IO sunucusu oluştur
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Bağlı client'ları takip et
const connectedClients = new Map();
const tableOrders = new Map();
const products = new Map();
const categories = new Map();

console.log('🚀 WebSocket sunucusu başlatılıyor...');

// PC'deki veritabanından ürünleri yükle
async function loadProductsFromDatabase() {
  try {
    console.log('🛍️ Veritabanından ürünler yükleniyor...');
    
    const productsData = await getProductsFromPC();
    const categoriesData = await getCategoriesFromPC();
    
    // Products ve categories Map'lerini güncelle
    products.clear();
    categories.clear();
    
    if (categoriesData && Array.isArray(categoriesData)) {
      categoriesData.forEach(category => {
        categories.set(category.id, category);
      });
    }
    
    if (productsData && Array.isArray(productsData)) {
      productsData.forEach(product => {
        products.set(product.id, product);
      });
    }
    
    console.log('✅ Ürünler yüklendi:', products.size, 'ürün,', categories.size, 'kategori');
    
    return { products: Array.from(products.values()), categories: Array.from(categories.values()) };
  } catch (error) {
    console.error('❌ Ürünler yüklenirken hata:', error);
    return { products: [], categories: [] };
  }
}

// PC'deki veritabanından masa siparişlerini yükle
async function loadTableOrdersFromDatabase() {
  try {
    console.log('🔄 Veritabanından masa siparişleri yükleniyor...');
    
    const activeOrders = await getActiveTableOrdersFromPC();
    
    console.log('✅ Veritabanından yüklenen siparişler:', Object.keys(activeOrders).length, 'masa');
    
    // tableOrders Map'ini temizle ve yeni verilerle doldur
    tableOrders.clear();
    
    if (activeOrders && typeof activeOrders === 'object') {
      Object.entries(activeOrders).forEach(([tableNumber, orderData]) => {
        if (orderData && orderData.tableNumber) {
          tableOrders.set(parseInt(tableNumber), orderData);
        }
      });
    }
    
    console.log('✅ tableOrders güncellendi:', Array.from(tableOrders.entries()).length, 'masa');
    
    return Array.from(tableOrders.entries());
  } catch (error) {
    console.error('❌ Veritabanından masa siparişleri yüklenirken hata:', error);
    return [];
  }
}

// PC'deki veritabanından aktif masa siparişlerini al
async function getActiveTableOrdersFromPC() {
  try {
    console.log('🔄 PC veritabanından aktif masa siparişleri alınıyor...');
    
    const os = require('os');
    const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'cafe-pos', 'database', 'cafe-data.db');
    console.log('📁 Veritabanı yolu:', userDataPath);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(userDataPath)) {
      console.log('❌ Veritabanı dosyası bulunamadı:', userDataPath);
      return {};
    }
    
    return new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(userDataPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error('❌ Veritabanı bağlantı hatası:', err.message);
          resolve({});
          return;
        }
        
        console.log('✅ Veritabanına bağlanıldı');
        
        // Masa siparişlerini ve detaylarını al
        const query = `
          SELECT 
            t.table_number,
            t.is_active,
            t.start_time,
            t.total_amount,
            t.created_at,
            ti.product_name,
            ti.quantity,
            ti.unit_price,
            ti.total_price,
            ti.category
          FROM table_orders t
          LEFT JOIN table_order_items ti ON t.id = ti.table_order_id
          WHERE t.is_active = 1
          ORDER BY t.table_number, ti.id
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            console.error('❌ Sorgu hatası:', err.message);
            db.close();
            resolve({});
            return;
          }
          
          console.log('📋 Veritabanından alınan satırlar:', rows.length, 'adet');
          
          // Sonuçları grupla ve formatla
          const activeOrders = {};
          rows.forEach(row => {
            const tableNumber = row.table_number;
            
            if (!activeOrders[tableNumber]) {
              activeOrders[tableNumber] = {
                tableNumber: tableNumber,
                isActive: row.is_active === 1,
                startTime: row.start_time,
                total: row.total_amount || 0,
                items: [],
                createdAt: row.created_at,
                lastUpdated: new Date().toISOString()
              };
            }
            
            // Ürün bilgisi varsa ekle
            if (row.product_name) {
              activeOrders[tableNumber].items.push({
                product_name: row.product_name,
                quantity: row.quantity,
                unit_price: row.unit_price,
                total_price: row.total_price,
                category: row.category
              });
            }
          });
          
          // itemsCount hesapla
          Object.keys(activeOrders).forEach(tableNumber => {
            activeOrders[tableNumber].itemsCount = activeOrders[tableNumber].items.length;
          });
          
          console.log('✅ Formatlanan siparişler:', Object.keys(activeOrders).length, 'masa');
          
          db.close();
          resolve(activeOrders);
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Veritabanı okuma hatası:', error);
    return {};
  }
}

// PC'deki veritabanından kategorileri al
async function getCategoriesFromPC() {
  try {
    const os = require('os');
    const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'cafe-pos', 'database', 'cafe-data.db');
    
    if (!fs.existsSync(userDataPath)) {
      console.log('❌ Veritabanı dosyası bulunamadı');
      return [];
    }
    
    return new Promise((resolve) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(userDataPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error('❌ Kategori veritabanı bağlantı hatası:', err.message);
          resolve([]);
          return;
        }
        
        const query = `SELECT * FROM categories ORDER BY name`;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            console.error('❌ Kategori sorgu hatası:', err.message);
            db.close();
            resolve([]);
            return;
          }
          
          console.log('📂 Kategoriler yüklendi:', rows.length, 'adet');
          db.close();
          resolve(rows);
        });
      });
    });
  } catch (error) {
    console.error('❌ Kategori okuma hatası:', error);
    return [];
  }
}

// PC'deki veritabanından ürünleri al
async function getProductsFromPC() {
  try {
    const os = require('os');
    const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'cafe-pos', 'database', 'cafe-data.db');
    
    if (!fs.existsSync(userDataPath)) {
      console.log('❌ Veritabanı dosyası bulunamadı');
      return [];
    }
    
    return new Promise((resolve) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(userDataPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error('❌ Ürün veritabanı bağlantı hatası:', err.message);
          resolve([]);
          return;
        }
        
        const query = `SELECT * FROM products ORDER BY category, name`;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            console.error('❌ Ürün sorgu hatası:', err.message);
            db.close();
            resolve([]);
            return;
          }
          
          console.log('🛍️ Ürünler yüklendi:', rows.length, 'adet');
          db.close();
          resolve(rows);
        });
      });
    });
  } catch (error) {
    console.error('❌ Ürün okuma hatası:', error);
    return [];
  }
}

// PC veritabanına sipariş kaydet
async function saveOrderToPC(tableNumber, items, total) {
  try {
    const os = require('os');
    const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'cafe-pos', 'database', 'cafe-data.db');
    
    if (!fs.existsSync(userDataPath)) {
      throw new Error('Veritabanı dosyası bulunamadı');
    }
    
    return new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(userDataPath, (err) => {
        if (err) {
          reject(new Error('Veritabanı bağlantı hatası: ' + err.message));
          return;
        }
        
        // Transaction başlat
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          // Önce mevcut siparişi kontrol et
          db.get(
            'SELECT id FROM table_orders WHERE table_number = ? AND is_active = 1',
            [tableNumber],
            function(err, existingOrder) {
              if (err) {
                db.run('ROLLBACK');
                db.close();
                reject(new Error('Sipariş kontrol hatası: ' + err.message));
                return;
              }
              
              let orderId = existingOrder ? existingOrder.id : null;
              
              if (existingOrder) {
                // Mevcut siparişi güncelle
                db.run(
                  'UPDATE table_orders SET total_amount = ? WHERE id = ?',
                  [total, orderId],
                  function(err) {
                    if (err) {
                      db.run('ROLLBACK');
                      db.close();
                      reject(new Error('Sipariş güncelleme hatası: ' + err.message));
                      return;
                    }
                    
                    // Mevcut ürünleri sil
                    db.run(
                      'DELETE FROM table_order_items WHERE table_order_id = ?',
                      [orderId],
                      function(err) {
                        if (err) {
                          db.run('ROLLBACK');
                          db.close();
                          reject(new Error('Ürün silme hatası: ' + err.message));
                          return;
                        }
                        
                        // Yeni ürünleri ekle
                        insertOrderItems(db, orderId, items, resolve, reject);
                      }
                    );
                  }
                );
              } else {
                // Yeni sipariş oluştur
                db.run(
                  'INSERT INTO table_orders (table_number, total_amount, is_active) VALUES (?, ?, 1)',
                  [tableNumber, total],
                  function(err) {
                    if (err) {
                      db.run('ROLLBACK');
                      db.close();
                      reject(new Error('Yeni sipariş oluşturma hatası: ' + err.message));
                      return;
                    }
                    
                    orderId = this.lastID;
                    
                    // Ürünleri ekle
                    insertOrderItems(db, orderId, items, resolve, reject);
                  }
                );
              }
            }
          );
        });
      });
    });
  } catch (error) {
    throw new Error('Sipariş kaydetme hatası: ' + error.message);
  }
}

// Sipariş ürünlerini ekle
function insertOrderItems(db, orderId, items, resolve, reject) {
  let insertedCount = 0;
  const totalItems = items.length;
  
  if (totalItems === 0) {
    db.run('COMMIT');
    db.close();
    resolve({ orderId, insertedItems: 0 });
    return;
  }
  
  items.forEach((item, index) => {
    db.run(
      `INSERT INTO table_order_items 
       (table_order_id, product_id, product_name, quantity, unit_price, total_price, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, item.id || 'unknown', item.product_name || item.name, item.quantity, item.unit_price || item.price, item.total_price || (item.quantity * item.price), item.category],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          db.close();
          reject(new Error('Ürün ekleme hatası: ' + err.message));
          return;
        }
        
        insertedCount++;
        
        if (insertedCount === totalItems) {
          db.run('COMMIT');
          db.close();
          resolve({ orderId, insertedItems: insertedCount });
        }
      }
    );
  });
}

// Socket.IO bağlantı yönetimi
io.on('connection', (socket) => {
  console.log(`✅ Yeni client bağlandı: ${socket.id}`);
  
  // Client'ı kaydet
  connectedClients.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    clientType: 'unknown',
    lastActivity: new Date()
  });

  // Client hazır olduğunda
  socket.on('client_ready', async (data) => {
    console.log(`📱 Client hazır: ${socket.id}, Tip: ${data.clientType}`);
    
    const client = connectedClients.get(socket.id);
    if (client) {
      client.clientType = data.clientType;
      client.lastActivity = new Date();
    }

    // PC'deki veritabanından güncel verileri yükle ve gönder
    await loadTableOrdersFromDatabase();
    await loadProductsFromDatabase();
    
    // Aktif masa siparişlerini gönder
    const currentOrders = {};
    tableOrders.forEach((orderData, tableNumber) => {
      currentOrders[tableNumber] = orderData;
    });
    
    // Ürün ve kategorileri gönder
    const productsData = Array.from(products.values());
    const categoriesData = Array.from(categories.values());
    
    socket.emit('current_table_orders', currentOrders);
    socket.emit('products_data', { products: productsData, categories: categoriesData });
    
    console.log('📤 Client\'a gönderildi:', Object.keys(currentOrders).length, 'masa,', productsData.length, 'ürün,', categoriesData.length, 'kategori');
  });

  // Masa siparişi güncellemesi
  socket.on('update_table_order', (data) => {
    console.log('📝 Masa sipariş güncellemesi alındı:', data);
    
    const { tableNumber, orderData } = data;
    tableOrders.set(tableNumber, orderData);
    
    // Diğer client'lara güncellemeleri yayınla
    socket.broadcast.emit('table_order_updated', { tableNumber, orderData });
  });

  // Yeni masa siparişi oluşturma
  socket.on('create_table_order', (data) => {
    console.log('🆕 Yeni masa siparişi oluşturuluyor:', data);
    
    const { tableNumber, orderData } = data;
    tableOrders.set(tableNumber, orderData);
    
    // Tüm client'lara bildir
    io.emit('table_order_created', { tableNumber, orderData });
  });

  // Masa siparişi kapatma
  socket.on('close_table_order', (data) => {
    console.log('🔒 Masa siparişi kapatılıyor:', data);
    
    const { tableNumber } = data;
    tableOrders.delete(tableNumber);
    
    // Tüm client'lara bildir
    io.emit('table_order_closed', { tableNumber });
  });

  // Masa aktarımı
  socket.on('transfer_table', (data) => {
    console.log('🔄 Masa aktarımı yapılıyor:', data);
    
    const { sourceTable, targetTable } = data;
    
    if (tableOrders.has(sourceTable)) {
      const orderData = tableOrders.get(sourceTable);
      orderData.tableNumber = targetTable;
      
      tableOrders.delete(sourceTable);
      tableOrders.set(targetTable, orderData);
      
      // Tüm client'lara bildir
      io.emit('table_transferred', { sourceTable, targetTable, orderData });
    }
  });

  // Masaya ürün ekleme (mobil cihazdan)
  socket.on('add_to_table', async (data) => {
    console.log('🍽️ Masaya ürün ekleniyor:', data);
    
    const { tableNumber, items, total } = data;
    
    try {
      // PC veritabanına kaydet (IPC benzeri mantık için direkt veritabanına yaz)
      await saveOrderToPC(tableNumber, items, total);
      
      // Local hafızayı güncelle
      const orderData = {
        tableNumber: tableNumber,
        isActive: true,
        startTime: new Date().toISOString(),
        total: total,
        items: items,
        itemsCount: items.length,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      tableOrders.set(tableNumber, orderData);
      
      // Tüm client'lara bildir
      io.emit('table_order_updated', { tableNumber, orderData });
      
      console.log('✅ Masa', tableNumber, 'siparişi güncellendi:', items.length, 'ürün');
    } catch (error) {
      console.error('❌ Masa siparişi kaydetme hatası:', error);
      socket.emit('order_save_error', { tableNumber, error: error.message });
    }
  });

  // Client bağlantısı kesildiğinde
  socket.on('disconnect', () => {
    console.log(`❌ Client bağlantısı kesildi: ${socket.id}`);
    connectedClients.delete(socket.id);
  });

  // Ping-pong için heartbeat
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Düzenli olarak PC veritabanından veri güncelle
setInterval(async () => {
  try {
    await loadTableOrdersFromDatabase();
    
    // Tüm client'lara güncel verileri gönder
    const currentOrders = {};
    tableOrders.forEach((orderData, tableNumber) => {
      currentOrders[tableNumber] = orderData;
    });
    
    io.emit('current_table_orders', currentOrders);
    console.log('🔄 Düzenli güncelleme tamamlandı:', Object.keys(currentOrders).length, 'masa');
  } catch (error) {
    console.error('❌ Düzenli güncelleme hatası:', error);
  }
}, 5000); // Her 5 saniyede bir güncelle

// Sunucuyu başlat
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket sunucusu port ${PORT} üzerinde çalışıyor`);
  console.log(`📱 Telefon erişimi: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔌 WebSocket sunucusu kapatılıyor...');
  httpServer.close(() => {
    console.log('✅ WebSocket sunucusu kapatıldı');
    process.exit(0);
  });
});
