import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.reputai',
  appName: 'ReputAí',
  webDir: 'dist',
  server: {
    url: 'https://3f3c9702-c066-4463-8167-2e2ebc94c4f6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
