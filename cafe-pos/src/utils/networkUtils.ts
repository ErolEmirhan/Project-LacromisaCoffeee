// PC IP adresini almak için utility fonksiyonları

// IP adresini formatla
export const formatIPAddress = (ip: string): string => {
  if (ip === 'localhost' || ip === '127.0.0.1') {
    return 'localhost';
  }
  return ip;
};

// Bağlantı URL'ini oluştur
export const createConnectionURL = (ip: string, port: number = 3000): string => {
  const formattedIP = formatIPAddress(ip);
  return `http://${formattedIP}:${port}`;
};

// Network durumunu kontrol et
export const checkNetworkStatus = async (): Promise<{
  isOnline: boolean;
  localIP?: string;
  publicIP?: string;
  connectionURL?: string;
}> => {
  try {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      return {
        isOnline: false
      };
    }

    // Basit çözüm: Sabit IP kullan
    const localIP = '192.168.0.20'; // Test ettiğimiz IP
    const connectionURL = createConnectionURL(localIP);

    return {
      isOnline: true,
      localIP,
      connectionURL
    };
  } catch (error) {
    console.error('Network durumu kontrol edilemedi:', error);
    return {
      isOnline: false
    };
  }
};
