import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'Makara POS',
    executableName: 'makara-pos',
    extraResource: [
      './app-update.yml'
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'makara_pos',
      setupExe: 'Makara POS Setup.exe',
<<<<<<< HEAD
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({})
  ],
  hooks: {
    postMake: async (config, makeResults) => {
      // Her platform için
      for (const makeResult of makeResults) {
        const { artifacts } = makeResult;
        const outputDir = path.dirname(artifacts[0]);
        
        // Sadece Windows için çalıştır
        if (makeResult.platform === 'win32') {
          const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
          const version = packageJson.version;
          
          // .nupkg dosyasını bul
          const nupkgFile = artifacts.find(f => f.endsWith('.nupkg') && f.includes('full'));
          
          if (nupkgFile) {
            const nupkgFileName = path.basename(nupkgFile);
            const nupkgStats = fs.statSync(nupkgFile);
            
            // SHA512 hesapla
            const sha512 = crypto.createHash('sha512');
            const fileBuffer = fs.readFileSync(nupkgFile);
            sha512.update(fileBuffer);
            const sha512Hash = sha512.digest('base64');
            
            // latest.yml oluştur
            const latestYml = `version: ${version}
files:
  - url: ${nupkgFileName}
    sha512: ${sha512Hash}
    size: ${nupkgStats.size}
path: ${nupkgFileName}
sha512: ${sha512Hash}
releaseDate: '${new Date().toISOString()}'
`;
            
            const latestYmlPath = path.join(outputDir, 'latest.yml');
            fs.writeFileSync(latestYmlPath, latestYml);
            console.log('✅ latest.yml oluşturuldu:', latestYmlPath);
            
            // RELEASES dosyası oluştur (Squirrel.Windows için)
            const releasesContent = `${sha512Hash} ${nupkgFileName} ${nupkgStats.size}`;
            const releasesPath = path.join(outputDir, 'RELEASES');
            fs.writeFileSync(releasesPath, releasesContent);
            console.log('✅ RELEASES oluşturuldu:', releasesPath);
            
            // Artifacts'e ekle ki publish edilsin
            makeResult.artifacts.push(latestYmlPath, releasesPath);
            
            // Root dizine de kopyala (geliştirme için)
            fs.copyFileSync(latestYmlPath, './latest.yml');
            console.log('✅ latest.yml root dizine kopyalandı');
          }
        }
      }
      
      return makeResults;
    }
  },
=======
    }), 
    new MakerZIP({}, ['darwin']), 
    new MakerRpm({}), 
    new MakerDeb({})
  ],
>>>>>>> 5b16f35879bb5f671cce61b42ed62cfa910037a2
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'ErolEmirhan',
          name: 'Project-LacromisaCoffeee'
        },
        prerelease: false,
        draft: false
      }
    }
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
