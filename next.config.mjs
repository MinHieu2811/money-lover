/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    // Will only be available on the server side
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'secret',
    privateKey: process.env.PRIVATE_KEY || '', // Pass through env variables
    clientId: process.env.CLIENT_ID || '',
    clientEmail: process.env.CLIENT_EMAIL || '',
    spreadsheetId: process.env.SPREADSHEET_ID || '',
    spreadsheetConfigId: process.env.SPREADSHEET_USER_CONFIG || ''
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
};

export default nextConfig;
