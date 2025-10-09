const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const OTPService = require('./services/otpService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OTP Service
const otpService = new OTPService();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 OTP requests per windowMs
    message: {
        success: false,
        error: 'Too many OTP requests. Please try again later.',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 verification attempts per windowMs
    message: {
        success: false,
        error: 'Too many verification attempts. Please try again later.',
        retryAfter: 15 * 60
    }
});

// Routes

// Serve the demo page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Send OTP via SMS
app.post('/api/send-sms-otp', otpLimiter, async (req, res) => {
    try {
        const { phoneNumber, options = {} } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const result = await otpService.sendSMSOTP(phoneNumber, options);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Send OTP via Email
app.post('/api/send-email-otp', otpLimiter, async (req, res) => {
    try {
        const { email, options = {} } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email address is required'
            });
        }

        const result = await otpService.sendEmailOTP(email, options);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Verify OTP
app.post('/api/verify-otp', verifyLimiter, (req, res) => {
    try {
        const { identifier, otp } = req.body;
        
        if (!identifier || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Identifier and OTP are required'
            });
        }

        const result = otpService.verifyOTP(identifier, otp);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Resend SMS OTP
app.post('/api/resend-sms-otp', otpLimiter, async (req, res) => {
    try {
        const { phoneNumber, options = {} } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const result = await otpService.resendSMSOTP(phoneNumber, options);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Resend Email OTP
app.post('/api/resend-email-otp', otpLimiter, async (req, res) => {
    try {
        const { email, options = {} } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email address is required'
            });
        }

        const result = await otpService.resendEmailOTP(email, options);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get OTP status
app.get('/api/otp-status/:identifier', (req, res) => {
    try {
        const { identifier } = req.params;
        const result = otpService.getOTPStatus(identifier);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Service status endpoint
app.get('/api/service-status', (req, res) => {
    try {
        const status = otpService.getServiceStatus();
        res.json({
            success: true,
            status: status,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Test SMS service
app.post('/api/test-sms', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required for testing'
            });
        }

        const result = await otpService.testSMSService(phoneNumber);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Test Email service
app.post('/api/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email address is required for testing'
            });
        }

        const result = await otpService.testEmailService(email);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Debug endpoint (development only)
app.get('/api/debug', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
    }
    
    try {
        const debugInfo = otpService.getDebugInfo();
        res.json(debugInfo);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
    otpService.cleanupExpired();
    console.log('Expired OTPs cleaned up at', new Date().toISOString());
}, 5 * 60 * 1000);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 OTP Service running on port ${PORT}`);
    console.log(`📱 Demo page: http://localhost:${PORT}`);
    console.log(`🔧 API base: http://localhost:${PORT}/api`);
    console.log('');
    console.log('Service Status:', otpService.getServiceStatus());
});

module.exports = app;