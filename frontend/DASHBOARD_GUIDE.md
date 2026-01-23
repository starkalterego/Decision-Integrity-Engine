# Role-Based Dashboard - Implementation Guide

## Overview

The Decision Integrity Engine now features a comprehensive **role-based dashboard** that provides customized views and functionality based on user roles.

## Dashboard Features

### 🎯 For All Users

After logging in, users are redirected to `/dashboard` where they see:

- **Welcome message** with personalized greeting
- **Quick stats cards**: Portfolios, Initiatives, Scenarios counts
- **Portfolio management**: Grid view of all accessible portfolios
- **Quick navigation**: Easy access to create/manage portfolios

### 👨‍💼 Portfolio Lead Dashboard

**Access Level**: Standard User

**Features**:
- View and manage personal portfolios
- Create new portfolios directly from dashboard
- See initiative and scenario counts for each portfolio
- Quick links to portfolio setup, initiatives, and scenarios

**Quick Actions**:
- `+ New Portfolio` button to create portfolios
- Click any portfolio card to open it
- Access all portfolio features (Setup, Initiatives, Scenarios, Compare, Output)

### 👔 Executive Dashboard

**Access Level**: Admin

**Features**:
- **All Portfolio Lead features** PLUS:
- **User Management panel**: View all system users
- **System-wide metrics**: Active users count
- **User quick actions**: View recent users, create new users
- Access to full user management interface

**Quick Actions**:
- `+ Create User` button for adding new users
- View all users with role and status information
- Navigate to detailed user management page

### 🔧 PMO Dashboard

**Access Level**: Full Admin

**Features**:
- **All Executive features** PLUS:
- **Full system administration**: Complete user management
- **Audit capabilities**: View all portfolios across system
- **User activation control**: Enable/disable user accounts
- **Role management**: Change user roles

**Quick Actions**:
- `+ Create User` with role assignment
- Activate/deactivate user accounts
- View comprehensive user statistics
- System-wide portfolio oversight

## Navigation Structure

### Global Navigation (Dashboard Header)

When not in a portfolio:
- **Dashboard** - Return to main dashboard
- **Users** (Admin only) - User management interface

When in a portfolio:
- **← Dashboard** - Return to dashboard
- Portfolio navigation (Setup, Initiatives, Scenarios, Compare, Output)

### User Menu

Located in top-right corner:
- **User avatar** - Shows first letter of name
- **User name** - Current logged-in user
- **User role** - Displayed role (Portfolio Lead, Executive, PMO)
- **Sign Out** button

## Routes & Pages

### Dashboard Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/dashboard` | All users | Main dashboard with role-based content |
| `/dashboard/users` | PMO, Executive | Full user management interface |
| `/dashboard/users/new` | PMO, Executive | Create new user (planned) |
| `/dashboard/users/[id]` | PMO, Executive | User details page (planned) |

### Authentication Flow

1. User visits `/auth` (login page)
2. Enters credentials
3. On success: Redirected to `/dashboard`
4. Dashboard loads role-specific content

### Home Page Behavior

- **Authenticated users**: Auto-redirect to `/dashboard`
- **Unauthenticated users**: Redirect to `/auth`
- No longer shows portfolio list on home page

## User Management Interface

### Viewing Users (Admin Only)

**Location**: `/dashboard/users`

**Features**:
- **User table** with sortable columns
- **Role filter**: Filter by Portfolio Lead, Executive, or PMO
- **Status badges**: Active/Inactive indicators
- **Last login** tracking
- **Portfolio count** per user

**Table Columns**:
- User (name, email, avatar)
- Role (with badge)
- Status (Active/Inactive)
- Portfolios (count)
- Last Login (date)
- Actions (Activate/Deactivate)

### Creating Users (Admin Only)

**Access**: Click `+ Create User` button on dashboard or users page

**Form Fields**:
- Full Name (required)
- Email (required, unique)
- Password (required, min 8 characters)
- Role (dropdown: Portfolio Lead, Executive, PMO)
- Status (active by default)

**Process**:
1. Click `+ Create User`
2. Fill in user details
3. Select appropriate role
4. Click `Create User`
5. User receives credentials (should change password)

### Managing User Status

