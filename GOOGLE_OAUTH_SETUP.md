# Google OAuth Setup Guide - Fix Access Block Issues

## 🔍 **Understanding the Error**

The `Error 403: disallowed_useragent` occurs when Google blocks OAuth requests that don't comply with their "Use secure browsers" policy.

## 🛠️ **Solutions**

### **1. Update Supabase OAuth Configuration**

#### **In Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Click on **Google**
4. Update the configuration:

```javascript
// Required settings
Client ID: [Your Google Client ID]
Client Secret: [Your Google Client Secret]

// Additional settings
Redirect URL: https://[your-project-ref].supabase.co/auth/v1/callback
```

#### **Authorized Domains:**
Add these to your Google OAuth configuration:
- `https://[your-project-ref].supabase.co`
- `https://[your-domain].vercel.app` (if using Vercel)
- `http://localhost:3000` (for development)

### **2. Google Cloud Console Configuration**

#### **Step 1: Update OAuth Consent Screen**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **OAuth consent screen**
4. Add your domain to **Authorized domains**
5. Add your app's privacy policy and terms of service URLs

#### **Step 2: Update OAuth 2.0 Client IDs**
1. Go to **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client ID
3. Click **Edit**
4. Add these **Authorized redirect URIs**:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   https://[your-domain].vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

#### **Step 3: Enable Required APIs**
1. Go to **APIs & Services** > **Library**
2. Enable these APIs:
   - Google+ API
   - Google Identity and Access Management (IAM) API
   - People API

### **3. Environment Variables**

Make sure your environment variables are properly set:

```bash
# .env.local
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

### **4. Code Updates**

#### **Updated OAuth Configuration:**
```javascript
const signInWithGoogle = () => supabase.auth.signInWithOAuth({ 
  provider: 'google',
  options: {
    redirectTo: window.location.origin,
    queryParams: {
      prompt: 'select_account',
      access_type: 'offline'
    }
  }
});
```

### **5. Testing**

#### **Test in Different Environments:**
1. **Development**: `http://localhost:3000`
2. **Production**: Your deployed domain
3. **Mobile**: If using mobile app, ensure proper redirect URIs

#### **Common Test Scenarios:**
- ✅ Incognito/Private browsing
- ✅ Different browsers (Chrome, Firefox, Safari)
- ✅ Mobile browsers
- ✅ Different Google accounts

### **6. Troubleshooting**

#### **If Still Getting Access Block:**

1. **Check User Agent:**
   - Ensure you're using a standard browser
   - Avoid in-app browsers or WebViews

2. **Clear Browser Data:**
   - Clear cookies and cache
   - Try incognito mode

3. **Check Google Account:**
   - Ensure the Google account isn't restricted
   - Check if 2FA is properly configured

4. **Domain Verification:**
   - Verify your domain in Google Search Console
   - Add domain to OAuth consent screen

#### **For Mobile Apps:**
1. Use system browser instead of WebView
2. Implement proper deep linking
3. Handle OAuth callbacks correctly

### **7. Security Best Practices**

1. **HTTPS Only**: Always use HTTPS in production
2. **Valid Redirect URIs**: Only allow necessary redirect URIs
3. **State Parameter**: Implement CSRF protection
4. **Error Handling**: Handle OAuth errors gracefully

## 🚨 **Emergency Fixes**

### **If Users Can't Sign In:**

1. **Temporary Workaround**: Use guest sign-in
2. **Alternative**: Implement email/password authentication
3. **Fallback**: Use other OAuth providers (GitHub, Discord)

### **Contact Google Support:**
If the issue persists, contact Google Cloud Support with:
- Error details
- User agent information
- OAuth configuration
- Steps to reproduce

## 📞 **Support**

For additional help:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google Cloud Console](https://console.cloud.google.com/) 