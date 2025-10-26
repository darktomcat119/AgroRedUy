# 📧 Email Verification Setup Guide

## Overview
Email verification is now implemented in the AgroRedUy backend. Users will receive verification emails when they register, and welcome emails when they verify their accounts.

## 🔧 Configuration

### 1. Environment Variables
Add these to your `.env` file:

```env
# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@agrored.uy"
FRONTEND_URL="http://localhost:3000"
```

### 2. Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS`

### 3. Alternative Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_SECURE=false
```

#### Yahoo
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT=587
SMTP_SECURE=false
```

#### Custom SMTP
```env
SMTP_HOST="your-smtp-server.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-username"
SMTP_PASS="your-password"
```

## 🧪 Testing

### 1. Test Email Service
```bash
node test-email.js
```

### 2. Test Registration Flow
1. Register a new user
2. Check email for verification link
3. Click verification link
4. Check for welcome email

## 📧 Email Templates

### Verification Email
- **Subject**: "Verifica tu email - AgroRedUy"
- **Content**: Professional HTML template with verification link
- **Expires**: 24 hours

### Welcome Email
- **Subject**: "¡Bienvenido a AgroRedUy!"
- **Content**: Welcome message with platform features
- **Sent**: After successful verification

## 🔍 Troubleshooting

### Common Issues

#### 1. "Authentication failed"
- Check SMTP credentials
- Ensure 2FA is enabled for Gmail
- Use app password, not regular password

#### 2. "Connection timeout"
- Check SMTP_HOST and SMTP_PORT
- Verify firewall settings
- Try different SMTP server

#### 3. "Email not received"
- Check spam folder
- Verify email address is correct
- Check SMTP logs in console

### Debug Mode
Enable detailed logging:
```env
LOG_LEVEL="debug"
```

## 🚀 Production Setup

### 1. Use Professional Email Service
- **SendGrid**: Professional email delivery
- **Mailgun**: Reliable email API
- **Amazon SES**: AWS email service

### 2. Environment Variables for Production
```env
NODE_ENV=production
SMTP_HOST="your-production-smtp.com"
SMTP_USER="production-email@yourdomain.com"
SMTP_PASS="secure-production-password"
SMTP_FROM="noreply@yourdomain.com"
FRONTEND_URL="https://yourdomain.com"
```

### 3. Email Templates Customization
Edit `src/services/email.service.ts` to customize:
- Email templates
- Styling
- Content
- Branding

## 📱 Frontend Integration

### 1. Email Verification Page
Create `/verify-email` page to handle verification links.

### 2. API Endpoints
- `POST /api/v1/auth/verify-email` - Verify email with token
- `POST /api/v1/auth/resend-verification` - Resend verification email

### 3. User Experience
- Show verification status in user profile
- Redirect to verification page if email not verified
- Allow resending verification emails

## 🔒 Security Considerations

1. **Token Expiration**: Verification tokens expire in 24 hours
2. **Rate Limiting**: Prevent spam with rate limits
3. **Email Validation**: Validate email format before sending
4. **Secure SMTP**: Use TLS/SSL for email transmission

## 📊 Monitoring

### 1. Email Delivery Tracking
- Monitor email sending success/failure rates
- Track verification completion rates
- Log email delivery issues

### 2. User Analytics
- Track email verification completion
- Monitor user engagement with emails
- Analyze email template effectiveness

## 🎯 Next Steps

1. **Configure SMTP settings** in your `.env` file
2. **Test email service** with `node test-email.js`
3. **Test registration flow** with a real email
4. **Customize email templates** for your brand
5. **Set up production email service** for deployment

---

**Need Help?** Check the logs in `logs/combined.log` for detailed error messages.
