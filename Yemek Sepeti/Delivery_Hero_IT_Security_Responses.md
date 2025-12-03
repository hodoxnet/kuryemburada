# Delivery Hero IT Security Questions - Kuryemburada Responses

**Date of Response:** December 2024

---

## 1. VENDOR BUSINESS INFORMATION

| Field | Response |
|-------|----------|
| **Company Name** | Hodox Bilişim |
| **Company Legal Name** | Hodox Bilişim ve Yazılım Hizmetleri Limited Şirketi |
| **Responder Name** | [Ömer Faruk Şenol] |
| **Responder Contact Information** | [0537 664 41 03 / hodoxcomtr@gmail.com] |
| **Date of Response** | December 2025 |
| **Company Website URL** | https://hodox.com.tr |
| **Service Website URL** | https://kuryemburada.com |

---

## 2. SERVICE HOSTING

### Please describe in detail your application or service

Kuryemburada is a courier operation management platform that connects restaurants/businesses with courier services for last-mile delivery. The platform enables:
- Restaurant/business order management
- Courier assignment and tracking
- Real-time order status updates
- Integration with food delivery platforms (Yemeksepeti/Delivery Hero)

### What technology languages/platforms/stacks/components are utilized?

| Layer | Technology |
|-------|------------|
| **Backend Framework** | NestJS v11 (Node.js/TypeScript) |
| **Frontend Framework** | Next.js 15 (React/TypeScript) |
| **Database** | PostgreSQL |
| **ORM** | Prisma v6 |
| **Authentication** | JWT (JSON Web Tokens) with Passport.js |
| **Cache** | Redis (cache-manager v7) |
| **Process Manager** | PM2 |
| **Web Server** | LiteSpeed + Apache (Reverse Proxy) |
| **SSL/TLS** | Let's Encrypt (Auto-renewal) |
| **API Documentation** | Swagger/OpenAPI |

### Is your service running from your own (a) data center, (b) the cloud, or (c) deployed-on premise only?

**(b) Cloud** - The service is hosted on a VPS (Virtual Private Server) with Plesk control panel.

### Which cloud providers do you rely on?

- Primary hosting provider with data center in Turkey
- Plesk for server management



### Which data centers/countries/geographies are you deployed in?

- Turkey only (single region deployment)

### Have you researched your cloud provider's best security practices?

Yes. We follow the hosting provider's security guidelines including:
- Regular security updates
- Firewall configuration
- SSL/TLS enforcement
- Access control policies

---

## 3. DATA PROTECTION & ACCESS CONTROLS

### 3.1 DATA CLASSIFICATION

#### Please describe the company/user data required to provide your service

| Data Type | Examples | Classification |
|-----------|----------|----------------|
| **Personal Information** | Customer name, phone number, delivery address | Confidential |
| **Business Data** | Restaurant information, order details | Internal |
| **Financial Data** | Order prices, payment status | Confidential |
| **Authentication Data** | Hashed passwords, JWT tokens | Restricted |
| **Location Data** | GPS coordinates for pickup/delivery | Confidential |

#### Data Classification Matrix

| Classification | Access Level | Encryption | Retention |
|----------------|--------------|------------|-----------|
| **Restricted** | System only | AES-256 | Minimum required |
| **Confidential** | Need-to-know basis | AES-256 | Per KVKK requirements |
| **Internal** | Authorized staff | In transit (TLS) | Business requirement |
| **Public** | Open access | N/A | Indefinite |

### 3.2 ENCRYPTION

#### Please describe your data encryption standard

- **Data in Transit:** TLS 1.2/1.3 for all HTTPS connections
- **Data at Rest:** PostgreSQL with encrypted storage
- **Passwords:** bcrypt hashing with salt (10 rounds)
- **JWT Tokens:** HS512 algorithm for Yemeksepeti integration, HS256 for internal auth
- **Sensitive Fields:** Application-level encryption for PII where applicable

#### How do you encrypt customer data?

