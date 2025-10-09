# 🔐 Complete OTP System

A comprehensive One-Time Password (OTP) generation, validation, and delivery system built with Node.js. This system provides secure OTP functionality with SMS and email delivery, featuring a complete web API and demo interface.

## ✨ Features

### Core OTP Functionality
- **Secure OTP Generation**: Cryptographically secure random OTP generation
- **Configurable Length**: Support for 4-10 digit OTPs
- **Alphanumeric Support**: Optional alphanumeric OTPs for higher entropy
- **Expiration Management**: Configurable expiration times (1-60 minutes)
- **Attempt Limiting**: Configurable maximum verification attempts
- **Automatic Cleanup**: Expired OTPs are automatically removed

### SMS Integration
- **Twilio Integration**: Production-ready SMS delivery via Twilio
- **Mock Mode**: Testing without actual SMS costs
- **Phone Validation**: International phone number format validation
- **Custom Messages**: Customizable SMS message templates
- **Delivery Status**: Track SMS delivery status

### Email Integration
- **SMTP Support**: Works with any SMTP provider (Gmail, Outlook, Yahoo, custom)
- **HTML Templates**: Beautiful, responsive HTML email templates
- **Mock Mode**: Testing without sending actual emails
- **Email Validation**: Email address format validation
- **Custom Branding**: Customizable app name, company name, and logos

### Security Features
- **Rate Limiting**: Prevents OTP spam and brute force attacks
- **In-Memory Storage**: Secure, temporary OTP storage
- **Attempt Tracking**: Prevents brute force attacks
- **Secure Generation**: Uses Node.js crypto for secure randomness

### API & Testing
- **RESTful API**: Complete REST API for all OTP operations
- **Demo Interface**: Beautiful web interface for testing
- **Comprehensive Tests**: Extensive test suite covering all functionality
- **Debug Tools**: Built-in debugging and monitoring endpoints

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Start the application
npm start
```

### 2. Access the Demo

Open your browser and go to: `http://localhost:3000`

The demo interface provides:
- SMS OTP testing
- Email OTP testing  
- OTP verification
- Service status monitoring
- Debug information

### 3. Basic Usage

The system works in **mock mode** by default, so you can test immediately without configuring external services.

## 📱 SMS Configuration (Optional)

To enable real SMS sending via Twilio:

