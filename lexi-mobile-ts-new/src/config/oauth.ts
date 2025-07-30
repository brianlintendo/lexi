import * as AuthSession from 'expo-auth-session';

// Google OAuth configuration
export const GOOGLE_OAUTH_CONFIG = {
  clientId: '225655256510-dgiaf37loi11npo93a98nf2bmu0dtj34.apps.googleusercontent.com', // Replace with your Google Client ID
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'lexi',
    path: 'auth-callback'
  }),
  scopes: ['openid', 'profile', 'email'],
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  // Additional configuration for better compatibility
  responseType: 'code',
  additionalParameters: {
    prompt: 'select_account'
  }
};

// Instructions for setting up Google OAuth:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable Google+ API
// 4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
// 5. Choose "Android" or "iOS" as application type
// 6. Add your app's bundle identifier
// 7. Copy the Client ID and replace 'your-google-client-id.apps.googleusercontent.com' above
// 8. Add the redirect URI to your Google OAuth configuration 