- All API communications over HTTPS (TLS 1.2+)
- Database connections encrypted
- Passwords hashed using bcrypt (never stored in plaintext)
- JWT tokens for session management with expiration

### 3.3 DATA ACCESS & HANDLING

#### Are your employees accessing data on a 'need to know basis'?

Yes. Role-Based Access Control (RBAC) is implemented with three primary roles:
- **SUPER_ADMIN:** Full system access
- **COMPANY:** Access to own company data only
- **COURIER:** Access to assigned deliveries only

#### Do you have the capabilities to anonymize data?

Yes. Data anonymization can be implemented for:
- Customer phone numbers (masking)
- Delivery addresses (after retention period)
- Personal identifiers for analytics

#### Please describe your general rules management

- **Provisioning:** Access granted based on role assignment during user creation
- **De-provisioning:** Immediate revocation upon account deactivation/deletion
- **Recertification:** Quarterly review of access permissions

#### Which groups of staff have access to personal and sensitive data?

| Role | Access Level |
|------|--------------|
| System Administrators | Full database access |
| Support Staff | Read-only customer data |
| Developers | Development/staging environment only |

#### Do you keep sensitive data in hard copy?

No. All data is stored digitally. No paper copies of sensitive data are maintained.

#### Do you have a procedure for securely destroying hard copy sensitive data?

N/A - No hard copies are created.

#### Do you support secure deletion of archived or backed-up data?

Yes. Database records can be permanently deleted upon request (KVKK compliance).

#### Does customer data leave your production systems?

Only for:
- Database backups (encrypted)
- Integration with Yemeksepeti (required for service)

#### Are you using any external contractors and/or freelancers?

Currently, development is handled in-house. If external contractors are used:
- They use company-managed development environments
- Access via VPN with MFA
- No direct production access

### 3.4 REPORTING

#### Which audit trails and logs are kept?

| Log Type | Retention | Details |
|----------|-----------|---------|
| **Authentication Logs** | 90 days | Login attempts, JWT issuance |
| **API Access Logs** | 30 days | All API requests with timestamps |
| **Order Activity Logs** | 1 year | Status changes, assignments |
| **Admin Actions** | 1 year | User management, config changes |
| **Error Logs** | 30 days | Application errors, exceptions |

### 3.5 THIRD-PARTY DATA PROCESSING

#### Do you use any sub-processors for data processing purposes?

| Sub-processor | Purpose | Data Shared |
|---------------|---------|-------------|
| Yemeksepeti/Delivery Hero | Order integration | Order details, customer info |
| Hosting Provider | Infrastructure | All data (encrypted) |

#### How do your sub-processors comply with your standards?

- Contractual agreements in place
- Data processing agreements (DPA)
- Regular review of security practices

### 3.6 EU DATA PROCESSING

**N/A** - Service operates in Turkey only. No EU personal data is processed.

### 3.7 AUTHENTICATION

#### Do you have an internal password policy?

Yes.

| Requirement | Specification |
|-------------|---------------|
| Minimum Length | 8 characters |
| Complexity | Mixed case, numbers recommended |
| Expiration | No forced expiration (per NIST guidelines) |
| History | Last 5 passwords cannot be reused |

#### How are passwords hashed?

bcrypt with 10 salt rounds.

#### Do employees/contractors have the ability to remotely connect to production systems?

Yes, via SSH with key-based authentication.

#### Do you require MFA for employee user authentication?

Currently implementing. SSH access uses key-based authentication.

#### Do you support SSO/SAML for customer access?

Not currently. JWT-based authentication is used.

### 3.8 BACKUP

#### Is there any backup testing plan implemented?

Yes. Monthly backup restoration tests.

#### If backup data is stored using cloud providers, how is it protected from accidental deletion?

- Automated daily backups
- 7-day retention minimum
- Separate backup storage location

#### How long and where are backups stored?

