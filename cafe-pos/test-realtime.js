const { io } = require('socket.io-client');

console.log('🧪 Gerçek zamanlı senkronizasyon testi başlatılıyor...');

// Test client'ı oluştur
const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  timeout: 10000
});

// Bağlantı olayları
socket.on('connect', () => {
  console.log('✅ Test client bağlandı, ID:', socket.id);
  
  // Client hazır olduğunu bildir
  socket.emit('client_ready', { 
    clientType: 'test', 
    timestamp: new Date().toISOString() 
  });
  
  // Test masa siparişi oluştur
  setTimeout(() => {
    console.log('📝 Test masa siparişi oluşturuluyor...');
    socket.emit('create_table_order', {
      tableNumber: 1,
      orderData: {
        items: [
          { product: { id: 'test-1', name: 'Test Ürün 1', price: 15.50, category: 'test' }, quantity: 2 },
          { product: { id: 'test-2', name: 'Test Ürün 2', price: 12.00, category: 'test' }, quantity: 1 }
        ],
        total: 43.00,
        startTime: new Date()
      },
      timestamp: new Date().toISOString(),
      clientId: socket.id
    });
  }, 2000);
  
  // Test masa güncellemesi
  setTimeout(() => {
    console.log('📊 Test masa güncellemesi yapılıyor...');
    socket.emit('update_table_order', {
      tableNumber: 1,
      orderData: {
        items: [
          { product: { id: 'test-1', name: 'Test Ürün 1', price: 15.50, category: 'test' }, quantity: 3 },
          { product: { id: 'test-2', name: 'Test Ürün 2', price: 12.00, category: 'test' }, quantity: 2 },
          { product: { id: 'test-3', name: 'Test Ürün 3', price: 8.50, category: 'test' }, quantity: 1 }
        ],
        total: 67.50,
        startTime: new Date()
      },
      timestamp: new Date().toISOString(),
      clientId: socket.id
    });
  }, 5000);
  
  // Test masa aktarımı
  setTimeout(() => {
    console.log('🔄 Test masa aktarımı yapılıyor...');
    socket.emit('transfer_table', {
      sourceTable: 1,
      targetTable: 2,
      timestamp: new Date().toISOString(),
      clientId: socket.id
    });
  }, 8000);
  
  // Test masa kapatma
  setTimeout(() => {
    console.log('🔒 Test masa kapatılıyor...');
    socket.emit('close_table_order', {
      tableNumber: 2,
      timestamp: new Date().toISOString(),
      clientId: socket.id
    });
  }, 11000);
  
  // Test tamamlandı
  setTimeout(() => {
    console.log('✅ Test tamamlandı, bağlantı kapatılıyor...');
    socket.disconnect();
    process.exit(0);
  }, 14000);
});

// Hata olayları
socket.on('connect_error', (error) => {
  console.error('❌ Bağlantı hatası:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Bağlantı kesildi:', reason);
});

// Sunucu olayları
socket.on('table_order_created', (data) => {
  console.log('📊 Masa siparişi oluşturuldu:', data);
});

socket.on('table_order_updated', (data) => {
  console.log('📊 Masa siparişi güncellendi:', data);
});

socket.on('table_transferred', (data) => {
  console.log('🔄 Masa aktarımı yapıldı:', data);
});

socket.on('table_order_closed', (data) => {
  console.log('🔒 Masa siparişi kapatıldı:', data);
});

socket.on('server_stats', (stats) => {
  console.log('📈 Sunucu durumu:', stats);
});

// Hata yakalama
process.on('uncaughtException', (error) => {
  console.error('❌ Yakalanmamış hata:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ İşlenmeyen Promise reddi:', reason);
  process.exit(1);
});

// Timeout kontrolü
setTimeout(() => {
  console.error('⏰ Test timeout, bağlantı kurulamadı');
  process.exit(1);
}, 15000);

console.log('⏳ WebSocket sunucusuna bağlanmaya çalışılıyor...');
console.log('📍 Hedef: http://localhost:3001');
console.log('⏱️  Timeout: 15 saniye');

