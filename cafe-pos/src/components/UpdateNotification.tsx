import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  SystemUpdate as UpdateIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

interface UpdateInfo {
  version: string;
  releaseNotes?: string;
  releaseDate?: string;
}

interface DownloadProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-updater'ı başlat
    // @ts-ignore
    window.electronAPI?.updater?.init?.();

    // Güncelleme mevcut
    // @ts-ignore
    window.electron?.ipcRenderer?.on('update-available', (info: UpdateInfo) => {
      console.log('Güncelleme mevcut:', info);
      setUpdateInfo(info);
      setUpdateAvailable(true);
    });

    // İndirme ilerlemesi
    // @ts-ignore
    window.electron?.ipcRenderer?.on('download-progress', (progress: DownloadProgress) => {
      console.log('İndirme ilerlemesi:', progress.percent);
      setDownloadProgress(progress);
    });

    // İndirme tamamlandı
    // @ts-ignore
    window.electron?.ipcRenderer?.on('update-downloaded', () => {
      console.log('Güncelleme indirildi');
      setDownloading(false);
      setUpdateReady(true);
    });

    // Hata
    // @ts-ignore
    window.electron?.ipcRenderer?.on('update-error', (message: string) => {
      console.error('Güncelleme hatası:', message);
      setError(message);
      setDownloading(false);
    });

    return () => {
      // Cleanup listeners
      // @ts-ignore
      window.electron?.ipcRenderer?.removeAllListeners('update-available');
      // @ts-ignore
      window.electron?.ipcRenderer?.removeAllListeners('download-progress');
      // @ts-ignore
      window.electron?.ipcRenderer?.removeAllListeners('update-downloaded');
      // @ts-ignore
      window.electron?.ipcRenderer?.removeAllListeners('update-error');
    };
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    setError(null);
    // @ts-ignore
    window.electronAPI?.updater?.download?.();
  };

  const handleInstall = () => {
    // @ts-ignore
    window.electronAPI?.updater?.install?.();
  };

  const handleClose = () => {
    setUpdateAvailable(false);
    setUpdateInfo(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Güncelleme mevcut dialog - ZORUNLU GÜNCELLEME
  if (updateAvailable && !downloading && !updateReady) {
    return (
      <Dialog 
        open={true} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return false;
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <UpdateIcon />
          ⚠️ Zorunlu Güncelleme!
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Bu güncelleme zorunludur. Uygulamaya devam etmek için güncellemeyi indirmeniz gerekmektedir.
          </Alert>
          <Typography variant="h6" gutterBottom>
            Yeni Versiyon: {updateInfo?.version}
          </Typography>
          {updateInfo?.releaseNotes && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(217, 67, 134, 0.05)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {updateInfo.releaseNotes}
              </Typography>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            Güncelleme tamamlanana kadar uygulama kullanılamayacaktır.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button
            onClick={handleDownload}
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            sx={{
              background: 'linear-gradient(135deg, #d94386 0%, #e36ba3 100%)',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #b8356d 0%, #d94386 100%)'
              }
            }}
          >
            Güncellemeyi İndir ve Kur
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // İndirme devam ediyor - KAPATMA YOK
  if (downloading) {
    return (
      <Dialog 
        open={true} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return false;
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #d94386 0%, #e36ba3 100%)',
          color: 'white'
        }}>
          Güncelleme İndiriliyor...
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {downloadProgress && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {downloadProgress.percent.toFixed(1)}%
                </Typography>
                <Typography variant="body2">
                  {formatBytes(downloadProgress.transferred)} / {formatBytes(downloadProgress.total)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={downloadProgress.percent}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #d94386 0%, #e91e63 100%)'
                  }
                }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                {formatBytes(downloadProgress.bytesPerSecond)}/s
              </Typography>
            </>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Güncelleme hazır
  if (updateReady) {
    return (
      <Dialog open={true} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <CheckIcon />
          Güncelleme Hazır!
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Güncelleme başarıyla indirildi. Yüklemek için uygulamayı yeniden başlatmanız gerekiyor.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Lütfen tüm işlemlerinizi kaydedin. Uygulama yeniden başlatılacak.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleInstall}
            variant="contained"
            startIcon={<UpdateIcon />}
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
              }
            }}
          >
            Şimdi Yeniden Başlat
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return null;
};

export default UpdateNotification;

