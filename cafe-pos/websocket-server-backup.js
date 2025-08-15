const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// HTTP sunucusu oluştur
const httpServer = createServer((req, res) => {
  // Telefon erişimi için HTML sayfasını sun
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Sunucu hatası');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }
  
  // Socket.IO client kütüphanesi için
  if (req.url === '/socket.io/socket.io.js') {
    // CDN'den Socket.IO client kütüphanesini sun
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(`
      // Socket.IO client kütüphanesi (CDN)
      // Bu basit bir implementasyon, gerçek uygulamada CDN kullanın
      (function(){
        var io = function(url, options) {
          this.url = url;
          this.options = options || {};
          this.connected = false;
          this.id = Math.random().toString(36).substr(2, 9);
          
          // Simüle edilmiş bağlantı
          setTimeout(() => {
            this.connected = true;
            if (this.on && this.on.connect) {
              this.on.connect();
            }
          }, 100);
          
          return this;
        };
        
        io.prototype.on = function(event, callback) {
          this['on' + event] = callback;
          return this;
        };
        
        io.prototype.emit = function(event, data) {
          console.log('📤 Event gönderildi:', event, data);
          // Gerçek uygulamada WebSocket üzerinden gönderilir
          return this;
        };
        
        io.prototype.disconnect = function() {
          this.connected = false;
          console.log('🔌 Bağlantı kesildi');
        };
        
        window.io = io;
      })();
    `);
    return;
  }
  
  // Diğer istekler için 404
  res.writeHead(404);
  res.end('Sayfa bulunamadı');
});

// Socket.IO sunucusu oluştur
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Geliştirme için tüm origin'lere izin ver
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Bağlı client'ları takip et
const connectedClients = new Map();
const tableOrders = new Map();

console.log('🚀 WebSocket sunucusu başlatılıyor...');

// PC'deki veritabanından masa siparişlerini yükle
async function loadTableOrdersFromDatabase() {
  try {
    console.log('🔄 Veritabanından masa siparişleri yükleniyor...');
    
    // PC'deki Electron uygulamasından veri almak için
    // Bu fonksiyon PC'deki veritabanına erişecek
    const activeOrders = await getActiveTableOrdersFromPC();
    
    console.log('✅ Veritabanından yüklenen siparişler:', activeOrders);
    
    // tableOrders Map'ini temizle ve yeni verilerle doldur
    tableOrders.clear();
    
    if (activeOrders && typeof activeOrders === 'object') {
      Object.entries(activeOrders).forEach(([tableNumber, orderData]) => {
        if (orderData && orderData.tableNumber) {
          tableOrders.set(parseInt(tableNumber), orderData);
        }
      });
    }
    
    console.log('✅ tableOrders güncellendi:', Array.from(tableOrders.entries()));
    
    return Array.from(tableOrders.entries());
  } catch (error) {
    console.error('❌ Veritabanından masa siparişleri yüklenirken hata:', error);
    return [];
  }
}

// PC'deki veritabanından aktif masa siparişlerini al
async function getActiveTableOrdersFromPC() {
  try {
    // PC'deki Electron uygulamasından veri almak için
    // Bu fonksiyon PC'deki veritabanına erişecek
    console.log('🔄 PC veritabanından aktif masa siparişleri alınıyor...');
    
    // PC'deki SQLite veritabanı dosyasını oku
    // Electron app.getPath('userData')/database/cafe-data.db konumunda
    const os = require('os');
    const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'cafe-pos', 'database', 'cafe-data.db');
    console.log('📁 Veritabanı yolu:', userDataPath);
    
    // Dosya var mı kontrol et
    if (!require('fs').existsSync(userDataPath)) {
      console.log('❌ Veritabanı dosyası bulunamadı:', userDataPath);
      
      // Alternatif yolları dene
      const alternativePaths = [
        path.join(__dirname, '..', 'src', 'database', 'cafe.db'),
        path.join(__dirname, '..', 'src', 'services', 'cafe-data.db'),
        path.join(__dirname, '..', 'cafe-data.db'),
        path.join(__dirname, 'cafe-data.db')
      ];
      
      for (const altPath of alternativePaths) {
        if (require('fs').existsSync(altPath)) {
          console.log('✅ Alternatif veritabanı yolu bulundu:', altPath);
          return await readDatabaseFile(altPath);
        }
      }
      
      console.log('❌ Hiçbir veritabanı dosyası bulunamadı');
      return {};
    }
    
    return await readDatabaseFile(userDataPath);
    
  } catch (error) {
    console.error('❌ PC veritabanından veri alınırken hata:', error);
    return {};
  }
}