**Activate/Deactivate Users**:
- Click `Activate` or `Deactivate` button in user table
- Inactive users cannot log in
- Maintains audit trail (doesn't delete)

## Role-Based Access Control

### Dashboard Content Rules

```typescript
// Portfolio Lead
- Can see: Own portfolios only
- Can create: New portfolios
- Cannot see: User management section

// Executive  
- Can see: All portfolios (system-wide)
- Can create: Portfolios, Users
- Can access: User management interface

// PMO
- Can see: All portfolios, all users
- Can create: Portfolios, Users
- Can modify: User status, user roles
- Can access: Full admin features
```

### API Permissions

| Endpoint | Portfolio Lead | Executive | PMO |
|----------|---------------|-----------|-----|
| `GET /api/portfolios` | Own only | All | All |
| `POST /api/portfolios` | ✅ | ✅ | ✅ |
| `GET /api/admin/users` | ❌ | ✅ | ✅ |
| `POST /api/admin/users` | ❌ | ✅ | ✅ |
| `PATCH /api/admin/users` | ❌ | ✅ | ✅ |

## Implementation Details

### Key Files

**Dashboard**:
- `app/dashboard/page.tsx` - Main dashboard with role-based sections
- `app/dashboard/users/page.tsx` - User management interface
- `components/layout/Header.tsx` - Enhanced navigation with dashboard links

**API Updates**:
- `lib/api.ts` - Added `authPatch` function for user updates
- `app/api/admin/users/route.ts` - User CRUD operations

**Authentication**:
- `app/auth/page.tsx` - Redirects to `/dashboard` on success
- `app/page.tsx` - Redirects authenticated users to `/dashboard`

### State Management

Dashboard fetches data on mount:
```typescript
useEffect(() => {
  // Fetch portfolios for all users
  const portfolioResponse = await authGet('/api/portfolios');
  
  // Fetch users if admin
  if (user?.role === 'PMO' || user?.role === 'EXECUTIVE') {
    const userResponse = await authGet('/api/admin/users');
  }
}, [user]);
```

### Header Navigation Logic

```typescript
// Global nav (no portfolio)
{isAuthenticated && !portfolioId && (
  <NavLink href="/dashboard">Dashboard</NavLink>
  {(user?.role === 'PMO' || user?.role === 'EXECUTIVE') && (
    <NavLink href="/dashboard/users">Users</NavLink>
  )}
)}

// Portfolio nav (in portfolio)
{portfolioId && (
  <NavLink href="/dashboard">← Dashboard</NavLink>
  // ... portfolio links
)}
```

## Testing the Dashboard

### Test as Portfolio Lead

1. Login: `portfolio@company.com` / `Portfolio123!`
2. Should see:
   - Welcome message with name
   - 3 metric cards (no Users card)
   - Own portfolios only
   - No User Management section
   - `+ New Portfolio` button

### Test as Executive

1. Login: `executive@company.com` / `Exec123!`
2. Should see:
   - All Portfolio Lead features
   - **Active Users** metric card
   - **User Management** panel with recent users
   - `+ Create User` button
   - Link to "View All Users"

### Test as PMO

1. Login: `admin@company.com` / `Admin123!`
2. Should see:
   - All Executive features
   - Full user management panel
   - Activate/Deactivate buttons for users
   - System-wide portfolio access
   - "Users" link in header

### Test User Management

1. Login as admin (PMO or Executive)
2. Click `+ Create User` button
3. Fill in:
   - Name: "Test User"
   - Email: "test@company.com"
   - Password: "Test123!"
   - Role: "Portfolio Lead"
4. Click "Create User"
5. See new user in user list
6. Try deactivating the user
7. Verify they cannot log in

## Benefits

### For Organizations

✅ **Centralized Access** - Single entry point for all users
✅ **Role-Based Views** - Users see only relevant features
✅ **Easy User Management** - No scripts or database access needed
✅ **Quick Navigation** - One-click access to all features
✅ **Clear Permissions** - Visual indicators of access levels

### For Users

✅ **Personalized Experience** - Dashboard tailored to role
✅ **Quick Stats** - At-a-glance portfolio metrics
✅ **Fast Navigation** - Direct links to portfolios and features
✅ **Clear Interface** - Clean, professional design
✅ **Easy Access** - No need to remember URLs

### For Administrators

✅ **GUI User Management** - No command-line needed
✅ **Visual Status** - See active/inactive users at a glance
✅ **Quick Actions** - Create and manage users in seconds
✅ **Audit Trail** - Last login tracking
✅ **Role Control** - Easy role assignment

## Next Steps

After implementing the dashboard:

1. ✅ Test all three role types
2. ✅ Create new users via dashboard interface
3. ✅ Verify role-based access control
4. ✅ Test navigation flows
5. ⚠️ Change default test passwords
6. ✅ Document for your team

## Troubleshooting

### "Cannot access dashboard"
- Ensure you're logged in
- Check that authentication token is valid
- Try logging out and back in

### "User Management not visible"
- Requires PMO or Executive role
- Portfolio Leads cannot access user management
- Contact administrator to change role

### "Cannot create user"
- Only PMO and Executive can create users
- Ensure all required fields are filled
- Password must be at least 8 characters
- Email must be unique

---

**Implementation Date**: January 2026  
**Status**: ✅ Production Ready  
**Version**: 1.0
