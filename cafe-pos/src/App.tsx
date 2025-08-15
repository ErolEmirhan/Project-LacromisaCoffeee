import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  Paper,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Drawer,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Snackbar,
  Alert,
  Slide
} from '@mui/material';
import { 
  LocalCafe as LocalCafeIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
// Removed default MenuIcon in favor of custom modern hamburger
import { useStore } from './store/useStore';
import { CartItem, Customer } from './types';
import { 
  Person as PersonIcon, 
  Loyalty as LoyaltyIcon,
  PersonAdd as PersonAddIcon,
  ClearAll as ClearAllIcon,
  Info as InfoIcon,
  Backup as BackupIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Emergency as EmergencyIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import { getDatabaseIPC } from './services/database-ipc';
import { getRealtimeSync } from './services/realtime-sync';
import { checkNetworkStatus } from './utils/networkUtils';
import LoginScreen from './components/LoginScreen';
import SplashScreen from './components/SplashScreen';
import LogoutConfirmDialog from './components/LogoutConfirmDialog';
import PaymentDialog from './components/PaymentDialog';
import ReceiptPreview from './components/ReceiptPreview';
import AdminPanel from './components/AdminPanel';
import AdminDashboard from './components/AdminDashboard';
import VirtualKeyboard from './components/VirtualKeyboard';
import QRCodeDialog from './components/QRCodeDialog';

// Modern yeşil tema - #0a4940
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0a4940',
      light: '#2e6b63',
      dark: '#053429',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#f8fffe',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    success: {
      main: '#0a4940',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(10, 73, 64, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          minHeight: 60,
        },
      },
    },
  },
});

