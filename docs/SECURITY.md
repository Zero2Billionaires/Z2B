# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Z2B, please send an email to security@z2b.com. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

### What to Include

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Best Practices

### Environment Variables

**NEVER** commit sensitive information to the repository:
- API keys
- Database passwords
- JWT secrets
- Payment gateway credentials

Always use environment variables:
```bash
# .env file (add to .gitignore)
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key
```

### Authentication & Authorization

1. **Password Hashing**
   - Use bcrypt with cost factor of 10+
   - Never store plain-text passwords
   - Implement password complexity requirements

2. **JWT Tokens**
   - Use strong secrets (256-bit minimum)
   - Set appropriate expiration times
   - Implement token refresh mechanism
   - Store tokens securely (httpOnly cookies)

3. **Session Management**
   - Implement session timeout
   - Regenerate session IDs after login
   - Secure session storage

### Input Validation

1. **Server-Side Validation**
   - Validate all user inputs
   - Use parameterized queries for database
   - Sanitize HTML inputs
   - Validate file uploads

2. **XSS Prevention**
   - Escape user-generated content
   - Use Content Security Policy (CSP)
   - Sanitize data before rendering

3. **SQL Injection Prevention**
   - Use prepared statements
   - Use ORM (Mongoose, Sequelize)
   - Validate and sanitize inputs

### Database Security

1. **MongoDB**
   ```javascript
   // Use Mongoose schema validation
   const userSchema = new mongoose.Schema({
     email: {
       type: String,
       required: true,
       validate: {
         validator: function(v) {
           return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
         }
       }
     }
   });
   ```

2. **MySQL**
   ```php
   // Use prepared statements
   $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
   $stmt->execute(['email' => $email]);
   ```

### API Security

1. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   app.use('/api/', limiter);
   ```

2. **CORS Configuration**
   ```javascript
   const cors = require('cors');

   app.use(cors({
     origin: ['https://yourdomain.com'],
     credentials: true,
     optionsSuccessStatus: 200
   }));
   ```

3. **Helmet.js**
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

### File Upload Security

1. **Validate File Types**
   ```javascript
   const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
   if (!allowedTypes.includes(file.mimetype)) {
     throw new Error('Invalid file type');
   }
   ```

2. **Limit File Size**
   ```javascript
   const maxSize = 5 * 1024 * 1024; // 5MB
   if (file.size > maxSize) {
     throw new Error('File too large');
   }
   ```

3. **Scan for Malware**
   - Use antivirus scanning for uploads
   - Store files outside webroot
   - Generate random filenames

### HTTPS/TLS

1. **Use HTTPS Everywhere**
   - Obtain SSL/TLS certificates (Let's Encrypt)
   - Redirect HTTP to HTTPS
   - Use HSTS headers

2. **Strong TLS Configuration**
   ```nginx
   ssl_protocols TLSv1.2 TLSv1.3;
   ssl_ciphers HIGH:!aNULL:!MD5;
   ssl_prefer_server_ciphers on;
   ```

### Dependency Management

1. **Regular Updates**
   ```bash
   npm audit
   npm audit fix
   npm outdated
   ```

2. **Use npm audit**
   - Run `npm audit` regularly
   - Fix critical and high vulnerabilities immediately
   - Keep dependencies up to date

3. **Lock Dependencies**
   - Use `package-lock.json`
   - Review dependency changes
   - Use tools like Snyk or Dependabot

### Logging & Monitoring

1. **Security Logging**
   - Log authentication attempts
   - Log access to sensitive data
   - Log API requests
   - Never log sensitive data (passwords, tokens)

2. **Error Handling**
   ```javascript
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).send({
       error: 'Something went wrong',
       // Don't expose error details in production
     });
   });
   ```

### MLM-Specific Security

1. **Commission Calculations**
   - Use server-side calculations only
   - Implement transaction logging
   - Add audit trails
   - Prevent commission manipulation

2. **Payment Security**
   - Use PCI-DSS compliant gateways
   - Never store credit card details
   - Implement 2FA for withdrawals
   - Add transaction limits

3. **Genealogy Protection**
   - Prevent tree manipulation
   - Validate sponsor relationships
   - Log all tree changes
   - Implement placement rules

### Code Security

1. **Code Reviews**
   - Review all pull requests
   - Check for security issues
   - Verify input validation
   - Check for hardcoded secrets

2. **Static Analysis**
   ```bash
   # ESLint security plugin
   npm install --save-dev eslint-plugin-security

   # Run security checks
   npm run lint:security
   ```

### Deployment Security

1. **Environment Separation**
   - Separate dev, staging, production
   - Different credentials for each
   - Limit production access

2. **Server Hardening**
   - Disable unnecessary services
   - Configure firewall (ufw, iptables)
   - Use fail2ban for brute-force protection
   - Regular security updates

3. **Database Security**
   - Use strong passwords
   - Limit network access
   - Regular backups
   - Encrypt sensitive data

### Incident Response

1. **Preparation**
   - Have incident response plan
   - Maintain security contacts
   - Regular security training

2. **Detection**
   - Monitor logs
   - Set up alerts
   - Regular security audits

3. **Response**
   - Isolate affected systems
   - Preserve evidence
   - Notify affected users
   - Document incident

## Security Checklist

- [ ] All environment variables are set
- [ ] SSL/TLS certificates are configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] SQL injection protection is in place
- [ ] XSS protection is enabled
- [ ] CSRF tokens are implemented
- [ ] Authentication is secure (bcrypt + JWT)
- [ ] File uploads are validated
- [ ] Dependencies are up to date
- [ ] Security headers are configured (Helmet.js)
- [ ] Error handling doesn't expose sensitive info
- [ ] Logging is configured properly
- [ ] Backups are automated
- [ ] 2FA is available for admins
- [ ] Commission calculations are server-side only
- [ ] Payment gateway is PCI-DSS compliant

## Compliance

### GDPR Compliance

- Obtain user consent
- Implement data portability
- Right to be forgotten
- Data breach notification
- Privacy policy

### Payment Card Industry (PCI) Compliance

- Use PCI-DSS compliant payment gateways
- Never store credit card details
- Use tokenization
- Regular security audits

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [PHP Security Guide](https://www.php.net/manual/en/security.php)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

## Contact

For security concerns, contact: security@z2b.com

---

**Security is everyone's responsibility. Stay vigilant!**
