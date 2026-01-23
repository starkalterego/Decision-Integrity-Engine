# Database Management Scripts

## Quick Commands

### Reset Everything (Clear + Seed)
```bash
npm run db:reset
```
- Deletes ALL data (users, portfolios, initiatives, scenarios)
- Creates fresh admin accounts
- Use this for a complete fresh start

### Clear Database Only
```bash
npm run db:clear
```
- Deletes ALL data
- Does NOT create new users
- Database will be completely empty

### Seed Admin Users
```bash
npm run db:seed
```
- Creates default admin accounts
- Skips existing users
- Safe to run multiple times

## What Just Happened

✅ **Database Cleared**
- Deleted all existing users (7 users removed)
- Deleted all portfolios and related data
- Deleted all initiatives, scenarios, and decisions
- Database is now empty

✅ **Fresh Admin Accounts Created**
- **admin@company.com** (PMO) - Password: `Admin123!`
- **executive@company.com** (Executive) - Password: `Exec123!`
- **portfolio@company.com** (Portfolio Lead) - Password: `Portfolio123!`

## Next Steps

1. **Login to Dashboard**
   ```
   Visit: http://localhost:3000/auth
   Use any of the accounts above
   ```

2. **Create Real Users**
   - Login as admin (PMO or Executive)
   - Go to Dashboard → Click "+ Create User"
   - Fill in user details
   - Assign appropriate role

3. **Change Default Passwords**
   ```
   ⚠️ Important for production!
   - Login with default account
   - Use dashboard to create new admin
   - Delete default accounts
   ```

## Scripts Created

### 1. clearDatabase.js
**Purpose**: Delete all data from database
**Usage**: `npm run db:clear` or `node scripts/clearDatabase.js`
**Warning**: ⚠️ Destructive - cannot be undone

**What it deletes**:
- All users
- All portfolios
- All initiatives
- All scenarios
- All decisions
- All capacity demands
- All governance records

### 2. seedUsers.js
**Purpose**: Create default admin accounts
**Usage**: `npm run db:seed` or `node scripts/seedUsers.js`
**Safe**: ✅ Skips existing users

**Creates**:
- System Administrator (PMO)
- Executive User (Executive)
- Portfolio Lead (Portfolio Lead)

### 3. resetDatabase.js
**Purpose**: Complete reset - clear + seed
**Usage**: `npm run db:reset` or `node scripts/resetDatabase.js`
**Warning**: ⚠️ Deletes everything, then creates admin accounts

**Process**:
1. Delete all existing data
2. Create fresh admin accounts
3. Display login credentials

## Use Cases

### Starting Fresh
```bash
npm run db:reset
```
Perfect for:
- Development/testing
- After major changes
- Clean slate needed

### Before Production
```bash
npm run db:clear
# Then create real users via dashboard
```
Perfect for:
- Removing test data
- Production deployment
- Clean production start

### After Schema Changes
```bash
npx prisma migrate dev
npm run db:reset
```
Perfect for:
- After database migrations
- Schema updates
- Adding new fields

## Database Connection

Scripts use the following connection order:
1. `DIRECT_URL` (preferred for scripts)
2. `DATABASE_URL` (fallback)

Make sure your `.env` file has these configured:
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

## Safety Notes

⚠️ **These operations are DESTRUCTIVE**
- No confirmation prompts
- No undo functionality
- All data is permanently deleted

✅ **Best Practices**:
1. Backup production data before running
2. Use in development/testing only
3. Never run `db:reset` on production
4. Change default passwords immediately
5. Create proper admin accounts first

## Testing the Reset

1. **Verify Database is Empty**
   ```bash
   npm run db:clear
   # Login should fail - no users exist
   ```

2. **Verify Seed Works**
   ```bash
   npm run db:seed
   # Should be able to login with default accounts
   ```

3. **Verify Reset Works**
   ```bash
   npm run db:reset
   # Should clear everything and create admin accounts
   ```

## Troubleshooting

### "Can't reach database server"
- Check `.env` file exists
- Verify `DATABASE_URL` and `DIRECT_URL` are set
- Test connection: `npx prisma db pull`

### "User already exists"
- User with that email already in database
- Run `npm run db:clear` first
- Or create user with different email

### "Migration needed"
- Database schema doesn't match Prisma schema
- Run: `npx prisma migrate dev`
- Then: `npm run db:reset`

## NPM Script Reference

| Command | Action | Safe? | Use Case |
|---------|--------|-------|----------|
| `npm run db:reset` | Clear + Seed | ❌ No | Fresh start |
| `npm run db:clear` | Delete all | ❌ No | Clean slate |
| `npm run db:seed` | Create admins | ✅ Yes | Add admin accounts |
| `npm run dev` | Start server | ✅ Yes | Development |
| `npm run build` | Build production | ✅ Yes | Deployment |

---

**Created**: January 2026  
**Status**: ✅ Ready to Use  
**Warning**: ⚠️ Use with caution - destructive operations
