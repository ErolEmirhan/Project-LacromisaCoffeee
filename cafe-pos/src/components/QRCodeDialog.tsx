import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { Close as CloseIcon, QrCode as QrCodeIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import QRCode from 'react-qr-code';

interface QRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  pcIpAddress: string;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ open, onClose, pcIpAddress }) => {
  const qrCodeValue = `http://${pcIpAddress}:3000`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeValue);
      // Başarılı kopyalama mesajı gösterilebilir
    } catch (error) {
      console.error('Link kopyalanamadı:', error);
    }
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
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #d94386 0%, #e36ba3 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QrCodeIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            📱 Telefon Bağlantısı
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ 
            color: 'white',
            '&:hover': { 
              bgcolor: 'rgba(255,255,255,0.1)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#d94386' }}>
          Telefonunuzdan bu QR kodu okutun
        </Typography>

        {/* QR Kod */}
        <Paper
          elevation={8}
          sx={{
            p: 3,
            m: '0 auto',
            width: 'fit-content',
            borderRadius: 3,
            background: 'white',
            border: '3px solid #d94386'
          }}
        >
          <QRCode
            value={qrCodeValue}
            size={200}
            level="H"
            fgColor="#d94386"
            bgColor="white"
            style={{
              borderRadius: 8,
              padding: 8
            }}
          />
        </Paper>

        {/* Bağlantı Bilgileri */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(217, 67, 134, 0.05)', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: '#d94386' }}>
            🔗 Bağlantı Adresi
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 2,
            p: 2,
            bgcolor: 'white',
            borderRadius: 2,
            border: '2px solid #e9ecef'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#d94386',
                wordBreak: 'break-all'
              }}
            >
              {qrCodeValue}
            </Typography>
            
            <Tooltip title="Linki kopyala">
              <IconButton
                onClick={handleCopyLink}
                size="small"
                sx={{
                  bgcolor: 'rgba(217, 67, 134, 0.1)',
                  color: '#d94386',
                  '&:hover': {
                    bgcolor: 'rgba(217, 67, 134, 0.2)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Kullanım Talimatları */}
        <Box sx={{ mt: 3, textAlign: 'left' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#d94386' }}>
            📋 Nasıl Bağlanılır?
          </Typography>
          
          <Box component="ol" sx={{ pl: 3, color: '#666' }}>
            <li>Telefonunuzu PC ile aynı Wi-Fi ağına bağlayın</li>
            <li>Telefon kamerasını açın ve QR kodu okutun</li>
            <li>Veya tarayıcıda yukarıdaki linki açın</li>
            <li>Artık telefonunuzdan masa siparişi ekleyebilirsiniz!</li>
          </Box>
        </Box>

        {/* Güvenlik Notu */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: 'rgba(76, 175, 80, 0.1)', 
          borderRadius: 2,
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>
            🔒 Güvenlik: Bu bağlantı sadece yerel ağınızda çalışır, dış internet erişimi yoktur.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          sx={{
            bgcolor: '#d94386',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#083a32',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(217, 67, 134, 0.3)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Tamam
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDialog;

