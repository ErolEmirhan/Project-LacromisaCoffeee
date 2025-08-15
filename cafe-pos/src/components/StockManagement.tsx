import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useStore } from '../store/useStore';
import stockService from '../services/stockService';

interface StockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: Date;
  category: string;
}

const StockManagement: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { products } = useStore();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Stok verilerini yükle
  useEffect(() => {
    if (open) {
      loadStockData();
    }
  }, [open, products]);

  const loadStockData = () => {
    setLoading(true);
    
    // Tüm ürünler için stok başlat
    stockService.initializeAllProductsStock(products);
    
    // Mevcut ürünlerden stok verisi oluştur
    const stockData: StockItem[] = products.map(product => {
      const stockStatus = stockService.getStockStatus(product.id);
      
      return {
        id: product.id,
        name: product.name,
        currentStock: stockStatus.current,
        minStock: stockStatus.min,
        maxStock: stockStatus.max,
        unit: 'adet',
        lastUpdated: new Date(),
        category: product.category || 'Genel'
      };
    });

    setStockItems(stockData);
    setLoading(false);
  };

  // Stok güncelle
  const updateStock = (productId: string, newAmount: number) => {
    stockService.updateProductStock(productId, newAmount);
    
    const updatedStock = stockItems.map(item => {
      if (item.id === productId) {
        const stockStatus = stockService.getStockStatus(productId);
        return {
          ...item,
          currentStock: stockStatus.current,
          minStock: stockStatus.min,
          maxStock: stockStatus.max,
          lastUpdated: new Date()
        };
      }
      return item;
    });
    
    setStockItems(updatedStock);
  };

  // Stok ekle
  const addStock = (productId: string, amount: number = 1) => {
    stockService.increaseStock(productId, amount);
    const item = stockItems.find(item => item.id === productId);
    if (item) {
      updateStock(productId, item.currentStock + amount);
    }
  };

  // Stok çıkar (satış)
  const removeStock = (productId: string, amount: number = 1) => {
    if (stockService.decreaseStock(productId, amount)) {
      const item = stockItems.find(item => item.id === productId);
      if (item) {
        updateStock(productId, item.currentStock - amount);
      }
    }
  };

  // Stok durumuna göre renk
  const getStockColor = (current: number, min: number, max: number) => {
    if (current <= min) return 'error';
    if (current <= min * 1.5) return 'warning';
    return 'success';
  };

  // Stok durumuna göre icon
  const getStockIcon = (current: number, min: number) => {
    if (current <= min) return <WarningIcon color="error" />;
    if (current <= min * 1.5) return <WarningIcon color="warning" />;
    return <CheckCircleIcon color="success" />;
  };

  // Stok yüzdesi
  const getStockPercentage = (current: number, max: number) => {
    return Math.min(100, (current / max) * 100);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <InventoryIcon />
        📦 Stok Takibi
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Stokları Yenile">
          <IconButton onClick={loadStockData} sx={{ color: 'white' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>Stok verileri yükleniyor...</Typography>
          </Box>
        ) : (
          <>
            {/* Stok Özeti */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                📊 Stok Özeti
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {stockItems.filter(item => item.currentStock > item.minStock).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Yeterli Stok
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {stockItems.filter(item => item.currentStock <= item.minStock * 1.5 && item.currentStock > item.minStock).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Düşük Stok
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main" fontWeight="bold">
                      {stockItems.filter(item => item.currentStock <= item.minStock).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kritik Stok
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Stok Listesi */}
            <Grid container spacing={2}>
              {stockItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{
                    border: 2,
                    borderColor: `${getStockColor(item.currentStock, item.minStock, item.maxStock)}.main`,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main' }}>
                          {item.name}
                        </Typography>
                        {getStockIcon(item.currentStock, item.minStock)}
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" fontWeight="bold" color={getStockColor(item.currentStock, item.minStock, item.maxStock)}>
                          {item.currentStock} {item.unit}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Kalan stok miktarı
                        </Typography>
                      </Box>

                      {/* Stok Bar */}
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={getStockPercentage(item.currentStock, item.maxStock)}
                          color={getStockColor(item.currentStock, item.minStock, item.maxStock)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {getStockPercentage(item.currentStock, item.maxStock).toFixed(1)}% dolu
                        </Typography>
                      </Box>

                      {/* Stok Bilgileri */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Min: {item.minStock} | Max: {item.maxStock}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Son güncelleme: {item.lastUpdated.toLocaleString('tr-TR')}
                        </Typography>
                      </Box>

                      {/* Stok Kontrolleri */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Stok Ekle">
                          <IconButton
                            size="small"
                            onClick={() => addStock(item.id, 1)}
                            sx={{ bgcolor: 'success.light', color: 'white', '&:hover': { bgcolor: 'success.main' } }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Stok Çıkar">
                          <IconButton
                            size="small"
                            onClick={() => removeStock(item.id, 1)}
                            sx={{ bgcolor: 'error.light', color: 'white', '&:hover': { bgcolor: 'error.main' } }}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Kategori */}
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{ mt: 1, bgcolor: 'primary.light', color: 'white' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Uyarı Mesajları */}
            {stockItems.filter(item => item.currentStock <= item.minStock).length > 0 && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  ⚠️ {stockItems.filter(item => item.currentStock <= item.minStock).length} ürün kritik stok seviyesinde!
                  Lütfen stok takviyesi yapın.
                </Typography>
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Kapat
        </Button>
        <Button onClick={loadStockData} variant="contained" startIcon={<RefreshIcon />}>
          Stokları Yenile
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockManagement;
