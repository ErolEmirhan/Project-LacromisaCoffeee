import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Print as PrintIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptPreviewProps {
  open: boolean;
  onClose: () => void;
  items: ReceiptItem[];
  totalAmount: number;
  paymentMethod: string;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  open,
  onClose,
  items,
  totalAmount,
  paymentMethod
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('tr-TR'),
      time: now.toLocaleTimeString('tr-TR')
    };
  };

  const { date, time } = getCurrentDateTime();

  const handlePrint = () => {
    // Print fonksiyonalitesi buraya eklenebilir
    console.log('Fiş yazdırılıyor...');
    // Gerçek uygulamada window.print() veya özel print API kullanılabilir
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <Box sx={{ 
          bgcolor: 'success.light', 
          borderRadius: '50%', 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ReceiptIcon sx={{ fontSize: '2rem', color: 'success.dark' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Ödeme Başarılı!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fiş Önizlemesi
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Paper sx={{ 
          p: 3, 
          bgcolor: 'grey.50', 
          border: '2px dashed #ccc',
          borderRadius: 2
        }}>
          {/* Fiş Başlığı */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src={require('../assets/Logo.png')}
              alt="Makara Logo"
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                mx: 'auto',
                mb: 1,
                boxShadow: '0 2px 8px rgba(217, 67, 134, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.8)'
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Makara
            </Typography>
            <Typography variant="body2" color="text.secondary">
              POS Satış Fişi
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Tarih ve Saat */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">
              <strong>Tarih:</strong> {date}
            </Typography>
            <Typography variant="body2">
              <strong>Saat:</strong> {time}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Ürün Listesi */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Ürün</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Adet</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Fiyat</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{formatPrice(item.price)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatPrice(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />

          {/* Toplam ve Ödeme Bilgileri */}
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Toplam Ürün:</strong> {items.reduce((sum, item) => sum + item.quantity, 0)} adet
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'primary.main', 
              fontWeight: 700,
              fontSize: '1.2rem'
            }}>
              <strong>TOPLAM: {formatPrice(totalAmount)}</strong>
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Ödeme Yöntemi:</strong> {paymentMethod}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ödeme Durumu: <span style={{ color: '#e91e63', fontWeight: 600 }}>✓ Başarılı</span>
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" sx={{ 
            textAlign: 'center', 
            display: 'block',
            color: 'text.secondary'
          }}>
                          Makara POS Sistemi
            <br />
            Bizi tercih ettiğiniz için teşekkür ederiz!
          </Typography>
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          startIcon={<CloseIcon />}
          sx={{ 
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Kapat
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          size="large"
          startIcon={<PrintIcon />}
          sx={{ 
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #d94386 30%, #e36ba3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #053429 30%, #d94386 90%)',
            }
          }}
        >
          Yazdır
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptPreview; 