### 1. Get Twilio Credentials
1. Sign up at [Twilio](https://www.twilio.com)
2. Get your Account SID, Auth Token, and phone number

### 2. Configure Environment
```bash
# .env file
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 📧 Email Configuration (Optional)

To enable real email sending:

### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

```bash
# .env file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=Your App Name
```

### Other Email Providers
See `.env.example` for configurations for Outlook, Yahoo, and custom SMTP servers.

## 🔧 API Reference

### Base URL: `http://localhost:3000/api`

### Send SMS OTP
```http
POST /send-sms-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "options": {
    "appName": "My App",
    "expiryMinutes": 5,
    "length": 6
  }
}
```

### Send Email OTP
```http
POST /send-email-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "options": {
    "appName": "My App",
    "expiryMinutes": 5,
    "companyName": "My Company"
  }
}
```

### Verify OTP
```http
POST /verify-otp
Content-Type: application/json

{
  "identifier": "+1234567890",
  "otp": "123456"
}
```

### Resend OTP
```http
POST /resend-sms-otp
POST /resend-email-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "options": {}
}
```

### Get OTP Status
```http
GET /otp-status/{identifier}
```

### Service Status
```http
GET /service-status
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Categories
- **Unit Tests**: Core OTP functionality
- **Integration Tests**: Service integration
- **Performance Tests**: Load and performance testing
- **Memory Tests**: Memory management and cleanup

### Manual Testing
Use the web demo at `http://localhost:3000` to manually test all functionality.

## 📁 Project Structure

```
├── app.js                 # Main Express application
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── README.md            # This documentation
│
├── utils/
│   └── otp.js           # Core OTP generation and validation
│
├── services/
│   ├── sms.js           # SMS service (Twilio integration)
│   ├── email.js         # Email service (SMTP integration)
│   └── otpService.js    # Main OTP service combining all functionality
│
├── public/
│   └── index.html       # Demo web interface
│
└── test/
    └── otp.test.js      # Comprehensive test suite
```

## 🔧 Configuration Options

### OTP Configuration
```javascript
{
  length: 6,              // OTP length (4-10)
  expiryMinutes: 5,       // Expiration time (1-60)
  maxAttempts: 3,         // Maximum verification attempts
  allowAlphanumeric: false // Use alphanumeric OTPs
}
```

### SMS Options
```javascript
{
  appName: 'Your App',           // App name in SMS
  expiryMinutes: 5,              // Expiry time mentioned in SMS
  customMessage: 'Custom {otp}'  // Custom message template
}
```

### Email Options
```javascript
{
  appName: 'Your App',
  companyName: 'Your Company',
  expiryMinutes: 5,
  customSubject: 'Your verification code',
  logoUrl: 'https://yourlogo.com/logo.png'
}
```

## 🔒 Security Best Practices

### Implemented Security Measures
- **Rate Limiting**: Prevents OTP request spam
- **Attempt Limiting**: Prevents brute force attacks
- **Secure Generation**: Cryptographically secure random generation
- **Automatic Expiration**: OTPs expire automatically
- **Input Validation**: All inputs are validated

### Recommended Additional Security
- **HTTPS Only**: Always use HTTPS in production
- **Database Storage**: Use Redis or database for OTP storage in production
- **Audit Logging**: Log all OTP operations
- **IP Whitelisting**: Limit API access by IP if needed

## 🌐 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure real SMS/Email credentials
3. Use a process manager (PM2, forever)
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Use Redis for OTP storage (recommended)

### Redis Integration (Optional)
For production, consider replacing in-memory storage with Redis:

```javascript
// Example Redis integration
const redis = require('redis');
const client = redis.createClient();

// Modify OTPManager to use Redis
storeOTP(identifier, otp, options) {
    const expirySeconds = options.expiryMinutes * 60;
    client.setex(`otp:${identifier}`, expirySeconds, JSON.stringify({
        otp,
        attempts: 0,
        maxAttempts: options.maxAttempts
    }));
}
```

## 📊 Monitoring & Debug

### Debug Endpoints
- `GET /api/debug` - System debug information
- `GET /health` - Health check endpoint
- `GET /api/service-status` - Service configuration status

### Logging
The application logs:
- OTP generation events
- Validation attempts
- SMS/Email delivery results
- Errors and warnings

## 🤝 Integration Examples

### React Integration
```javascript
const sendOTP = async (phoneNumber) => {
  const response = await fetch('/api/send-sms-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });
  return response.json();
};

const verifyOTP = async (identifier, otp) => {
  const response = await fetch('/api/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otp })
  });
  return response.json();
};
```

### Express.js Integration
```javascript
const OTPService = require('./services/otpService');
const otpService = new OTPService();

app.post('/auth/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  const result = await otpService.sendSMSOTP(phoneNumber);
  res.json(result);
});

app.post('/auth/verify', (req, res) => {
  const { phoneNumber, otp } = req.body;
  const result = otpService.verifyOTP(phoneNumber, otp);
  res.json(result);
});
```

## 🐛 Troubleshooting

### Common Issues

**SMS not sending:**
- Check Twilio credentials in `.env`
- Verify phone number format (+1234567890)
- Check Twilio account balance
- Ensure phone number is verified in Twilio (trial accounts)

**Email not sending:**
- Check SMTP credentials
- For Gmail, ensure App Password is used (not regular password)
- Check firewall/network restrictions on SMTP ports
- Verify "Less secure app access" settings if needed

**OTP not validating:**
- Check identifier matches exactly (phone/email)
- Ensure OTP hasn't expired
- Verify maximum attempts not exceeded
- Check for case sensitivity issues

### Getting Help
1. Check the demo interface service status
2. Review console logs for detailed error messages
3. Use debug endpoints for system information
4. Run the test suite to identify issues

## 📄 License

MIT License - feel free to use in your projects!

## 🙏 Contributing

Contributions welcome! Please feel free to submit issues and enhancement requests.

---

**Need help?** Check the demo interface at `http://localhost:3000` for interactive testing and troubleshooting!

# RetailerPro — Quick Deploy & Troubleshooting

This file contains short instructions to push changes to GitHub, verify GitHub Pages deployment, and resolve a common issue where the service worker keeps serving a cached (old) version of the app.

## Push your local changes (PowerShell)
Run these commands from the project folder:

```powershell
cd "C:\Users\SIBO\OneDrive\Desktop\New folder"
git add .
git commit -m "Bump SW cache, remove manifest screenshots, harden validation"
git push origin main
```

If your branch is not `main` or `origin` isn't set, replace `main` with your branch name or add the remote:

```powershell
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Verify GitHub Actions & Pages
1. On GitHub, open the repository → **Actions** → confirm the Pages workflow run succeeded.
2. Open **Settings** → **Pages** and confirm the published site URL.
3. Open the published URL and verify `index.html` shows the new content.

## If the site still shows the old version (service worker cache)
Browsers may keep serving cached assets via the service worker. To force the browser to fetch the new files:

Developer approach (recommended for you):
1. Open the site in Chrome.
2. Press F12 to open DevTools.
3. Go to the **Application** tab → **Service Workers**.
4. Click **Unregister** for the service worker.
5. With DevTools open, enable **Network** → check **Disable cache** and reload the page.

User approach:
- Open the site in an Incognito/Private window (fresh profile) — it won't use the previous service worker.

After the service worker is unregistered, the page should load the new assets. Because the service worker cache name was bumped and it calls `skipWaiting()`/`clients.claim()`, subsequent navigations should pick up the new SW automatically.

## Contact / Next steps
- After pushing, tell me the repository URL or paste the Actions run link and I will re-verify the live site and run a final PWA check.

---
Generated: October 7, 2025