| Backup Type | Retention | Location |
|-------------|-----------|----------|
| Daily Database | 7 days | Same datacenter, separate storage |
| Weekly Full | 30 days | Same datacenter |
| Monthly Archive | 90 days | Same datacenter |

#### Please describe how backups are protected

- Encrypted at rest
- Access restricted to system administrators
- Stored on separate storage from production

---

## 4. POLICIES & STANDARDS

### 4.1 MANAGEMENT PROGRAM

#### Do you have a formal Information Security Program?

In development. Key components:
- Access control policies
- Data handling procedures
- Incident response plan

#### Do you review your Information Security Policies at least once a year?

Yes, annual review planned.

#### Do you have a dedicated information security team?

Currently handled by development team. Dedicated security role planned.

### 4.2 POLICY EXECUTION

#### Do your policies align with industry standards?

Aligned with:
- KVKK (Turkish Personal Data Protection Law)
- OWASP security guidelines
- ISO-27001 principles (not certified)

### 4.3 BACKGROUND CHECKS

Background verification conducted for all employees as permitted by Turkish law.

### 4.4 CONFIDENTIALITY

All personnel sign confidentiality agreements as part of employment contract.

### 4.5 ACCEPTABLE USE

Acceptable Use Policy in place for all employees.

### 4.6 JOB CHANGES AND TERMINATION

Documented procedures include:
- Immediate access revocation upon termination
- Return of company assets
- Exit interview with security checklist

---

## 5. PROACTIVE SECURITY

### 5.1 INDEPENDENT THIRD-PARTY PENETRATION TESTING

#### Do you perform network security testing?

Planned for Q1 2025. Will include:
- External vulnerability scanning
- Internal network assessment

#### Do you perform application security testing?

Regular code reviews with security focus. Automated security scanning in development pipeline planned.

### 5.2 SECURITY AWARENESS

Security awareness program includes:
- Onboarding security training
- Secure coding practices documentation
- Regular security updates communication

---

## 6. VULNERABILITY MANAGEMENT & PATCHING

### 6.1 NETWORK/HOST VULNERABILITY MANAGEMENT

- Regular OS updates via package manager
- Plesk security advisor monitoring
- Manual security patch review

### 6.2 APPLICATION VULNERABILITY MANAGEMENT

- npm audit for dependency vulnerabilities
- Regular dependency updates
- GitHub Dependabot alerts

### 6.3 PRODUCTION PATCHING

- Critical patches: Within 7 days
- Security updates: Within 30 days
- Regular maintenance window: Weekly

### 6.4 BUG BOUNTY

Not currently implemented. Security issues can be reported to security contact.

### 6.5 ENDPOINT SECURITY - END USER

Development machines:
- Full disk encryption required
- Antivirus/antimalware
- Auto-lock enabled
- Firewall enabled

### 6.6 ENDPOINT SECURITY - PRODUCTION SERVER

- Firewall (iptables/Plesk Firewall)
- fail2ban for brute force protection
- Regular security updates
- Minimal exposed ports (80, 443, SSH)

---

## 7. INFRASTRUCTURE SECURITY

### 7.1 CONFIGURATION MANAGEMENT

- Standardized server configuration via Plesk
- Infrastructure as code principles followed
- Changes reviewed before production deployment

### 7.2 SECRETS MANAGEMENT

| Secret Type | Storage Method |
|-------------|----------------|
| Environment Variables | .env files (not in git) |
| API Keys | Environment variables |
| Database Credentials | Environment variables |
| JWT Secrets | Environment variables |

### 7.3 LOGS

All security events logged:
- Authentication attempts
- API access
- Error events
- Admin actions

### 7.4 NETWORK SECURITY

- HTTPS enforced for all traffic
- HTTP to HTTPS redirect
- Database not exposed to internet
- Internal services on localhost only

---

## 8. CRYPTOGRAPHY

### 8.1 CRYPTOGRAPHIC DESIGN

