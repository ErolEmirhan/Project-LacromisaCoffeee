import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { 
  ExitToApp as LogoutIcon,
  Warning as WarningIcon 
} from '@mui/icons-material';
import { useStore } from '../store/useStore';

const LogoutConfirmDialog: React.FC = () => {
  const { showLogoutConfirm, hideLogoutDialog, confirmLogout } = useStore();

  return (
    <Dialog
      open={showLogoutConfirm}
      onClose={hideLogoutDialog}
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
        pb: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <Box sx={{ 
          bgcolor: 'warning.light', 
          borderRadius: '50%', 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <WarningIcon sx={{ fontSize: '2rem', color: 'warning.dark' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Çıkış Yapmak İstediğinizden Emin misiniz?
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pt: 1 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          Çıkış yaptığınızda mevcut sepetinizdeki tüm ürünler silinecektir.
        </Typography>
        <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 500 }}>
          Bu işlem geri alınamaz!
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pt: 2 }}>
        <Button
          onClick={hideLogoutDialog}
          variant="outlined"
          size="large"
          sx={{ 
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          İptal
        </Button>
        <Button
          onClick={confirmLogout}
          variant="contained"
          color="error"
          size="large"
          startIcon={<LogoutIcon />}
          sx={{ 
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #b71c1c 30%, #d32f2f 90%)',
            }
          }}
        >
          Çıkış Yap
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutConfirmDialog; 