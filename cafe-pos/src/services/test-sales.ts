import { getDatabaseIPC } from './database-ipc';
import { Sale } from '../types';

export const createTestSales = async (): Promise<void> => {
  const db = getDatabaseIPC();
  
  // Gerçek zamanlı test verileri oluştur
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Bugünkü farklı saatlerde satışlar
  const testSales: Sale[] = [
    // Bugün sabah 09:15
    {
      id: `sale_test_${Date.now()}_1`,
      date: today,
      time: '09:15',
      totalAmount: 75.50,
      paymentMethod: 'cash',
      items: [
        {
          productId: 'p1',
          productName: 'Türk Kahvesi',
          quantity: 2,
          unitPrice: 25,
          totalPrice: 50,
          category: 'hot-drinks'
        },
        {
          productId: 'p41',
          productName: 'Cheesecake',
          quantity: 1,
          unitPrice: 25.50,
          totalPrice: 25.50,
          category: 'desserts'
        }
      ],
      createdAt: new Date(now.getTime() - (now.getHours() - 9) * 60 * 60 * 1000 - (now.getMinutes() - 15) * 60 * 1000).toISOString()
    },
    
    // Bugün öğle 12:30
    {
      id: `sale_test_${Date.now()}_2`,
      date: today,
      time: '12:30',
      totalAmount: 120,
      paymentMethod: 'card',
      items: [
        {
          productId: 'p5',
          productName: 'Latte',
          quantity: 3,
          unitPrice: 35,
          totalPrice: 105,
          category: 'hot-drinks'
        },
        {
          productId: 'p61',
          productName: 'Kurabiye',
          quantity: 1,
          unitPrice: 15,
          totalPrice: 15,
          category: 'snacks'
        }
      ],
      createdAt: new Date(now.getTime() - (now.getHours() - 12) * 60 * 60 * 1000 - (now.getMinutes() - 30) * 60 * 1000).toISOString()
    },
    
    // Bugün öğleden sonra 15:45
    {
      id: `sale_test_${Date.now()}_3`,
      date: today,
      time: '15:45',
      totalAmount: 85,
      paymentMethod: 'mixed',
      cashAmount: 50,
      cardAmount: 35,
      items: [
        {
          productId: 'p23',
          productName: 'Frappuccino',
          quantity: 2,
          unitPrice: 40,
          totalPrice: 80,
          category: 'cold-drinks'
        },
        {
          productId: 'p37',
          productName: 'Su',
          quantity: 1,
          unitPrice: 5,
          totalPrice: 5,
          category: 'cold-drinks'
        }
      ],
      createdAt: new Date(now.getTime() - (now.getHours() - 15) * 60 * 60 * 1000 - (now.getMinutes() - 45) * 60 * 1000).toISOString()
    },
    
    // Dün akşam 18:20
    {
      id: `sale_test_${Date.now()}_4`,
      date: yesterday,
      time: '18:20',
      totalAmount: 95,
      paymentMethod: 'cash',
      items: [
        {
          productId: 'p42',
          productName: 'Tiramisu',
          quantity: 2,
          unitPrice: 47.50,
          totalPrice: 95,
          category: 'desserts'
        }
      ],
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000 - (24 - 18) * 60 * 60 * 1000 - (60 - 20) * 60 * 1000).toISOString()
    },
    
    // Geçen hafta 11:10
    {
      id: `sale_test_${Date.now()}_5`,
      date: lastWeek,
      time: '11:10',
      totalAmount: 200,
      paymentMethod: 'card',
      items: [
        {
          productId: 'p86',
          productName: 'Serpme Kahvaltı',
          quantity: 2,
          unitPrice: 85,
          totalPrice: 170,
          category: 'breakfast'
        },
        {
          productId: 'p20',
          productName: 'Çay (Bardak)',
          quantity: 2,
          unitPrice: 15,
          totalPrice: 30,
          category: 'hot-drinks'
        }
      ],
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 - (now.getHours() - 11) * 60 * 60 * 1000 - (now.getMinutes() - 10) * 60 * 1000).toISOString()
    }
  ];

  console.log('🧪 Test satış verileri oluşturuluyor...');
  console.log(`📅 Bugünkü tarih: ${today}`);
  console.log(`⏰ Şu anki saat: ${now.toTimeString().split(' ')[0].substring(0, 5)}`);
  
  for (const sale of testSales) {
    const success = await db.saveSale(sale);
    if (success) {
      console.log(`✅ Test satış kaydedildi: ${sale.date} ${sale.time} - ${sale.totalAmount} TL`);
    } else {
      console.log(`❌ Test satış kaydedilemedi: ${sale.id}`);
    }
  }
  
  console.log('🎉 Test verileri gerçek zamanlı olarak oluşturuldu!');
}; 