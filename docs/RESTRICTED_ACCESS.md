# Restricted Access Control - Implementation Guide

## Overview

The Decision Integrity Engine now implements **restricted access control** with role-based authentication. Only pre-registered users with assigned roles can access the platform.

## Security Model

### Access Control
- ✅ **No public signup** - Registration endpoint disabled
- ✅ **Pre-registered users only** - Users must be added by administrators
- ✅ **Role-based permissions** - Three authorized roles: Portfolio Lead, Executive, PMO
- ✅ **Account activation control** - Administrators can activate/deactivate user accounts

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Portfolio Lead** | Primary user managing portfolios and scenarios | Create/manage portfolios, scenarios, initiatives |
| **Executive** | Senior leadership with oversight | View all portfolios, create users (admin) |
| **PMO** | Program Management Office administrator | Full system administration, user management |

## Implementation Changes

### 1. Disabled Public Signup ✅
- **File**: `app/api/auth/signup/route.ts`
- **Change**: Returns 403 error for all signup attempts
- **Message**: "Public registration is disabled. Please contact your system administrator."

### 2. Updated Login Page ✅
- **File**: `app/auth/page.tsx`
- **Changes**:
  - Removed signup tab and form
  - Displays "Restricted to authorized personnel only"
  - Shows authorized roles in footer
  - Clear security messaging

### 3. Database Schema Update ✅
- **File**: `prisma/schema.prisma`
- **Change**: Added `isActive` boolean field to User model
- **Purpose**: Administrators can deactivate accounts without deletion
- **Migration Required**: Run `npx prisma migrate dev --name add_user_isActive`

### 4. Admin User Management API ✅
- **File**: `app/api/admin/users/route.ts`
- **Endpoints**:
  - `POST /api/admin/users` - Create new user (PMO/Executive only)
  - `GET /api/admin/users` - List all users with filtering
  - `PATCH /api/admin/users` - Update user status/role

### 5. Login Validation ✅
- **File**: `app/api/auth/login/route.ts`
- **Change**: Checks `isActive` flag before allowing login
- **Error**: Returns "Account has been deactivated" for inactive users

### 6. User Seed Scripts ✅
- **File**: `scripts/seedUsers.ts`
- **Purpose**: Initialize admin accounts and manage users
- **Helpers**: 
  - `seedUsers()` - Create default admin accounts
  - `createUser()` - Add individual user
  - `listUsers()` - View all users
  - `activateUser()` / `deactivateUser()` - Manage status

## Setup Instructions

### Step 1: Update Database Schema

```bash
cd frontend
npx prisma migrate dev --name add_user_isActive
```

This will:
- Add the `isActive` field to existing users (defaults to `true`)
- Update Prisma client

### Step 2: Seed Initial Admin Accounts

```bash
npx ts-node scripts/seedUsers.ts
```

Default accounts created:
- **admin@company.com** (PMO) - Password: `Admin123!`
- **executive@company.com** (Executive) - Password: `Exec123!`
- **portfolio@company.com** (Portfolio Lead) - Password: `Portfolio123!`

⚠️ **IMPORTANT**: Change these passwords immediately in production!

### Step 3: Test Access Control

1. Try accessing `/auth` - Should only show login form
2. Attempt to POST to `/api/auth/signup` - Should return 403 error
3. Login with admin account
4. Test creating new user via API

## Creating New Users

### Option 1: API Endpoint (Recommended)

```bash
# Login as PMO or Executive user first to get auth token

curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@company.com",
    "password": "SecurePass123!",
    "role": "PORTFOLIO_LEAD",
    "isActive": true
  }'
```

### Option 2: Seed Script

```typescript
import { createUser } from './scripts/seedUsers';

const result = await createUser(
  'Jane Doe',
  'jane@company.com',
  'SecurePass123!',
  'PORTFOLIO_LEAD',
  true
);

console.log(result);
```

### Option 3: Direct Database (PostgreSQL)

```sql
-- Hash the password first using bcrypt with 10 rounds
INSERT INTO "User" (id, name, email, "passwordHash", role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Jane Doe',
  'jane@company.com',
  '$2a$10$...', -- bcrypt hash of password
  'PORTFOLIO_LEAD',
  true,
  NOW(),
  NOW()
);
```

## Managing Users

### List All Users

```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Filter by role
curl -X GET http://localhost:3000/api/admin/users?role=EXECUTIVE \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Deactivate User Account

```bash
curl -X PATCH http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "userId": "user-uuid-here",
    "isActive": false
  }'
```

### Change User Role

```bash
curl -X PATCH http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "userId": "user-uuid-here",
    "role": "EXECUTIVE"
  }'
```

## Security Best Practices

1. **Strong Passwords**: Enforce minimum 8 characters, include special characters
2. **Admin Credentials**: Change default passwords immediately
3. **JWT Secret**: Set strong `JWT_SECRET` in environment variables
4. **Token Expiry**: Default 7 days - adjust based on security requirements
5. **Regular Audits**: Review user list and lastLoginAt timestamps
6. **Account Cleanup**: Deactivate (don't delete) unused accounts for audit trail

## Troubleshooting

### "Account has been deactivated" Error
- User's `isActive` flag is set to `false`
- Contact administrator to reactivate account
- Admin can reactivate via PATCH `/api/admin/users`

### "Only PMO and Executive roles can create users"
- Only PMO and Executive roles have admin permissions
- Portfolio Leads cannot create new users
- Escalate to appropriate administrator

### Cannot Login After Migration
- Ensure database migration completed successfully
- Check that `isActive` field exists and defaults to `true`
- Verify existing users have `isActive = true`

## Environment Variables

```env
# .env.local

# JWT Secret (change in production!)
JWT_SECRET=your-strong-secret-key-here

# Database URLs
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

## File Changes Summary

| File | Status | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Added `isActive` field to User model |
| `app/api/auth/signup/route.ts` | Modified | Disabled - returns 403 error |
| `app/auth/page.tsx` | Modified | Removed signup UI, login only |
| `app/api/auth/login/route.ts` | Modified | Validates `isActive` before login |
| `app/api/admin/users/route.ts` | **New** | Admin-only user management API |
| `scripts/seedUsers.ts` | **New** | User management utilities |
| `RESTRICTED_ACCESS.md` | **New** | This documentation file |

## Next Steps

1. ✅ Run database migration
2. ✅ Seed initial admin accounts
3. ⚠️ **Change default passwords**
4. ✅ Test login with restricted access
5. ✅ Create production user accounts
6. ✅ Document your admin procedures
7. ⚠️ Set strong JWT_SECRET in production

---

**Last Updated**: January 2026
**Version**: 1.0
**Status**: Production Ready