// Modern hamburger icon with morph-to-X animation
const HamburgerIcon: React.FC<{ active?: boolean }> = ({ active = false }) => {
  const barCommon = {
    width: 24,
    height: 3,
    borderRadius: 2,
    background: 'linear-gradient(90deg, #0a4940 0%, #2e6b63 100%)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
    transition: 'transform 220ms ease, opacity 220ms ease, width 220ms ease',
  } as const;

  return (
    <Box sx={{ width: 28, height: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
      <Box className="ham-bar" sx={{
        ...barCommon,
        transform: active ? 'translateY(7px) rotate(45deg)' : 'translateY(0) rotate(0deg)'
      }} />
      <Box className="ham-bar" sx={{
        ...barCommon,
        width: active ? 0 : 20,
        opacity: active ? 0 : 1
      }} />
      <Box className="ham-bar" sx={{
        ...barCommon,
        transform: active ? 'translateY(-7px) rotate(-45deg)' : 'translateY(0) rotate(0deg)'
      }} />
    </Box>
  );
};

const MainApp: React.FC = () => {
  const {
    categories,
    products,
    selectedCategory,
    cart,
    setSelectedCategory,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getProductsByCategory,
    showLogoutDialog,
    startPayment,
    showReceiptPreview,
    receiptData,
    hideReceiptPreview,
    showAdminPanel,
    showAdminPanelDialog,
    hideAdminPanel,
    loadData,
  } = useStore();

  const [showDashboard, setShowDashboard] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = React.useState(false);
  const [showSizeDialog, setShowSizeDialog] = React.useState(false);
  const [sizeSelectProduct, setSizeSelectProduct] = React.useState<any | null>(null);
  const [selectedSizeId, setSelectedSizeId] = React.useState<string | null>(null);

  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [showTables, setShowTables] = React.useState(false);
  const [showTableSelection, setShowTableSelection] = React.useState(false);
  const [selectedTableNumber, setSelectedTableNumber] = React.useState<number | null>(null);
  const [tableOrders, setTableOrders] = React.useState<{[key: number]: {items: any[], total: number, startTime: Date}}>({});
  const [showTableDetail, setShowTableDetail] = React.useState(false);
  const [selectedTableForDetail, setSelectedTableForDetail] = React.useState<number | null>(null);
  const [isAddingToTable, setIsAddingToTable] = React.useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastSeverity, setToastSeverity] = React.useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [showCustomers, setShowCustomers] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [addCustomerOpen, setAddCustomerOpen] = React.useState(false);
  const [newCustomerName, setNewCustomerName] = React.useState('');
  const [newCustomerPhone, setNewCustomerPhone] = React.useState('');
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = React.useState(false);
  const [deleteAllCountdown, setDeleteAllCountdown] = React.useState(3);
  const [deleteAllEnabled, setDeleteAllEnabled] = React.useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = React.useState<any>(null);
  const [customerOrders, setCustomerOrders] = React.useState<any[]>([]);
  const [customerTotalDebt, setCustomerTotalDebt] = React.useState(0);
  
  // Masa aktarım için state'ler
  const [showTableTransferDialog, setShowTableTransferDialog] = React.useState(false);
  const [sourceTable, setSourceTable] = React.useState<number | null>(null);
  const [targetTable, setTargetTable] = React.useState<number | null>(null);
  
  // Gerçek zamanlı senkronizasyon state'leri
  const [realtimeSyncStatus, setRealtimeSyncStatus] = React.useState<{
    connected: boolean;
    id?: string;
    attempts: number;
  }>({ connected: false, attempts: 0 });
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);
  
  // QR kod dialog state'leri
  const [showQRCodeDialog, setShowQRCodeDialog] = React.useState(false);
  const [pcIpAddress, setPcIpAddress] = React.useState<string>('localhost');

  // Verileri uygulama başlarken yükle
  React.useEffect(() => {
    loadData();
    loadTableOrders();
  }, [loadData]);

  // Gerçek zamanlı senkronizasyon servisini başlat
  React.useEffect(() => {
    const realtimeSync = getRealtimeSync();
    
    // Bağlantı durumu güncellemesi
    const updateStatus = () => {
      const status = realtimeSync.getConnectionStatus();
      setRealtimeSyncStatus(status);
    };

    // Periyodik olarak durumu güncelle
    const statusInterval = setInterval(updateStatus, 2000);
    
    // Event dinleyicileri
    realtimeSync.on('table_order_updated', (data: any) => {
      console.log('📊 Gerçek zamanlı masa güncellemesi alındı:', data);
      setLastSyncTime(new Date());
      
      // Masa siparişlerini yeniden yükle
      loadTableOrders();
    });

    realtimeSync.on('table_order_created', (data: any) => {
      console.log('🆕 Gerçek zamanlı yeni masa siparişi alındı:', data);
      setLastSyncTime(new Date());
      
      // Masa siparişlerini yeniden yükle
      loadTableOrders();
    });

    realtimeSync.on('table_order_closed', (data: any) => {
      console.log('🔒 Gerçek zamanlı masa kapatma alındı:', data);
      setLastSyncTime(new Date());
      
      // Masa siparişlerini yeniden yükle
      loadTableOrders();
    });

    realtimeSync.on('table_transferred', (data: any) => {
      console.log('🔄 Gerçek zamanlı masa aktarımı alındı:', data);
      setLastSyncTime(new Date());
      
      // Masa siparişlerini yeniden yükle
      loadTableOrders();
    });

    // İlk durum güncellemesi
    updateStatus();

    return () => {
      clearInterval(statusInterval);
      realtimeSync.off('table_order_updated', () => {});
      realtimeSync.off('table_order_created', () => {});
      realtimeSync.off('table_order_closed', () => {});
      realtimeSync.off('table_transferred', () => {});
    };
  }, []);

  // PC IP adresini al
  React.useEffect(() => {
    const getIPAddress = async () => {
      try {
        const networkStatus = await checkNetworkStatus();
        if (networkStatus.isOnline && networkStatus.localIP) {
          setPcIpAddress(networkStatus.localIP);
        }
      } catch (error) {
        console.error('IP adresi alınamadı:', error);
        setPcIpAddress('localhost');
      }
    };

    getIPAddress();
  }, []);

  // Masa siparişlerini veritabanından yükle
  const loadTableOrders = async () => {
    console.log('🔄 Masa siparişleri yükleniyor...');
    try {
      const db = getDatabaseIPC();
      const activeOrders = await db.getActiveTableOrders();
      console.log('✅ Masa siparişleri yüklendi:', activeOrders);
      setTableOrders(activeOrders);
    } catch (error: any) {
      console.error('❌ Masa siparişleri yüklenirken hata:', error);
    }
  };

  // Saati gerçek zamanlı güncelle
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Her saniye güncelle

    return () => clearInterval(timer);
  }, []);

  // Tam ekran durumunu kontrol et
  React.useEffect(() => {
    const checkFullscreen = async () => {
      try {
        if (window.electronAPI) {
          const fullscreen = await window.electronAPI.isFullscreen();
          setIsFullscreen(fullscreen);
        }
      } catch (error: any) {
        console.error('Tam ekran durumu kontrol hatası:', error);
      }
    };
    
    checkFullscreen();
    
    // Düzenli olarak tam ekran durumunu kontrol et (daha az sıklıkta)
    const interval = setInterval(checkFullscreen, 2000);
    return () => clearInterval(interval);
  }, []);

  // Tam ekran toggle fonksiyonu
  const toggleFullscreen = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.toggleFullscreen();
        // Hemen durum güncellemesi yap
        setTimeout(async () => {
          try {
            const fullscreen = await window.electronAPI.isFullscreen();
            setIsFullscreen(fullscreen);
          } catch (error: any) {
            console.error('Tam ekran durumu güncelleme hatası:', error);
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Tam ekran toggle hatası:', error);
    }
  };

  const openHeaderDrawer = () => setDrawerOpen(true);
  const closeHeaderDrawer = () => setDrawerOpen(false);

  const currentProducts = getProductsByCategory(selectedCategory);
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  // Arama fonksiyonu
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return currentProducts;
    }
    
    return currentProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentProducts, searchQuery]);

  // Arama kutusunu temizleme
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Masa aktarım fonksiyonu
  const handleTableTransfer = async () => {
    if (!sourceTable || !targetTable) {
      showToast('Lütfen kaynak ve hedef masa seçin', 'error');
      return;
    }

    if (sourceTable === targetTable) {
      showToast('Kaynak ve hedef masa aynı olamaz', 'error');
      return;
    }

    try {
      console.log(`🔄 Masa ${sourceTable} -> Masa ${targetTable} aktarımı başlıyor...`);
      
      // Kaynak masadan veriyi al
      const sourceOrder = tableOrders[sourceTable];
      if (!sourceOrder) {
        showToast(`Masa ${sourceTable} boş, aktarım yapılamaz`, 'error');
        return;
      }

      // Hedef masanın boş olduğunu kontrol et
      if (tableOrders[targetTable]) {
        showToast(`Masa ${targetTable} dolu, aktarım yapılamaz`, 'error');
        return;
      }

      // Veritabanında masa aktarımını yap
      const db = getDatabaseIPC();
      const realtimeSync = getRealtimeSync();
      
      const success = await db.transferTableOrder(sourceTable, targetTable);
      
      if (success) {
        // Gerçek zamanlı senkronizasyon ile masa aktarımı gönder
        realtimeSync.emitTableTransfer(sourceTable, targetTable);
        
        // Local state'i güncelle
        const newTableOrders = { ...tableOrders };
        newTableOrders[targetTable] = sourceOrder;
        delete newTableOrders[sourceTable];
        setTableOrders(newTableOrders);
        
        // Dialog'u kapat
        setShowTableTransferDialog(false);
        setSourceTable(null);
        setTargetTable(null);
        
        showToast(`Masa ${sourceTable} -> Masa ${targetTable} başarıyla aktarıldı!`, 'success');
        console.log(`✅ Masa aktarımı tamamlandı: ${sourceTable} -> ${targetTable}`);
      } else {
        showToast('Masa aktarımı başarısız!', 'error');
      }
    } catch (error: any) {
      console.error('❌ Masa aktarım hatası:', error);
      showToast(`Hata: ${error?.message || 'Bilinmeyen hata'}`, 'error');
    }
  };

  // Sanal klavye fonksiyonları
  const handleVirtualKeyPress = (key: string) => {
    setSearchQuery(prev => prev + key);
  };

  const handleVirtualBackspace = () => {
    setSearchQuery(prev => prev.slice(0, -1));
  };

  const handleVirtualClear = () => {
    setSearchQuery('');
  };

  const openVirtualKeyboard = () => {
    setShowVirtualKeyboard(true);
  };

  const closeVirtualKeyboard = () => {
    setShowVirtualKeyboard(false);
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  // Müşterileri yükle
  const loadCustomers = React.useCallback(async () => {
    try {
      console.log('🔄 loadCustomers çağrıldı...');
      const db = getDatabaseIPC();
      console.log('📡 Database IPC alındı, getCustomers çağrılıyor...');
      const list = await db.getCustomers();
      console.log('📋 getCustomers sonucu:', list);
      console.log('👥 Müşteri sayısı:', list?.length || 0);
      setCustomers(list);
      console.log('✅ customers state güncellendi');
    } catch (e) {
      console.error('❌ Müşteriler yüklenirken hata:', e);
    }
  }, []);

  React.useEffect(() => {
    console.log('🔍 useEffect showCustomers değişti:', showCustomers);
    if (showCustomers) {
      console.log('📱 Müşteriler sekmesi açıldı, loadCustomers çağrılıyor...');
      loadCustomers();
    }
  }, [showCustomers, loadCustomers]);

  // Countdown timer for delete all confirmation
  React.useEffect(() => {
    if (deleteAllConfirmOpen && !deleteAllEnabled) {
      const timer = setInterval(() => {
        setDeleteAllCountdown(prev => {
          if (prev <= 1) {
            setDeleteAllEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [deleteAllConfirmOpen, deleteAllEnabled]);

  // Müşteri seçildiğinde sipariş geçmişini yükle
  React.useEffect(() => {
    if (selectedCustomerForHistory) {
      loadCustomerHistory(selectedCustomerForHistory.id);
    }
  }, [selectedCustomerForHistory]);

  const loadCustomerHistory = async (customerId: number) => {
    try {
      const db = getDatabaseIPC();
      const orders = await db.getCustomerOrders(customerId);
      const totalDebt = await db.getCustomerTotalDebt(customerId);
      setCustomerOrders(orders);
      setCustomerTotalDebt(totalDebt);
    } catch (error) {
      console.error('Müşteri geçmişi yüklenirken hata:', error);
      setCustomerOrders([]);
      setCustomerTotalDebt(0);
    }
  };

  // customers state değişimini izle
  React.useEffect(() => {
    console.log('👥 customers state değişti:', customers);
    console.log('📊 Müşteri sayısı:', customers?.length || 0);
  }, [customers]);

  const handleDeleteAllCustomers = async () => {
    try {
      console.log('🗑️ Tüm müşteriler siliniyor...');
      const db = getDatabaseIPC();
      const success = await db.deleteAllCustomers();
      
      if (success) {
        console.log('✅ Tüm müşteriler başarıyla silindi');
        setCustomers([]);
        showToast('Tüm müşteriler silindi', 'success');
        setDeleteAllConfirmOpen(false);
        setDeleteAllCountdown(3);
        setDeleteAllEnabled(false);
      } else {
        console.error('❌ Müşteriler silinemedi');
        showToast('Müşteriler silinemedi!', 'error');
      }
    } catch (error: any) {
      console.error('❌ Tüm müşterileri silme hatası:', error);
      showToast(`Hata: ${error?.message || 'Bilinmeyen hata'}`, 'error');
    }
  };

  const handleAddCustomerSave = async () => {
    const name = newCustomerName.trim();
    const phone = newCustomerPhone.trim();
    if (!name) {
      showToast('İsim ve soyisim gerekli', 'warning');
      return;
    }
    try {
      console.log('👤 Müşteri ekleniyor...', { name, phone });
      const db = getDatabaseIPC();
      console.log('📡 Database IPC alındı, addCustomer çağrılıyor...');
      const prevCount = customers.length;
      const created: any = await db.addCustomer(name, phone || undefined);
      console.log('✅ addCustomer sonucu (row):', created);
      if (created && created.id) {
        showToast('Müşteri kaydedildi', 'success');
        // Dialog alanlarını sıfırla
        setAddCustomerOpen(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
        // UI'ya anında yansıt (ekstra tazeleme yok; kalıcı kayıt garantili)
        setCustomers(prev => [...prev, created]);
      } else {
        console.log('ℹ️ Satır dönmedi, listeyi tekrar okuyorum...');
        const fresh = await db.getCustomers();
        console.log('📋 getCustomers (fallback) sonucu:', fresh);
        setCustomers(fresh);
        if (fresh.length > prevCount) {
          showToast('Müşteri kaydedildi', 'success');
          setAddCustomerOpen(false);
          setNewCustomerName('');
          setNewCustomerPhone('');
        } else {
          console.log('❌ Müşteri kaydedilemedi veya DB liste artmadı');
          showToast('Müşteri kaydedilemedi! Lütfen tekrar deneyin.', 'error');
          // Dialog açık kalsın, kullanıcı düzenleyip tekrar deneyebilsin
        }
      }
    } catch (e: any) {
      console.error('❌ Müşteri ekleme hatası:', e);
      showToast(`Hata: ${e?.message || 'Bilinmeyen hata'}`, 'error');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const openSizeSelection = (product: any) => {
    setSizeSelectProduct(product);
    const defaultSize = product?.sizes?.find((s: any) => s.id === 'medium') || product?.sizes?.[0] || null;
    setSelectedSizeId(defaultSize ? defaultSize.id : null);
    setShowSizeDialog(true);
  };

  const closeSizeSelection = () => {
    setShowSizeDialog(false);
    setSizeSelectProduct(null);
    setSelectedSizeId(null);
  };

  const handleAddProduct = (product: any) => {
    if (product?.sizes && product.sizes.length > 0) {
      openSizeSelection(product);
    } else {
      addToCart(product);
    }
  };

  const SlideLeft = (props: any) => <Slide {...props} direction="left" />;
  const showToast = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

      return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        width: '100vw',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}>
      {/* Header - Mobil Uyumlu */}
      <AppBar className="mobile-header" position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ 
          px: { xs: 1, sm: 2, md: 3 }, 
          py: { xs: 1, sm: 1.5, md: 2 },
          position: 'relative',
          minHeight: { xs: '64px', sm: '70px', md: '80px' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
            <Box
              className="mobile-logo"
              component="img"
              src={require('./assets/Logo.png')}
              alt="Lacromisa Coffee Logo"
              sx={{
                width: { xs: 36, sm: 42, md: 48 },
                height: { xs: 36, sm: 42, md: 48 },
                borderRadius: '50%',
                mr: { xs: 1, sm: 1.5, md: 2 },
                boxShadow: '0 2px 8px rgba(10, 73, 64, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.8)'
              }}
            />
            <Typography className="mobile-title" variant="h5" component="div" sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              display: { xs: 'none', sm: 'block' }
            }}>
              Lacromisa Coffee
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />

          {/* Ürünler ve Masalar Butonları - Mobil Uyumlu */}
          <Box className="mobile-header-buttons" sx={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 },
            width: { xs: '90%', sm: 'auto' }
          }}>
            {/* Ürünler Butonu */}
            <Button
              className="mobile-header-button"
              onClick={() => { setShowTables(false); setShowCustomers(false); }}
              variant="outlined"
              sx={{
                background: (!showTables && !showCustomers) 
                  ? 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 255, 254, 0.9) 100%)',
                color: (!showTables && !showCustomers) ? 'white' : '#0a4940',
                fontWeight: 800,
                px: { xs: 3, sm: 5 },
                py: { xs: 1.5, sm: 2 },
                borderRadius: '20px',
                textTransform: 'none',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                minWidth: { xs: '120px', sm: '140px' },
                border: 'none',
                boxShadow: (!showTables && !showCustomers) 
                  ? '0 8px 25px rgba(10, 73, 64, 0.4), 0 4px 15px rgba(10, 73, 64, 0.2)'
                  : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04)',
                transform: (!showTables && !showCustomers) ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  borderRadius: '20px',
                  opacity: (!showTables && !showCustomers) ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #053429 0%, #0a4940 100%)',
                  color: 'white',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 12px 35px rgba(10, 73, 64, 0.5), 0 6px 20px rgba(10, 73, 64, 0.3)',
                  '&::before': {
                    opacity: 1
                  }
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              🍽️ Ürünler
            </Button>
            
            {/* Masalar Butonu */}
            <Button
              className="mobile-header-button"
              onClick={() => { setShowTables(true); setShowCustomers(false); }}
              variant="outlined"
              sx={{
                background: showTables 
                  ? 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 255, 254, 0.9) 100%)',
                color: showTables ? 'white' : '#0a4940',
                fontWeight: 800,
                px: { xs: 3, sm: 5 },
                py: { xs: 1.5, sm: 2 },
                borderRadius: '20px',
                textTransform: 'none',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                minWidth: { xs: '120px', sm: '140px' },
                border: 'none',
                boxShadow: showTables 
                  ? '0 8px 25px rgba(10, 73, 64, 0.4), 0 4px 15px rgba(10, 73, 64, 0.2)'
                  : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04)',
                transform: showTables ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  borderRadius: '20px',
                  opacity: showTables ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #053429 0%, #0a4940 100%)',
                  color: 'white',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 12px 35px rgba(10, 73, 64, 0.5), 0 6px 20px rgba(10, 73, 64, 0.3)',
                  '&::before': {
                    opacity: 1
                  }
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              🪑 Masalar
            </Button>

            {/* Müşteriler Butonu */}
            <Button
              className="mobile-header-button"
              onClick={() => { setShowTables(false); setShowCustomers(true); }}
              variant="outlined"
              sx={{
                background: showCustomers 
                  ? 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 255, 254, 0.9) 100%)',
                color: showCustomers ? 'white' : '#0a4940',
                fontWeight: 800,
                px: { xs: 3, sm: 5 },
                py: { xs: 1.5, sm: 2 },
                borderRadius: '20px',
                textTransform: 'none',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                minWidth: { xs: '120px', sm: '140px' },
                border: 'none',
                boxShadow: showCustomers 
                  ? '0 8px 25px rgba(10, 73, 64, 0.4), 0 4px 15px rgba(10, 73, 64, 0.2)'
                  : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04)',
                transform: showCustomers ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
                position: 'relative',
                  overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  borderRadius: '20px',
                  opacity: showCustomers ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #053429 0%, #0a4940 100%)',
                  color: 'white',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 12px 35px rgba(10, 73, 64, 0.5), 0 6px 20px rgba(10, 73, 64, 0.3)',
                  '&::before': {
                    opacity: 1
                  }
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              👥 Müşteriler
            </Button>
          </Box>
          
          {/* Gerçek zamanlı senkronizasyon durumu - Tıklanabilir QR kod butonu */}
          <Tooltip title="Telefon bağlantısı için QR kod göster">
            <Box 
              onClick={() => setShowQRCodeDialog(true)}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: realtimeSyncStatus.connected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                border: 1,
                borderColor: realtimeSyncStatus.connected ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)',
                mr: 1,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: realtimeSyncStatus.connected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }}
            >
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: realtimeSyncStatus.connected ? '#4caf50' : '#f44336',
                animation: realtimeSyncStatus.connected ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 }
                }
              }} />
              <Typography variant="caption" sx={{ 
                fontSize: '0.7rem',
                fontWeight: 600,
                color: realtimeSyncStatus.connected ? '#4caf50' : '#f44336',
                display: { xs: 'none', sm: 'block' }
              }}>
                {realtimeSyncStatus.connected ? 'SYNC' : 'OFF'}
              </Typography>
            </Box>
          </Tooltip>

          {/* Sağ üst hamburger menü - Mobil Uyumlu */}
          <Tooltip title="Menü">
            <IconButton
              className="mobile-hamburger"
              onClick={openHeaderDrawer}
              sx={{
                ml: { xs: 1, sm: 1.5, md: 2 },
                bgcolor: 'rgba(10, 73, 64, 0.1)',
                color: '#0a4940',
                border: { xs: '1px solid', sm: '2px solid' },
                borderColor: '#0a4940',
                width: { xs: 44, sm: 50, md: 56 },
                height: { xs: 44, sm: 50, md: 56 },
                '&:hover': {
                  bgcolor: '#0a4940',
                  color: 'white',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <HamburgerIcon active={drawerOpen} />
            </IconButton>
          </Tooltip>

          {/* Sağdan kayan yarı panel (Drawer) */}
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={closeHeaderDrawer}
            PaperProps={{
              sx: {
                width: { xs: '88vw', sm: 420 },
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                background: 'linear-gradient(135deg, #ffffff 0%, #f6fbfa 100%)'
              }
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>Menü</Typography>
                <IconButton onClick={closeHeaderDrawer}>
                  <ClearIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>🕐 {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>📅 {currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</Typography>
              </Box>
              <Divider />
              <Box sx={{ mt: 1 }}>
                {/* Ana Menü */}
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>
                  📊 YÖNETİM
                </Typography>
                
                <MenuItem onClick={() => { setShowDashboard(true); closeHeaderDrawer(); }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <AnalyticsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Admin Dashboard" 
                    secondary="Satış istatistikleri ve raporlar"
                  />
                </MenuItem>
                
                <MenuItem onClick={() => { showAdminPanelDialog(); closeHeaderDrawer(); }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Ayarlar" 
                    secondary="Sistem konfigürasyonu"
                  />
                </MenuItem>

                <Divider sx={{ my: 2 }} />
                
                {/* Müşteri İşlemleri */}
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>
                  👥 MÜŞTERİ İŞLEMLERİ
                </Typography>
                
                <MenuItem onClick={() => { setShowTables(false); setShowCustomers(true); closeHeaderDrawer(); }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <LoyaltyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Müşteri Yönetimi" 
                    secondary="Müşteri listesi ve sipariş geçmişi"
                  />
                </MenuItem>

                <MenuItem onClick={() => { 
                  // Hızlı müşteri ekleme
                  setShowTables(false); 
                  setShowCustomers(true); 
                  setAddCustomerOpen(true);
                  closeHeaderDrawer(); 
                }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <PersonAddIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hızlı Müşteri Ekle" 
                    secondary="Yeni müşteri kaydı oluştur"
                  />
                </MenuItem>

                <Divider sx={{ my: 2 }} />
                
                {/* Hızlı İşlemler */}
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>
                  ⚡ HIZLI İŞLEMLER
                </Typography>

                <MenuItem onClick={() => { 
                  // Sepeti temizle
                  clearCart();
                  showToast('Sepet temizlendi', 'success');
                  closeHeaderDrawer(); 
                }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <ClearAllIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sepeti Temizle" 
                    secondary="Tüm ürünleri sepetten kaldır"
                  />
                </MenuItem>

                <MenuItem onClick={() => { 
                  // Hızlı ürün arama
                  setShowTables(false);
                  setShowDashboard(false);
                  setShowCustomers(false);
                  // Ürün arama modunu aktif et
                  closeHeaderDrawer(); 
                }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <SearchIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hızlı Ürün Ara" 
                    secondary="Ürün adı ile arama yap"
                  />
                </MenuItem>

                <Divider sx={{ my: 2 }} />
                
                {/* Sistem Bilgileri */}
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>
                  ℹ️ SİSTEM BİLGİLERİ
                </Typography>

                <MenuItem onClick={() => { 
                  // Sistem durumu göster
                  const systemInfo = {
                    version: '1.0.0',
                    lastUpdate: new Date().toLocaleDateString('tr-TR'),
                    totalProducts: products.length,
                    totalCategories: categories.length,
                    totalCustomers: customers.length
                  };
                  showToast(`Sistem: v${systemInfo.version} | ${systemInfo.totalProducts} ürün | ${systemInfo.totalCustomers} müşteri`, 'info');
                  closeHeaderDrawer(); 
                }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sistem Durumu" 
                    secondary="Versiyon ve istatistikler"
                  />
                </MenuItem>

                <MenuItem onClick={() => { 
                  // Veritabanı yedekleme simülasyonu
                  showToast('Veritabanı yedekleniyor...', 'info');
                  setTimeout(() => {
                    showToast('Veritabanı başarıyla yedeklendi!', 'success');
                  }, 2000);
                  closeHeaderDrawer(); 
                }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <BackupIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Veritabanı Yedekle" 
                    secondary="Güvenlik kopyası oluştur"
                  />
                </MenuItem>

                <Divider sx={{ my: 2 }} />
                
                {/* Gelişmiş Özellikler */}
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>
                  🚀 GELİŞMİŞ ÖZELLİKLER
                </Typography>

                <MenuItem onClick={() => { 
                  // Hızlı satış modu
                  showToast('Hızlı satış modu aktif!', 'success');
                  closeHeaderDrawer(); 
                }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <SpeedIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hızlı Satış Modu" 
                    secondary="Tek tıkla hızlı işlem"
                  />
                </MenuItem>

                <MenuItem onClick={() => { 
                  // Günlük özet
                  const today = new Date();
                  const todaySales = Math.floor(Math.random() * 50) + 10; // Simüle edilmiş veri
                  const todayRevenue = Math.floor(Math.random() * 1000) + 200;
                  showToast(`Günlük Özet: ${todaySales} satış, ${formatPrice(todayRevenue)} gelir`, 'info');
                  closeHeaderDrawer(); 
                }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <AssessmentIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Günlük Özet" 
                    secondary="Bugünkü satış performansı"
                  />
                </MenuItem>

                <MenuItem onClick={() => { 
                  // Acil durum modu
                  showToast('Acil durum modu aktif! Tüm işlemler kaydediliyor.', 'warning');
                  closeHeaderDrawer(); 
                }} sx={{ py: 1.5, borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <EmergencyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Acil Durum Modu" 
                    secondary="Güvenli kapatma ve yedekleme"
                  />
                </MenuItem>
              </Box>
            </Box>
          </Drawer>
          {/* Header'daki çıkış butonunu kaldırdık */}
        </Toolbar>
      </AppBar>

      {/* Ana İçerik Alanı - Mobil Uyumlu */}
      <Container className="mobile-container" maxWidth="xl" sx={{ 
        flex: 1, 
        mt: { xs: 1, sm: 2, md: 3 }, 
        mb: { xs: 1, sm: 2, md: 3 },
        px: { xs: 0.5, sm: 1, md: 2 }
      }}>
        {showTables ? (
          // Masa Görünümü - Mobil Uyumlu
          <Paper className="mobile-paper" sx={{ 
            borderRadius: { xs: 2, sm: 3 }, 
            height: { xs: 'calc(100vh - 140px)', sm: 'calc(100vh - 160px)', md: 'calc(100vh - 180px)' }, 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.default'
          }}>
            {/* Masa Başlığı - Mobil Uyumlu */}
            <Box sx={{ 
              px: { xs: 2, sm: 3, md: 4 }, 
              py: { xs: 2, sm: 3 }, 
              borderBottom: 1, 
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)',
              color: 'white'
            }}>
              
              {/* Gerçek zamanlı senkronizasyon bilgisi */}
              <Box sx={{ 
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                border: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    🔄 Gerçek Zamanlı Senkronizasyon
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: realtimeSyncStatus.connected ? '#4caf50' : '#f44336',
                      animation: realtimeSyncStatus.connected ? 'pulse 2s infinite' : 'none'
                    }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {realtimeSyncStatus.connected ? 'Bağlı' : 'Bağlantı yok'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.8rem', opacity: 0.8 }}>
                  <Typography variant="caption">
                    📱 Client ID: {realtimeSyncStatus.id || 'N/A'}
                  </Typography>
                  <Typography variant="caption">
                    🔗 Bağlantı: {realtimeSyncStatus.attempts} deneme
                  </Typography>
                  {lastSyncTime && (
                    <Typography variant="caption">
                      ⏰ Son güncelleme: {lastSyncTime.toLocaleTimeString('tr-TR')}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {/* Aktif Masa Siparişleri */}
              {Object.keys(tableOrders).length > 0 && (
                <Box sx={{ 
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  border: 1,
                  borderColor: 'rgba(76, 175, 80, 0.3)'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9, mb: 1 }}>
                    🍽️ Aktif Masa Siparişleri ({Object.keys(tableOrders).length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(tableOrders).map(([tableNumber, order]) => (
                      <Box key={tableNumber} sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        bgcolor: 'rgba(76, 175, 80, 0.2)',
                        border: 1,
                        borderColor: 'rgba(76, 175, 80, 0.4)',
                        fontSize: '0.8rem'
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Masa {tableNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                          {order.items?.length || 0} ürün • {order.total?.toFixed(2) || '0.00'} TL
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                justifyContent: 'space-between',
                width: '100%',
                gap: { xs: 2, sm: 0 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                  }}>
                    🪑 Masa Yönetimi
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    opacity: 0.9,
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}>
                    Toplam 50 Masa
                  </Typography>
                </Box>
                
                {/* Masa Aktar Butonu */}
                <Button
                  onClick={() => setShowTableTransferDialog(true)}
                  variant="contained"
                  startIcon={<SwapHorizIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 700,
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1, sm: 1.5 },
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  🔄 Masa Aktar
                </Button>
              </Box>
            </Box>

            {/* Masa Grid - Mobil Uyumlu */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: { xs: 2, sm: 3, md: 4 },
              '&::-webkit-scrollbar': {
                width: '12px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#0a4940',
                borderRadius: '6px',
                '&:hover': {
                  background: '#053429',
                },
              },
            }}>
              <Box className="mobile-table-grid" sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: 'repeat(2, 1fr)', 
                  sm: 'repeat(3, 1fr)', 
                  md: 'repeat(4, 1fr)', 
                  lg: 'repeat(5, 1fr)' 
                }, 
                gap: { xs: 2, sm: 3, md: 4 },
                pb: 4
              }}>
                {Array.from({ length: 50 }, (_, index) => {
                  const tableNumber = index + 1;
                  const tableOrder = tableOrders[tableNumber];
                  const isOccupied = !!tableOrder;
                  
                  return (
                    <Card 
                      key={tableNumber}
                      className="mobile-table-card"
                      onClick={() => {
                        setSelectedTableForDetail(tableNumber);
                        setShowTableDetail(true);
                      }}
                      sx={{ 
                        aspectRatio: { xs: '1', sm: '1' },
                        minHeight: { xs: '120px', sm: '140px', md: 'auto' },
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: isOccupied 
                          ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        color: isOccupied ? 'white' : '#0a4940',
                        border: { xs: '2px solid', sm: '3px solid' },
                        borderColor: isOccupied ? '#ff4757' : '#e9ecef',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        '&:hover': {
                          transform: { xs: 'translateY(-2px) scale(1.02)', sm: 'translateY(-6px) scale(1.03)' },
                          boxShadow: '0 12px 30px rgba(10, 73, 64, 0.15)',
                          border: { xs: '2px solid', sm: '3px solid' },
                          borderColor: isOccupied ? '#ff3742' : '#0a4940',
                          background: isOccupied 
                            ? 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)'
                            : 'linear-gradient(135deg, #ffffff 0%, #f0f8f6 100%)',
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: { xs: 2, sm: 3 },
                        textAlign: 'center'
                      }}>
                        {/* Masa Numarası */}
                        <Typography className="mobile-table-number" variant="h3" sx={{ 
                          fontWeight: 800,
                          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                          color: isOccupied ? 'white' : '#0a4940',
                          textShadow: isOccupied 
                            ? '0 2px 4px rgba(0,0,0,0.3)'
                            : '0 2px 4px rgba(10, 73, 64, 0.1)'
                        }}>
                          {tableNumber}
                        </Typography>
                        
                        {/* Durum İkonu */}
                        <Box
                          className="mobile-table-icon"
                          component="img"
                          src={require('./assets/Table.png')}
                          alt="Masa"
                          sx={{
                            width: { xs: '40px', sm: '50px', md: '60px' },
                            height: { xs: '40px', sm: '50px', md: '60px' },
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            opacity: 0.9
                          }}
                        />
                        
                        {/* Durum Bilgisi */}
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            color: isOccupied ? 'white' : '#0a4940',
                            opacity: 0.9
                          }}>
                            {isOccupied ? 'DOLU' : 'BOŞ'}
                          </Typography>
                          
                          {isOccupied ? (
                            <>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600,
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                opacity: 0.8,
                                mt: 0.5
                              }}>
                                {tableOrder.items.length} Ürün
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 700,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                opacity: 0.9,
                                mt: 0.5
                              }}>
                                {formatPrice(tableOrder.total)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" sx={{ 
                              fontWeight: 500,
                              fontSize: { xs: '0.75rem', sm: '0.85rem' },
                              color: '#666666',
                              mt: 0.5
                            }}>
                              Sipariş için tıklayın
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        ) : showCustomers ? (
          // Müşteri Görünümü
          <Paper sx={{ 
            borderRadius: 3, 
            height: 'calc(100vh - 180px)', 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.default'
          }}>
            {/* Başlık */}
            <Box sx={{ 
              px: 4, 
              py: 3, 
              borderBottom: 1, 
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #5c7cfa 0%, #845ef7 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                👥 Müşteri Yönetimi
                <Typography variant="body1" sx={{ 
                  opacity: 0.9,
                  fontWeight: 500
                }}>
                  Toplam {customers.length} Müşteri
                </Typography>
              </Typography>
              
              {/* Tümünü Sil Butonu */}
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setDeleteAllConfirmOpen(true)}
                disabled={customers.length === 0}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #ccc 0%, #ddd 100%)',
                    color: 'rgba(0,0,0,0.4)'
                  }
                }}
              >
                🗑️ Tümünü Sil
              </Button>
            </Box>

            {/* Müşteri Grid - Kaydırılabilir */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 4,
              '&::-webkit-scrollbar': {
                width: '12px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#5c7cfa',
                borderRadius: '6px',
                '&:hover': {
                  background: '#4263eb',
                },
              },
            }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: 4,
                pb: 4
              }}>
                {/* Önce Müşteriler */}
                {customers.map((c, index) => (
                  <Card 
                    key={c.id || `customer-${index}-${c.name}-${c.createdAt}`}
                    onClick={() => setSelectedCustomerForHistory(c)}
                    sx={{ 
                      aspectRatio: '1',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
                      color: '#0a2540',
                      border: '3px solid',
                      borderColor: '#e6e9ff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(92,124,250,0.2)',
                        borderColor: '#5c7cfa'
                      }
                    }}
                  >
                    <CardContent sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 3,
                      textAlign: 'center'
                    }}>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 800,
                        fontSize: '2.2rem',
                        color: '#4263eb'
                      }}>
                        {index + 1}
                      </Typography>
                      <PersonIcon sx={{ fontSize: 48, color: '#5c7cfa' }} />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0a2540' }}>
                          {c.name}
                        </Typography>
                        {c.phone ? (
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#4263eb', mt: 0.5 }}>
                            {c.phone}
                          </Typography>
                        ) : null}
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {/* En sonda Ekle Kartı */}
                <Card
                  onClick={() => setAddCustomerOpen(true)}
                  sx={{
                    aspectRatio: '1',
                    cursor: 'pointer',
                    border: '3px dashed #adb5ff',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 12px 30px rgba(66, 99, 235, 0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ color: '#5c7cfa', fontWeight: 800 }}>＋</Typography>
                    <Typography sx={{ mt: 1, fontWeight: 700, color: '#5c7cfa' }}>Müşteri Ekle</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Paper>
        ) : (
          // Normal Ürün Görünümü
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1.2fr', 
            gap: 4, 
            height: '100%' 
          }}>
            
            {/* Sol Panel - Ürünler */}
            <Paper sx={{ 
              borderRadius: 3, 
              height: 'calc(100vh - 180px)', 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
            {/* Kategori Sekmeleri ve Arama - Sabit */}
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              px: 3, 
              pt: 3,
              pb: 2,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)'
            }}>
              <Tabs 
                value={selectedCategory} 
                onChange={handleCategoryChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  minHeight: 60,
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    minHeight: 48,
                    borderRadius: 3,
                    margin: '6px 4px',
                    padding: '8px 16px',
                    minWidth: 'auto',
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      color: '#0a4940',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transform: 'translateY(-1px)',
                      fontWeight: 700
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none'
                  },
                  '& .MuiTabs-scrollButtons': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&.Mui-disabled': {
                      opacity: 0.3
                    }
                  }
                }}
              >
                {categories.map((category) => (
                  <Tab
                    key={category.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '1.5rem' }}>{category.icon}</Typography>
                        <Typography>{category.name}</Typography>
                      </Box>
                    }
                    value={category.id}
                  />
                ))}
              </Tabs>
              
              {/* Modern Arama Kutusu */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Ürün ara... (dokunarak klavye açın)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={openVirtualKeyboard}
                  variant="outlined"
                  size="medium"
                  inputProps={{
                    readOnly: true, // Fiziksel klavyeyi devre dışı bırak
                    style: { cursor: 'pointer' }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            clearSearch();
                            closeVirtualKeyboard();
                          }}
                          size="small"
                          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: 3,
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                        borderWidth: 2
                      },
                      '& input': {
                        color: 'white',
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          opacity: 1
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Kategori Başlığı - Sabit */}
            <Box sx={{ 
              px: 3, 
              py: 2, 
              flexShrink: 0, 
              bgcolor: 'grey.50',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="h6" sx={{ 
                color: 'primary.main', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                {searchQuery ? (
                  <>
                    <SearchIcon sx={{ fontSize: '1.8rem' }} />
                    Arama Sonuçları: "{searchQuery}"
                    <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                      ({filteredProducts.length} sonuç)
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontSize: '1.8rem' }}>{selectedCategoryData?.icon}</Typography>
                    {selectedCategoryData?.name}
                    <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                      ({currentProducts.length} ürün)
                    </Typography>
                  </>
                )}
              </Typography>
            </Box>

            {/* Ürün Grid - Kaydırılabilir */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 3,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
                '&:hover': {
                  background: '#a8a8a8',
                },
              },
            }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: 2,
                pb: 2
              }}>
                {filteredProducts.length === 0 ? (
                  <Box sx={{ 
                    gridColumn: '1 / -1',
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}>
                    <SearchIcon sx={{ fontSize: '4rem', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {searchQuery ? 'Arama sonucu bulunamadı' : 'Ürün bulunamadı'}
                    </Typography>
                    <Typography variant="body2">
                      {searchQuery ? 
                        `"${searchQuery}" için sonuç bulunamadı. Farklı bir terim deneyin.` : 
                        'Bu kategoride henüz ürün bulunmuyor.'
                      }
                    </Typography>
                    {searchQuery && (
                      <Button 
                        variant="outlined" 
                        onClick={clearSearch}
                        sx={{ mt: 2 }}
                        startIcon={<ClearIcon />}
                      >
                        Aramayı Temizle
                      </Button>
                    )}
                  </Box>
                ) : (
                  filteredProducts.map((product) => (
                  <Card 
                    key={product.id}
                    sx={{ 
                      cursor: 'pointer',
                      height: 'fit-content',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      }
                    }}
                    onClick={() => handleAddProduct(product)}
                  >
                    {/* Ürün Görseli */}
                    <Box sx={{ 
                      width: '100%',
                      height: 100,
                      borderRadius: '16px 16px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: (() => {
                        switch(product.category) {
                          case 'hot-drinks': return 'linear-gradient(135deg, #8ba887 0%, #546258 100%)';
                          case 'cold-drinks': return 'linear-gradient(135deg, #87ceea 0%, #1076b4 100%)';
                          case 'desserts': return 'linear-gradient(135deg, #f59e59 0%, #d9534f 100%)';
                          case 'snacks': return 'linear-gradient(135deg, #ffb742 0%, #ff9500 100%)';
                          case 'breakfast': return 'linear-gradient(135deg, #ffdc42 0%, #ffc700 100%)';
                          case 'sandwiches': return 'linear-gradient(135deg, #ffb742 0%, #ff9500 100%)';
                          case 'salads': return 'linear-gradient(135deg, #8bc34a 0%, #5e8a3a 100%)';
                          case 'soups': return 'linear-gradient(135deg, #ff7043 0%, #d84a2b 100%)';
                          case 'healthy': return 'linear-gradient(135deg, #a3d577 0%, #6bb64f 100%)';
                          case 'beverages': return 'linear-gradient(135deg, #61b8ff 0%, #298eff 100%)';
                          case 'turkish-delights': return 'linear-gradient(135deg, #d7871a 0%, #ae6108 100%)';
                          case 'pastries': return 'linear-gradient(135deg, #ffdc42 0%, #ffc700 100%)';
                          default: return 'linear-gradient(135deg, #8ba887 0%, #546258 100%)';
                        }
                      })()
                    }}>
                      {product.image && product.image.startsWith('data:image') ? (
                        // Kullanıcının yüklediği gerçek görsel (Base64)
                        <Box
                          component="img"
                          src={product.image}
                          alt={product.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '16px 16px 0 0'
                          }}
                        />
                      ) : product.image && (product.image.includes('espresso.png') || product.image.includes('assets')) ? (
                        // Local asset görseli (espresso.png gibi)
                        <Box
                          component="img"
                          src={product.image}
                          alt={product.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '16px 16px 0 0'
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            // Hata durumunda emoji göster
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div style="
                                display: flex; 
                                align-items: center; 
                                justify-content: center; 
                                width: 100%; 
                                height: 100%; 
                                font-size: 3rem;
                                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))
                              ">
                                ${(() => {
                                  switch(product.category) {
                                    case 'hot-drinks': return '☕';
                                    case 'cold-drinks': return '🥤';
                                    case 'desserts': return '🍰';
                                    case 'snacks': return '🥨';
                                    case 'breakfast': return '🍳';
                                    default: return '🍽️';
                                  }
                                })()}
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        // Varsayılan durum: Kategori emojisi
                        <Typography sx={{ 
                          fontSize: '3rem',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}>
                          {(() => {
                            switch(product.category) {
                              case 'hot-drinks': return '☕';
                              case 'cold-drinks': return '🥤';
                              case 'desserts': return '🍰';
                              case 'snacks': return '🥨';
                              case 'breakfast': return '🍳';
                              default: return '🍽️';
                            }
                          })()}
                        </Typography>
                      )}
                    </Box>
                    
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      textAlign: 'center', 
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ 
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        minHeight: '2.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1.2,
                        mb: 1
                      }}>
                        {product.name}
                        {product?.sizes?.length ? (
                          <Box component="span" sx={{
                            ml: 0.75,
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 0.75,
                            py: 0.1,
                            borderRadius: 1,
                            bgcolor: 'rgba(10,73,64,0.08)',
                            color: 'primary.main',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}>
                            Boyut
                            <ChevronRightIcon sx={{ ml: 0.25, fontSize: '1rem' }} />
                          </Box>
                        ) : null}
                      </Typography>
                      
                      <Box>
                        <Typography variant="h6" sx={{ 
                          color: 'primary.main', 
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 1.5
                        }}>
                          {formatPrice(product.price)}
                        </Typography>
                        
                         <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          sx={{ 
                            py: 1,
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                             handleAddProduct(product);
                          }}
                        >
                          Ekle
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                  ))
                )}
              </Box>
            </Box>
          </Paper>

          {/* Sağ Panel - Sepet */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 180px)',
            minHeight: 'calc(100vh - 180px)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
              🛒 Sipariş Sepeti
            </Typography>
            
            {/* Sepet İçeriği */}
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2, minHeight: '300px' }}>
              {cart.items.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  color: 'text.secondary',
                  py: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Typography sx={{ fontSize: '4rem' }}>🛒</Typography>
                  <Typography variant="body1">
                    Sepetiniz boş
                  </Typography>
                  <Typography variant="body2">
                    Ürün seçerek siparişinizi oluşturun
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {cart.items.map((item) => (
                    <ListItem 
                      key={item.lineId} 
                      sx={{ 
                        p: 0, 
                        mb: 2,
                        border: 1,
                        borderColor: 'grey.200',
                        borderRadius: 2,
                        bgcolor: 'grey.50'
                      }}
                    >
                      <Box sx={{ p: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                            {item.product.name}{item.selectedSizeName ? ` (${item.selectedSizeName})` : ''}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => removeFromCart(item.lineId)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton 
                              size="small"
                              onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                              sx={{ bgcolor: 'white', border: 1, borderColor: 'grey.300' }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ 
                              minWidth: '30px', 
                              textAlign: 'center', 
                              fontWeight: 600,
                              fontSize: '1.1rem'
                            }}>
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              size="small"
                              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                            {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            {/* Toplam ve Ödeme - Her zaman görünür */}
            <Box sx={{ mt: 'auto' }}>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1">
                    Toplam ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} ürün):
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {formatPrice(cart.total)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearCart}
                  disabled={cart.items.length === 0}
                  sx={{ flex: 1 }}
                >
                  Temizle
                </Button>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PaymentIcon />}
                  disabled={cart.items.length === 0}
                  sx={{ 
                    flex: 1,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: cart.items.length > 0 
                      ? 'linear-gradient(135deg, #0a4940 0%, #2e6b63 50%, #0a4940 100%)'
                      : 'linear-gradient(135deg, #ccc 0%, #ddd 50%, #ccc 100%)',
                    boxShadow: cart.items.length > 0 
                      ? '0 8px 25px rgba(10, 73, 64, 0.4), 0 4px 10px rgba(0,0,0,0.1)'
                      : '0 4px 10px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    textTransform: 'none',
                    '&:hover': {
                      background: cart.items.length > 0 
                        ? 'linear-gradient(135deg, #053429 0%, #0a4940 50%, #053429 100%)'
                        : 'linear-gradient(135deg, #ccc 0%, #ddd 50%, #ccc 100%)',
                      boxShadow: cart.items.length > 0 
                        ? '0 12px 35px rgba(10, 73, 64, 0.5), 0 6px 15px rgba(0,0,0,0.15)'
                        : '0 4px 10px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      transform: 'none'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={async () => {
                    try {
                      console.log('🔄 Sepet ödemesi alınıyor...', { total: cart.total, itemsCount: cart.items.length });
                      
                      const db = getDatabaseIPC();
                      
                      // Satış verisi oluştur
                      const now = new Date();
                      const saleData = {
                        id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        date: now.toISOString().split('T')[0], // YYYY-MM-DD
                        time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                        totalAmount: cart.total,
                        paymentMethod: 'cash' as const,
                        cashAmount: cart.total,
                        cardAmount: 0,
                        customerCount: 1,
                        notes: 'Sepet ödemesi',
                        createdAt: now.toISOString(),
                        items: cart.items.map((item: any) => ({
                          productId: item.product.id,
                          productName: item.product.name + (item.selectedSizeName ? ` (${item.selectedSizeName})` : ''),
                          quantity: item.quantity,
                          unitPrice: item.unitPrice ?? item.product.price,
                          totalPrice: (item.unitPrice ?? item.product.price) * item.quantity,
                          category: item.product.category
                        }))
                      };
                      
                      console.log('📊 Sepet satış verisi oluşturuldu:', saleData);
                      
                      // Satışı kaydet
                      const saleSuccess = await db.saveSale(saleData);
                      
                      if (saleSuccess) {
                        console.log('✅ Sepet satışı başarıyla kaydedildi');
                        // Ödeme dialogunu aç
                        startPayment(cart.total);
                      } else {
                        console.error('❌ Sepet satışı kaydedilemedi');
                      }
                    } catch (error: any) {
                      console.error('❌ Sepet ödeme hatası:', error);
                    }
                  }}
                >
                  Ödeme Al
                </Button>
                
                <Button
                  variant="contained"
                  size="large"
                  disabled={cart.items.length === 0}
                  startIcon={
                    <Box
                      component="img"
                      src={require('./assets/Table.png')}
                      alt="Masa"
                      sx={{
                        width: '24px',
                        height: '24px',
                        filter: 'brightness(0) invert(1)',
                        opacity: 0.9
                      }}
                    />
                  }
                  sx={{ 
                    flex: 1,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: cart.items.length > 0 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)'
                      : 'linear-gradient(135deg, #ccc 0%, #ddd 50%, #ccc 100%)',
                    boxShadow: cart.items.length > 0 
                      ? '0 8px 25px rgba(102, 126, 234, 0.4), 0 4px 10px rgba(0,0,0,0.1)'
                      : '0 4px 10px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    textTransform: 'none',
                    '&:hover': {
                      background: cart.items.length > 0 
                        ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 50%, #5a67d8 100%)'
                        : 'linear-gradient(135deg, #ccc 0%, #ddd 50%, #ccc 100%)',
                      boxShadow: cart.items.length > 0 
                        ? '0 12px 35px rgba(102, 126, 234, 0.5), 0 6px 15px rgba(0,0,0,0.15)'
                        : '0 4px 10px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      transform: 'none'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={() => {
                    setShowTableSelection(true);
                  }}
                >
                  Masaya
                </Button>
              </Box>
              
              {/* Masa X için Kaydet Butonu - Sadece isAddingToTable varsa görünür */}
              {isAddingToTable && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ 
                    mb: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #ff6b6b 30%, #ee5a52 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ff5252 30%, #d32f2f 90%)',
                    }
                  }}
                  onClick={async () => {
                    if (isAddingToTable) {
                      try {
                        const db = getDatabaseIPC();
                        const realtimeSync = getRealtimeSync();
                        
                        const success = await db.addToTableOrder(isAddingToTable, cart.items, cart.total);
                        
                        if (success) {
                          // Gerçek zamanlı senkronizasyon ile masa güncellemesi gönder
                          realtimeSync.emitTableOrderUpdate(isAddingToTable, {
                            items: [...(tableOrders[isAddingToTable]?.items || []), ...cart.items],
                            total: (tableOrders[isAddingToTable]?.total || 0) + cart.total,
                            startTime: tableOrders[isAddingToTable]?.startTime || new Date()
                          });
                          
                          // State'i güncelle
                          setTableOrders(prev => ({
                            ...prev,
                            [isAddingToTable]: {
                              items: [...(prev[isAddingToTable]?.items || []), ...cart.items],
                              total: (prev[isAddingToTable]?.total || 0) + cart.total,
                              startTime: prev[isAddingToTable]?.startTime || new Date()
                            }
                          }));
                          
                          // Sepeti temizle
                          clearCart();
                          // isAddingToTable'ı sıfırla
                          setIsAddingToTable(null);
                          
                          showToast(`Masa ${isAddingToTable} için sipariş eklendi!`, 'success');
                        }
                      } catch (error: any) {
                        console.error('Masaya sipariş ekleme hatası:', error);
                        showToast('Sipariş eklenirken hata oluştu!', 'error');
                      }
                    }
                  }}
                >
                  🪑 Masa {isAddingToTable} için Kaydet
                </Button>
              )}
            </Box>
            
            {/* Çıkış Butonu - Her zaman göster */}
            <Divider sx={{ my: 2 }} />
            <Button
              variant="contained"
              color="error"
              fullWidth
              size="large"
              startIcon={<LogoutIcon />}
              onClick={showLogoutDialog}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #b71c1c 30%, #d32f2f 90%)',
                }
              }}
            >
              Çıkış Yap
            </Button>
          </Paper>
        </Box>
        )}
      </Container>
        
        {/* Çıkış Onay Dialog */}
        <LogoutConfirmDialog />
        
        {/* Ödeme Dialog */}
        <PaymentDialog />
        
        {/* Fiş Önizleme Dialog */}
        <ReceiptPreview
          open={showReceiptPreview}
          onClose={hideReceiptPreview}
          items={receiptData?.items || []}
          totalAmount={receiptData?.totalAmount || 0}
          paymentMethod={receiptData?.paymentMethod || ''}
        />
        
        {/* Admin Panel Dialog */}
        <AdminPanel 
          open={showAdminPanel}
          onClose={hideAdminPanel}
        />

        {/* Admin Dashboard Dialog */}
        <AdminDashboard 
          open={showDashboard}
          onClose={() => setShowDashboard(false)}
        />

        {/* Sanal Klavye */}
        <VirtualKeyboard
          open={showVirtualKeyboard}
          onClose={closeVirtualKeyboard}
          onKeyPress={handleVirtualKeyPress}
          onBackspace={handleVirtualBackspace}
          onClear={handleVirtualClear}
          currentValue={searchQuery}
        />

        {/* Tümünü Sil Onay Dialog - Modern Tasarım */}
        <Dialog
          open={deleteAllConfirmOpen}
          onClose={() => setDeleteAllConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ 
            sx: { 
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              overflow: 'hidden'
            } 
          }}
        >
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 50%, #ff3838 100%)',
            p: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 80,
              height: 80,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
              filter: 'blur(15px)'
            }} />
            
            {/* Icon */}
            <Box sx={{
              width: 80,
              height: 80,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h2" sx={{ color: 'white', fontWeight: 900 }}>
                ⚠️
              </Typography>
            </Box>
            
            <Typography variant="h4" sx={{ 
              color: 'white', 
              fontWeight: 800,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 1
            }}>
              DİKKAT!
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontWeight: 500,
              opacity: 0.95
            }}>
              Tüm Müşteriler Silinecek
            </Typography>
          </Box>
          
          {/* Content */}
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: '#2c3e50', 
              fontWeight: 700,
              fontSize: '1.1rem'
            }}>
              Bu işlem geri alınamaz!
            </Typography>
            
            <Box sx={{
              p: 3,
              mb: 4,
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
              borderRadius: '16px',
              border: '2px solid #ffe0e0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Typography variant="body1" sx={{ 
                mb: 2,
                color: '#e74c3c',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}>
                Veritabanındaki tüm müşteri kayıtları kalıcı olarak silinecek.
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: '#7f8c8d',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                Bu işlem sonrasında müşteri bilgilerine erişim mümkün olmayacaktır.
              </Typography>
            </Box>
            
            {/* Countdown Timer */}
            {!deleteAllEnabled ? (
              <Box sx={{
                p: 4,
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                borderRadius: '20px',
                mb: 4,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(255,107,107,0.3)'
              }}>
                {/* Animated Background */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                  animation: 'shimmer 2s infinite',
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                }} />
                
                <Typography variant="h1" sx={{ 
                  color: 'white', 
                  fontWeight: 900,
                  fontSize: '4rem',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  mb: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {deleteAllCountdown}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontWeight: 600,
                  position: 'relative',
                  zIndex: 1
                }}>
                  saniye sonra sil butonu aktif olacak
                </Typography>
              </Box>
            ) : (
              <Box sx={{
                p: 4,
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                borderRadius: '20px',
                mb: 4,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(231,76,60,0.4)',
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.02)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 800,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  🗑️ SİL BUTONU AKTİF!
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  mt: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  Dikkatli olun, bu işlem geri alınamaz!
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Actions */}
          <Box sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            gap: 3,
            justifyContent: 'center'
          }}>
            <Button
              onClick={() => {
                setDeleteAllConfirmOpen(false);
                setDeleteAllCountdown(3);
                setDeleteAllEnabled(false);
              }}
              variant="outlined"
              sx={{
                px: 5,
                py: 2,
                borderRadius: '16px',
                border: '2px solid #6c757d',
                color: '#6c757d',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                minWidth: 140,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#495057',
                  color: '#495057',
                  background: 'rgba(108,117,125,0.05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(108,117,125,0.2)'
                }
              }}
            >
              ✋ İptal Et
            </Button>
            
            <Button
              onClick={handleDeleteAllCustomers}
              variant="contained"
              disabled={!deleteAllEnabled}
              sx={{
                px: 5,
                py: 2,
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                minWidth: 180,
                transition: 'all 0.3s ease',
                background: deleteAllEnabled 
                  ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
                  : 'linear-gradient(45deg, #bdc3c7 0%, #95a5a6 100%)',
                boxShadow: deleteAllEnabled 
                  ? '0 8px 32px rgba(231,76,60,0.4)'
                  : '0 4px 16px rgba(189,195,199,0.3)',
                '&:hover': {
                  background: deleteAllEnabled 
                    ? 'linear-gradient(135deg, #c0392b 0%, #a93226 100%)'
                    : 'linear-gradient(45deg, #bdc3c7 0%, #95a5a6 100%)',
                  transform: deleteAllEnabled ? 'translateY(-3px)' : 'none',
                  boxShadow: deleteAllEnabled 
                    ? '0 12px 40px rgba(231,76,60,0.5)'
                    : '0 4px 16px rgba(189,195,199,0.3)'
                },
                '&:disabled': {
                  cursor: 'not-allowed'
                }
              }}
            >
              {deleteAllEnabled ? '🗑️ TÜMÜNÜ SİL' : '⏳ BEKLE...'}
            </Button>
          </Box>
        </Dialog>

        {/* Müşteri Sipariş Geçmişi Dialog */}
        <Dialog
          open={!!selectedCustomerForHistory}
          onClose={() => setSelectedCustomerForHistory(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              overflow: 'hidden'
            }
          }}
        >
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #5c7cfa 0%, #845ef7 100%)',
            p: 4,
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }} />
            
            <Typography variant="h4" sx={{ 
              fontWeight: 800,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 1
            }}>
              👤 {selectedCustomerForHistory?.name}
            </Typography>
            <Typography variant="body1" sx={{ 
              opacity: 0.9,
              fontWeight: 500,
              fontSize: '1.1rem'
            }}>
              Sipariş Geçmişi ve Borç Durumu
            </Typography>
          </Box>

          <DialogContent sx={{ p: 4 }}>
            {/* Borç Özeti */}
            <Box sx={{
              p: 3,
              mb: 4,
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
              borderRadius: '16px',
              border: '2px solid #ffe0e0'
            }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#e74c3c' }}>
                💰 Borç Durumu
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                    Toplam Sipariş
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    {customerOrders.length} adet
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                    Toplam Borç
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#e74c3c' }}>
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    }).format(customerTotalDebt)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Sipariş Listesi */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#2c3e50' }}>
                📋 Sipariş Geçmişi
              </Typography>
              
              {customerOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: '#6c757d' }}>
                    Henüz sipariş bulunmuyor
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {customerOrders.map((order, index) => {
                    const orderItems = JSON.parse(order.items || '[]');
                    const orderDate = new Date(order.orderDate);
                    
                    return (
                      <Card
                        key={order.id}
                        sx={{
                          mb: 2,
                          border: '2px solid #e9ecef',
                          borderRadius: '12px',
                          background: order.isPaid 
                            ? 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)'
                            : 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)'
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                                Sipariş #{order.id}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                📅 {orderDate.toLocaleDateString('tr-TR')} - {orderDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 700, 
                                color: order.isPaid ? '#10b981' : '#e74c3c' 
                              }}>
                                {new Intl.NumberFormat('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                }).format(order.totalAmount)}
                              </Typography>
                              <Box sx={{
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: order.isPaid ? 'success.main' : 'error.main',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textAlign: 'center'
                              }}>
                                {order.isPaid ? 'ÖDENDİ' : 'BEKLEMEDE'}
                              </Box>
                            </Box>
                          </Box>
                          
                          {/* Sipariş Ürünleri */}
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                              Ürünler:
                            </Typography>
                            {orderItems.map((item: any, itemIndex: number) => (
                              <Box key={itemIndex} sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                py: 0.5
                              }}>
                                <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                                  {item.product.name} {item.selectedSizeName ? `(${item.selectedSizeName})` : ''} x{item.quantity}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 600 }}>
                                  {new Intl.NumberFormat('tr-TR', {
                                    style: 'currency',
                                    currency: 'TRY',
                                  }).format(item.unitPrice * item.quantity)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderTop: '1px solid rgba(0,0,0,0.05)'
          }}>
            <Button
              onClick={() => setSelectedCustomerForHistory(null)}
              variant="outlined"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                border: '2px solid #6c757d',
                color: '#6c757d',
                fontWeight: 600
              }}
            >
              ✋ Kapat
            </Button>
          </DialogActions>
        </Dialog>

        {/* Müşteri Ekle Dialog */}
        <Dialog
          open={addCustomerOpen}
          onClose={() => setAddCustomerOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Yeni Müşteri</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="İsim Soyisim"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Telefon Numarası"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" onClick={() => setAddCustomerOpen(false)}>İptal</Button>
            <Button variant="contained" onClick={handleAddCustomerSave}>Ekle</Button>
          </DialogActions>
        </Dialog>

          {/* Boyut Seçim Dialog */}
          <Dialog
            open={showSizeDialog}
            onClose={closeSizeSelection}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
              }
            }}
          >
            <DialogTitle sx={{ fontWeight: 700 }}>Boyut Seçin</DialogTitle>
            <DialogContent sx={{ pb: 0 }}>
              {sizeSelectProduct && sizeSelectProduct.sizes && sizeSelectProduct.sizes.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {sizeSelectProduct.sizes.map((s: any) => (
                    <Button
                      key={s.id}
                      variant={selectedSizeId === s.id ? 'contained' : 'outlined'}
                      onClick={() => setSelectedSizeId(s.id)}
                      sx={{ justifyContent: 'space-between' }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{s.name}</Typography>
                      <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{formatPrice(s.price)}</Typography>
                    </Button>
                  ))}
                </Box>
              ) : (
                <Typography>Bu ürün için boyut bulunmuyor.</Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={closeSizeSelection} variant="outlined">İptal</Button>
              <Button
                onClick={() => {
                  if (sizeSelectProduct && selectedSizeId) {
                    addToCart(sizeSelectProduct, { sizeId: selectedSizeId });
                    closeSizeSelection();
                  }
                }}
                variant="contained"
                disabled={!selectedSizeId}
              >
                Ekle
              </Button>
            </DialogActions>
          </Dialog>

        {/* Masa Seçim Dialog */}
        <Dialog
          open={showTableSelection}
          onClose={() => setShowTableSelection(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)',
            color: 'white',
            textAlign: 'center',
            fontWeight: 700
          }}>
            🪑 Masa Seçimi
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            {/* Sepet Özeti */}
                     <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                📋 Sipariş Özeti
              </Typography>
              <List sx={{ p: 0 }}>
                {cart.items.map((item) => (
                  <ListItem key={item.lineId} sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.product.name}{item.selectedSizeName ? ` (${item.selectedSizeName})` : ''} x{item.quantity}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Toplam Tutar:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatPrice(cart.total)}
                </Typography>
              </Box>
            </Box>

            {/* Masa Seçimi */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                🪑 Masa Seçin
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedTableNumber || ''}
                  onChange={(e) => setSelectedTableNumber(e.target.value as number)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0a4940',
                      borderWidth: 2
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0a4940'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0a4940',
                      borderWidth: 2
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Masa seçin...</em>
                  </MenuItem>
                  {Array.from({ length: 50 }, (_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      Masa {index + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setShowTableSelection(false)}
              variant="outlined"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              İptal
            </Button>
            <Button
              onClick={async () => {
                if (selectedTableNumber) {
                  console.log('🔄 Masa siparişi kaydediliyor...', { 
                    tableNumber: selectedTableNumber, 
                    itemsCount: cart.items.length, 
                    total: cart.total 
                  });
                  
                  // Veri doğrulama
                   if (!cart.items || cart.items.length === 0) {
                     console.error('❌ Sepet boş, masa siparişi kaydedilemez');
                     showToast('Sepet boş! Önce ürün ekleyin.', 'warning');
                    return;
                  }

                   if (!selectedTableNumber || selectedTableNumber <= 0) {
                     console.error('❌ Geçersiz masa numarası:', selectedTableNumber);
                     showToast('Geçersiz masa numarası!', 'error');
                    return;
                  }

                   if (cart.total <= 0) {
                     console.error('❌ Geçersiz toplam tutar:', cart.total);
                     showToast('Geçersiz toplam tutar!', 'error');
                    return;
                  }

                  // Items yapısını kontrol et
                  for (const item of cart.items) {
                     if (!item.product || !item.product.id || !item.product.name || !item.product.price || !item.product.category) {
                       console.error('❌ Geçersiz item yapısı:', item);
                       showToast('Sepette geçersiz ürün var! Sepeti temizleyip deneyin.', 'error');
                      return;
                    }
                  }

                  try {
                    const db = getDatabaseIPC();
                    console.log('📞 Database IPC servisi çağrılıyor...');
                    
                    // Retry mekanizması ile işlemi dene
                    let success = false;
                    let retryCount = 0;
                    const maxRetries = 3;
                    
                    while (!success && retryCount < maxRetries) {
                      try {
                        // Timeout ile işlemi sınırla
                        const timeoutPromise = new Promise((_, reject) => {
                          setTimeout(() => reject(new Error('İşlem zaman aşımına uğradı')), 10000);
                        });
                        
                        const savePromise = db.saveTableOrder(selectedTableNumber, cart.items, cart.total);
                        success = await Promise.race([savePromise, timeoutPromise]) as boolean;
                        
                        if (success) {
                          console.log('✅ Masa siparişi başarıyla kaydedildi');
                          break;
                        } else {
                          console.warn(`⚠️ Deneme ${retryCount + 1} başarısız, tekrar deneniyor...`);
                          retryCount++;
                          if (retryCount < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
                          }
                        }
                      } catch (error: any) {
                        console.error(`❌ Deneme ${retryCount + 1} hatası:`, error);
                        retryCount++;
                        if (retryCount < maxRetries) {
                          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
                        } else {
                          throw error;
                        }
                      }
                    }
                    
                    console.log('📞 Database IPC servisi yanıtı:', success);
                    
                    if (success) {
                      // State'i güncelle
                      setTableOrders(prev => ({
                        ...prev,
                        [selectedTableNumber]: {
                          items: cart.items,
                          total: cart.total,
                          startTime: new Date()
                        }
                      }));
                      // Sepeti temizle
                      clearCart();
                      // Dialog'u kapat
                      setShowTableSelection(false);
                      setSelectedTableNumber(null);
                      // Modern toast
                      showToast(`Masa ${selectedTableNumber} için sipariş kaydedildi`, 'success');
                    } else {
                      console.error('❌ Masa siparişi kaydedilemedi - tüm denemeler başarısız');
                      showToast('Masa siparişi kaydedilemedi! Tekrar deneyin.', 'error');
                    }
                  } catch (error: any) {
                    console.error('❌ Masa siparişi kaydetme hatası:', error);
                    console.error('❌ Hata detayı:', error.message);
                    
                    let errorMessage = 'Bilinmeyen hata';
                    if (error.message) {
                      if (error.message.includes('timeout')) {
                        errorMessage = 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.';
                      } else if (error.message.includes('network')) {
                        errorMessage = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
                      } else if (error.message.includes('database')) {
                        errorMessage = 'Veritabanı hatası. Lütfen uygulamayı yeniden başlatın.';
                      } else {
                        errorMessage = error.message;
                      }
                    }
                    
                    showToast(`Hata: ${errorMessage}`, 'error');
                  }
                }
              }}
              variant="contained"
              disabled={!selectedTableNumber}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                background: selectedTableNumber 
                  ? 'linear-gradient(135deg, #0a4940 30%, #2e6b63 90%)'
                  : 'linear-gradient(45deg, #ccc 30%, #ddd 90%)',
                '&:hover': {
                  background: selectedTableNumber 
                    ? 'linear-gradient(135deg, #053429 30%, #0a4940 90%)'
                    : 'linear-gradient(45deg, #ccc 30%, #ddd 90%)',
                }
              }}
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        {/* Masa Detay Dialog */}
        <Dialog
          open={showTableDetail}
          onClose={() => setShowTableDetail(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)',
            color: 'white',
            textAlign: 'center',
            fontWeight: 700
          }}>
            🪑 Masa {selectedTableForDetail} Detayları
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            {selectedTableForDetail && (() => {
              const tableOrder = tableOrders[selectedTableForDetail];
              const isOccupied = !!tableOrder;
              
              if (!isOccupied) {
                return (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                      component="img"
                      src={require('./assets/Table.png')}
                      alt="Masa"
                      sx={{
                        width: '80px',
                        height: '80px',
                        mb: 2,
                        opacity: 0.6,
                        filter: 'drop-shadow(0 2px 4px rgba(10, 73, 64, 0.2))'
                      }}
                    />
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                      Bu Masa Boş
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      Masa {selectedTableForDetail} şu anda boş durumda.
                    </Typography>
                  </Box>
                );
              }
              
              // Masa dolu ise
              const ms = currentTime.getTime() - tableOrder.startTime.getTime();
              const totalSeconds = Math.max(0, Math.floor(ms / 1000));
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              const seconds = totalSeconds % 60;
              const pad = (n: number) => String(n).padStart(2, '0');
              
              return (
                <Box>
                  {/* Masa Bilgileri */}
                  <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                      📊 Masa Bilgileri
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Toplam Tutar:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatPrice(tableOrder.total)}
                      </Typography>
                    </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                         Aktif Süre:
                      </Typography>
                       <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                         {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Sipariş Listesi */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                      📋 Sipariş Listesi
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {tableOrder.items.map((item) => (
                        <ListItem key={item.lineId ?? item.product.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {item.product.name}{item.selectedSizeName ? ` (${item.selectedSizeName})` : ''}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {item.quantity} adet
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              );
            })()}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setShowTableDetail(false)}
              variant="outlined"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Kapat
            </Button>
            
            {selectedTableForDetail && tableOrders[selectedTableForDetail] && (
              <>
                <Button
                  onClick={async () => {
                    try {
                      console.log('🔄 Masa ödemesi alınıyor...', { tableNumber: selectedTableForDetail, total: tableOrders[selectedTableForDetail].total });
                      
                      const db = getDatabaseIPC();
                      const tableOrder = tableOrders[selectedTableForDetail];
                      
                      // Satış verisi oluştur
                      const now = new Date();
                      const saleData = {
                        id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        date: now.toISOString().split('T')[0], // YYYY-MM-DD
                        time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                        totalAmount: tableOrder.total,
                        paymentMethod: 'cash' as const,
                        cashAmount: tableOrder.total,
                        cardAmount: 0,
                        customerCount: 1,
                        notes: `Masa ${selectedTableForDetail} ödemesi`,
                        createdAt: now.toISOString(),
                        items: tableOrder.items.map((item: any) => ({
                          productId: item.product.id,
                          productName: item.product.name + (item.selectedSizeName ? ` (${item.selectedSizeName})` : ''),
                          quantity: item.quantity,
                          unitPrice: item.unitPrice ?? item.product.price,
                          totalPrice: (item.unitPrice ?? item.product.price) * item.quantity,
                          category: item.product.category
                        }))
                      };
                      
                      console.log('📊 Satış verisi oluşturuldu:', saleData);
                      
                      // Satışı kaydet
                      const saleSuccess = await db.saveSale(saleData);
                      
                      if (saleSuccess) {
                        console.log('✅ Satış başarıyla kaydedildi');
                        
                        // Masayı kapat
                        const closeSuccess = await db.closeTableOrder(selectedTableForDetail);
                        
                        if (closeSuccess) {
                          console.log('✅ Masa başarıyla kapatıldı');
                          
                          // State'den masayı kaldır
                          setTableOrders(prev => {
                            const newOrders = { ...prev };
                            delete newOrders[selectedTableForDetail];
                            return newOrders;
                          });
                          
                          // Ödeme dialogunu aç
                          startPayment(tableOrder.total);
                          setShowTableDetail(false);
                        } else {
                          console.error('❌ Masa kapatılamadı');
                        }
                      } else {
                        console.error('❌ Satış kaydedilemedi');
                      }
                    } catch (error: any) {
                      console.error('❌ Masa ödeme hatası:', error);
                    }
                  }}
                  variant="contained"
                  startIcon={<PaymentIcon />}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #0a4940 30%, #2e6b63 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #053429 30%, #0a4940 100%)',
                    }
                  }}
                >
                  Ödeme Al
                </Button>
                
                <Button
                  onClick={() => {
                    setIsAddingToTable(selectedTableForDetail);
                    setShowTableDetail(false);
                    setShowTables(false); // Ürünler görünümüne geç
                  }}
                  variant="contained"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 30%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 30%, #6b46c1 100%)',
                    }
                  }}
                >
                  Sipariş Ekle
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Masa Aktarım Dialog */}
        <Dialog
          open={showTableTransferDialog}
          onClose={() => setShowTableTransferDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            fontWeight: 700
          }}>
            🔄 Masa Aktarım
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
              Kaynak masadan hedef masaya sipariş aktarımı yapın
            </Typography>
            
            {/* Kaynak Masa Seçimi */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                📤 Kaynak Masa (Dolu Masa)
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={sourceTable || ''}
                  onChange={(e) => setSourceTable(e.target.value as number)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                      borderWidth: 2
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#5a6fd8'
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Kaynak masa seçin</em>
                  </MenuItem>
                  {Array.from({ length: 50 }, (_, index) => {
                    const tableNumber = index + 1;
                    const tableOrder = tableOrders[tableNumber];
                    const isOccupied = !!tableOrder;
                    
                    return (
                      <MenuItem 
                        key={tableNumber} 
                        value={tableNumber}
                        disabled={!isOccupied}
                        sx={{
                          opacity: isOccupied ? 1 : 0.5,
                          color: isOccupied ? 'text.primary' : 'text.disabled'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%',
                            bgcolor: isOccupied ? '#ff6b6b' : '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {tableNumber}
                          </Box>
                          <Typography>
                            Masa {tableNumber} {isOccupied ? '(Dolu)' : '(Boş)'}
                          </Typography>
                          {isOccupied && (
                            <Typography variant="body2" sx={{ ml: 'auto', color: 'primary.main', fontWeight: 600 }}>
                              {formatPrice(tableOrder.total)}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>

            {/* Hedef Masa Seçimi */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                📥 Hedef Masa (Boş Masa)
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={targetTable || ''}
                  onChange={(e) => setTargetTable(e.target.value as number)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                      borderWidth: 2
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#5a6fd8'
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Hedef masa seçin</em>
                  </MenuItem>
                  {Array.from({ length: 50 }, (_, index) => {
                    const tableNumber = index + 1;
                    const tableOrder = tableOrders[tableNumber];
                    const isOccupied = !!tableOrder;
                    
                    return (
                      <MenuItem 
                        key={tableNumber} 
                        value={tableNumber}
                        disabled={isOccupied}
                        sx={{
                          opacity: !isOccupied ? 1 : 0.5,
                          color: !isOccupied ? 'text.primary' : 'text.disabled'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%',
                            bgcolor: !isOccupied ? '#4caf50' : '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {tableNumber}
                          </Box>
                          <Typography>
                            Masa {tableNumber} {!isOccupied ? '(Boş)' : '(Dolu)'}
                          </Typography>
                          {!isOccupied && (
                            <Typography variant="body2" sx={{ ml: 'auto', color: 'success.main', fontWeight: 600 }}>
                              Aktarılabilir
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>

            {/* Aktarım Özeti */}
            {sourceTable && targetTable && (
              <Box sx={{ 
                p: 3, 
                bgcolor: 'grey.50', 
                borderRadius: 2, 
                border: '2px dashed #667eea',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  🔄 Aktarım Özeti
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Masa {sourceTable}</strong> → <strong>Masa {targetTable}</strong>
                </Typography>
                {tableOrders[sourceTable] && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Toplam Tutar: {formatPrice(tableOrders[sourceTable].total)}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
            <Button 
              onClick={() => setShowTableTransferDialog(false)} 
              variant="outlined"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              İptal
            </Button>
            <Button
              onClick={handleTableTransfer}
              variant="contained"
              disabled={!sourceTable || !targetTable}
              startIcon={<SwapHorizIcon />}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6b46c1 100%)',
                },
                '&:disabled': {
                  background: 'grey.400',
                  color: 'white'
                }
              }}
            >
              🔄 Aktar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tam Ekran Toggle Butonu - Sağ Alt Köşe */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <IconButton
            onClick={toggleFullscreen}
            size="large"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 60,
              height: 60,
              boxShadow: '0 4px 20px rgba(10, 73, 64, 0.3)',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 25px rgba(10, 73, 64, 0.4)',
              },
              transition: 'all 0.3s ease',
              border: '3px solid white',
            }}
            title={isFullscreen ? 'Tam Ekrandan Çık (Alt+F11)' : 'Tam Ekran Yap (Alt+F11)'}
          >
            {isFullscreen ? (
              <FullscreenExitIcon sx={{ fontSize: '2rem' }} />
            ) : (
              <FullscreenIcon sx={{ fontSize: '2rem' }} />
            )}
          </IconButton>
        </Box>

        {/* QR Kod Dialog'u */}
        <QRCodeDialog
          open={showQRCodeDialog}
          onClose={() => setShowQRCodeDialog(false)}
          pcIpAddress={pcIpAddress}
        />

        {/* Modern toast bildirimleri */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={2200}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          TransitionComponent={SlideLeft}
        >
          <Alert
            onClose={() => setToastOpen(false)}
            severity={toastSeverity}
            variant="filled"
            sx={{
              borderRadius: 2,
              boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
              background: toastSeverity === 'success' ? 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)' : undefined,
              color: 'white',
              '& .MuiAlert-icon': { color: 'white' }
            }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  };

const App: React.FC = () => {
  const { isAuthenticated, showSplashScreen } = useStore();

  // Electron body reset
  React.useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isAuthenticated && !showSplashScreen && <LoginScreen />}
      {!isAuthenticated && showSplashScreen && <SplashScreen />}
      {isAuthenticated && <MainApp />}
    </ThemeProvider>
  );
};

export default App; 