// Veritabanı dosyasını oku
async function readDatabaseFile(dbPath) {
  try {
    // SQLite3 modülünü yükle
    const sqlite3 = require('sqlite3').verbose();
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Veritabanına bağlanılamadı:', err.message);
          resolve({}); // Hata durumunda boş obje döndür
          return;
        }
        
        console.log('✅ Veritabanına bağlanıldı:', dbPath);
        
        // Önce tablo var mı kontrol et
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='table_orders'", (err, row) => {
          if (err || !row) {
            console.log('❌ table_orders tablosu bulunamadı');
            db.close();
            resolve({});
            return;
          }
          
          console.log('✅ table_orders tablosu bulundu');
          
          // Aktif masa siparişlerini al
          const query = `
            SELECT 
              table_number,
              is_active,
              start_time,
              total_amount,
              items,
              created_at
            FROM table_orders
            WHERE is_active = 1
            ORDER BY table_number
          `;
          
          db.all(query, [], (err, rows) => {
            if (err) {
              console.error('❌ Sorgu hatası:', err.message);
              db.close();
              resolve({});
              return;
            }
            
            console.log('📋 Veritabanından alınan satırlar:', rows);
            
            // Sonuçları formatla
            const activeOrders = {};
            rows.forEach(row => {
              // items JSON string'ini parse et
              let items = [];
              try {
                if (row.items) {
                  items = JSON.parse(row.items);
                }
              } catch (e) {
                console.log('⚠️ Items parse hatası:', e);
                items = [];
              }
              
              activeOrders[row.table_number] = {
                tableNumber: row.table_number,
                isActive: row.is_active === 1,
                startTime: row.start_time,
                total: row.total_amount || 0,
                itemsCount: items.length, // items array'inden hesapla
                items: items, // items array'ini ekle
                createdAt: row.created_at,
                lastUpdated: new Date().toISOString()
              };
            });
            
            console.log('✅ Formatlanan siparişler:', activeOrders);
            
            db.close();
            resolve(activeOrders);
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Veritabanı okuma hatası:', error);
    return {};
  }
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

    // PC'deki veritabanından güncel verileri yükle
    await loadTableOrdersFromDatabase();
    
    // Mevcut masa siparişlerini gönder
    const currentOrders = Array.from(tableOrders.entries());
    console.log('📤 Client\'a gönderilen siparişler:', currentOrders);
    socket.emit('current_table_orders', currentOrders);
  });

  // Masa siparişi güncellemesi
  socket.on('update_table_order', (data) => {
    console.log(`📊 Masa siparişi güncellendi: Masa ${data.tableNumber}`);
    
    const { tableNumber, orderData } = data;
    
    // Mevcut siparişi güncelle
    if (tableOrders.has(tableNumber)) {
      const existingOrder = tableOrders.get(tableNumber);
      tableOrders.set(tableNumber, {
        ...existingOrder,
        ...orderData,
        lastUpdated: new Date(),
        updatedBy: socket.id
      });
    } else {
      // Yeni sipariş oluştur
      tableOrders.set(tableNumber, {
        ...orderData,
        createdAt: new Date(),
        lastUpdated: new Date(),
        createdBy: socket.id,
        updatedBy: socket.id
      });
    }

    // Tüm client'lara güncellemeyi gönder (gönderen hariç)
    socket.broadcast.emit('table_order_updated', {
      tableNumber,
      orderData: tableOrders.get(tableNumber),
      timestamp: new Date().toISOString(),
      updatedBy: socket.id
    });

    // Client'a onay gönder
    socket.emit('table_order_update_confirmed', {
      tableNumber,
      success: true,
      timestamp: new Date().toISOString()
    });
  });

  // Yeni masa siparişi oluştur
  socket.on('create_table_order', (data) => {
    console.log(`🆕 Yeni masa siparişi oluşturuldu: Masa ${data.tableNumber}`);
    console.log('📋 Sipariş detayları:', data);
    
    const { tableNumber } = data;
    
    // Yeni sipariş oluştur
    tableOrders.set(tableNumber, {
      ...data,
      tableNumber: tableNumber,
      createdAt: new Date(),
      lastUpdated: new Date(),
      createdBy: socket.id,
      updatedBy: socket.id
    });

    console.log(`✅ Masa ${tableNumber} siparişi kaydedildi:`, tableOrders.get(tableNumber));

    // Tüm client'lara yeni siparişi bildir (gönderen hariç)
    socket.broadcast.emit('table_order_created', {
      tableNumber,
      orderData: tableOrders.get(tableNumber),
      timestamp: new Date().toISOString(),
      createdBy: socket.id
    });

    // Client'a onay gönder
    socket.emit('table_order_create_confirmed', {
      tableNumber,
      success: true,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📤 Masa ${tableNumber} siparişi tüm client'lara gönderildi`);
  });

  // Masa siparişi kapat
  socket.on('close_table_order', (data) => {
    console.log(`🔒 Masa siparişi kapatıldı: Masa ${data.tableNumber}`);
    
    const { tableNumber } = data;
    
    // Siparişi kaldır
    if (tableOrders.has(tableNumber)) {
      tableOrders.delete(tableNumber);
      console.log(`✅ Masa ${tableNumber} siparişi kaldırıldı`);
    }

    // Tüm client'lara siparişin kapatıldığını bildir (gönderen hariç)
    socket.broadcast.emit('table_order_closed', {
      tableNumber,
      timestamp: new Date().toISOString(),
      closedBy: socket.id
    });

    // Client'a onay gönder
    socket.emit('table_order_close_confirmed', {
      tableNumber,
      success: true,
      timestamp: new Date().toISOString()
    });
  });

  // Masa aktarımı
  socket.on('transfer_table', (data) => {
    console.log(`🔄 Masa aktarımı: Masa ${data.sourceTable} → Masa ${data.targetTable}`);
    
    const { sourceTable, targetTable } = data;
    
    // Kaynak masadan siparişi al
    if (tableOrders.has(sourceTable)) {
      const orderData = tableOrders.get(sourceTable);
      
      // Hedef masaya aktar
      tableOrders.set(targetTable, {
        ...orderData,
        tableNumber: targetTable,
        transferredAt: new Date(),
        transferredBy: socket.id,
        originalTable: sourceTable
      });
      
      // Kaynak masadan kaldır
      tableOrders.delete(sourceTable);
      
      console.log(`✅ Masa ${sourceTable} → Masa ${targetTable} aktarımı tamamlandı`);

      // Tüm client'lara aktarımı bildir (gönderen hariç)
      socket.broadcast.emit('table_transferred', {
        sourceTable,
        targetTable,
        orderData: tableOrders.get(targetTable),
        timestamp: new Date().toISOString(),
        transferredBy: socket.id
      });

      // Client'a onay gönder
      socket.emit('table_transfer_confirmed', {
        sourceTable,
        targetTable,
        success: true,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ Masa ${sourceTable} siparişi bulunamadı`);
      
      // Client'a hata gönder
      socket.emit('table_transfer_error', {
        sourceTable,
        targetTable,
        error: 'Kaynak masa siparişi bulunamadı',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Masa siparişlerini getir
  socket.on('get_table_orders', () => {
    console.log(`📋 Masa siparişleri istendi: ${socket.id}`);
    
    const orders = Array.from(tableOrders.entries());
    console.log('📤 Gönderilen siparişler:', orders);
    
    socket.emit('current_table_orders', orders);
  });

  // Ping/Pong
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  // Bağlantı kesildi
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client ayrıldı: ${socket.id}, Sebep: ${reason}`);
    
    // Client'ı kaldır
    connectedClients.delete(socket.id);
    
    console.log(`📊 Aktif client sayısı: ${connectedClients.size}`);
  });

  // Hata durumu
  socket.on('error', (error) => {
    console.error(`❌ Socket hatası (${socket.id}):`, error);
  });
});

// Düzenli olarak PC'deki veritabanından veri güncelle
setInterval(async () => {
  try {
    console.log('🔄 Düzenli veritabanı güncellemesi...');
    await loadTableOrdersFromDatabase();
    
    // Tüm bağlı client'lara güncel verileri gönder
    const currentOrders = Array.from(tableOrders.entries());
    io.emit('current_table_orders', currentOrders);
    
    console.log('✅ Tüm client\'lara güncel veriler gönderildi');
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
  console.log('\n🛑 Sunucu kapatılıyor...');
  httpServer.close(() => {
    console.log('✅ Sunucu güvenli şekilde kapatıldı');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Sunucu kapatılıyor...');
  httpServer.close(() => {
    console.log('✅ Sunucu güvenli şekilde kapatıldı');
    process.exit(0);
  });
});