| Purpose | Algorithm |
|---------|-----------|
| Data in Transit | TLS 1.2/1.3 |
| Password Storage | bcrypt (10 rounds) |
| JWT Signing | HS256/HS512 |
| API Authentication | Bearer tokens |

### 8.2 KEY MANAGEMENT

- JWT secrets stored in environment variables
- Keys rotated on security incidents
- Separate keys for different environments

---

## 9. REACTIVE SECURITY

### 9.1 THREAT INTELLIGENCE

- Security mailing lists subscription
- npm security advisories
- GitHub security alerts

### 9.2 MONITORING

- PM2 monitoring for application health
- Error logging with Winston
- Alerting for critical errors

### 9.3 INCIDENT RESPONSE

Incident Response Plan includes:
1. Detection and identification
2. Containment
3. Eradication
4. Recovery
5. Post-incident review

### 9.4 INCIDENT COMMUNICATION

- Critical incidents: Within 24 hours notification
- Data breaches: Per KVKK requirements (72 hours)
- Regular incidents: Next business day

---

## 10. SOFTWARE SUPPLY CHAIN

### 10.1 SECURE SDLC

- Code reviews for all changes
- Security-focused PR reviews
- OWASP guidelines followed
- Input validation and sanitization

### 10.2 DEPLOYMENT PROCESSES

- Staging environment for testing
- Manual QA before production
- Rollback capability

### 10.3 DEPENDENCY MANAGEMENT

- package.json for dependency tracking
- Regular npm audit
- Automated vulnerability alerts via GitHub

---

## 11. COMPLIANCE

### 11.1 INTERNAL AUDITS

- Quarterly security reviews
- Access control audits
- Code security reviews

### 11.2 EXTERNAL AUDITS

External security audit planned for 2025.

### 11.3 CERTIFICATIONS

Currently working towards:
- KVKK compliance
- ISO 27001 alignment

### 11.4 PRIVACY

#### Do you share customer data with third parties?

Only with Yemeksepeti/Delivery Hero for order fulfillment (required for integration).

#### Privacy Policy URL

https://kuryemburada.com/privacy (to be published)

#### Customer data deletion requests

- Handled via support request
- Completed within 30 days per KVKK

---

## 12. CUSTOMER-FACING APPLICATION SECURITY

### 12.1 AUTHENTICATION

- JWT-based authentication
- Password complexity requirements enforced
- Token expiration: 7 days (access), 30 days (refresh)
- Refresh token rotation

### 12.2 ROLE-BASED ACCESS CONTROL

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Full system access |
| COMPANY | Own company data, create orders |
| COURIER | Assigned deliveries, own profile |

### 12.3 AUDIT LOGGING

- All authentication events logged
- Order status changes tracked
- Admin actions recorded
- Logs available via admin panel

### 12.4 DATA RETENTION

- Active data: Retained while account active
- Deleted accounts: Data removed within 30 days
- Order history: Per KVKK requirements

### 12.5 CHANGE MANAGEMENT

- Version control via Git
- Changelog maintained
- Release notes for significant changes

### 12.6 API MANAGEMENT

- Rate limiting implemented
- API keys stored in environment variables
- Bearer token authentication
- CORS properly configured

---

## 13. BCM/DR CAPABILITIES

### Business Continuity / Disaster Recovery Plan

- Daily automated backups
- Backup restoration tested monthly
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours

### Recovery Strategy

1. Identify incident scope
2. Restore from latest backup
3. Verify data integrity
4. Resume operations
5. Post-incident review

---

## 14. SUPPORTING DOCUMENTATION

### Available Documents

- [ ] Application Penetration Testing Report (Planned Q1 2025)
- [x] API Documentation (Swagger/OpenAPI)
- [ ] Information Security Policy Document
- [ ] ISO Certifications

### Notes

This document represents the current state of security practices at Kuryemburada. We are committed to continuous improvement of our security posture and welcome feedback from Delivery Hero's security team.

---

**Document Version:** 1.0
**Last Updated:** December 2024
**Next Review:** March 2025
