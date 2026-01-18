# Vercel Deployment Guide

This guide details the steps to deploy the **Decision Integrity Engine** to Vercel for production.

## Prerequisites

1.  **Vercel Account**: [Create one here](https://vercel.com/signup).
2.  **Supabase Project**: You should already have this from development.
3.  **GitHub Repository**: Ensure this code is pushed to a GitHub repository.

---

## Step 1: Database Preparation

Your application uses Prisma, which requires a specific connection configuration for serverless environments (like Vercel).

1.  **Get Connection Strings** from your Supabase Dashboard:
    *   Go to **Settings** > **Database**.
    *   Copy the **Transaction Pooler** string (port 6543, `pgbouncer=true`). This is for `DATABASE_URL`.
    *   Copy the **Session** string (port 5432). This is for `DIRECT_URL`.

2.  **Ensure Environment Variables are Ready**:
    You will need these values for the next step.

---

## Step 2: Deploy to Vercel

1.  **Import Project**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** > **"Project"**.
    *   Select your GitHub repository (`Decision-Integrity-Engine`).

2.  **Configure Project**:
    *   **Framework Preset**: Select **Next.js**.
    *   **Root Directory**: Click "Edit" and select `frontend` (since your app is in a subfolder). This is **CRITICAL**.

3.  **Environment Variables**:
    *   Expand the **Environment Variables** section.
    *   Add the following keys (copy values from your local `.env` or Supabase):

    | Key | Value Source | Description |
    |:---|:---|:---|
    | `DATABASE_URL` | Supabase (Transaction Pooler) | `postgres://...:6543/postgres?pgbouncer=true` |
    | `DIRECT_URL` | Supabase (Session) | `postgres://...:5432/postgres` |

4.  **Deploy**:
    *   Click **Deploy**.
    *   Vercel will build your application.
    *   *Note*: The `postinstall` script we added (`prisma generate`) will run automatically to generate the database client.

---

## Step 3: Verify Deployment

1.  Once deployed, visit the provided URL (e.g., `decision-integrity-engine.vercel.app`).
2.  **Important**: If you see "Failed to save portfolio" or database errors, the environment variables are not set correctly. Go back to Step 2.3 and verify both `DATABASE_URL` and `DIRECT_URL` are configured.

---

## Troubleshooting

### "Failed to save portfolio" or "Failed to create portfolio"
*   **Cause**: Environment variables are not set in Vercel.
*   **Fix**: 
    1.  Go to your Vercel project dashboard
    2.  Click **Settings** > **Environment Variables**
    3.  Verify both `DATABASE_URL` and `DIRECT_URL` are present
    4.  If missing, add them using the values from your Supabase dashboard
    5.  **Redeploy** the project (Vercel > Deployments > click the three dots on latest deployment > Redeploy)

### Build Failures
*   **Prisma Client Error**: If you see "Prisma Client not initialized", ensure `prisma generate` ran. (We added this to `package.json` scripts, so it should handle itself).
*   **Type Errors**: If the build fails due to TypeScript errors, run `npm run build` locally to identify and fix them before pushing.

### Database Connection Errors
*   Ensure you are using the **Transaction Pooler URL** (`pgbouncer=true`, port 6543) for the `DATABASE_URL` variable. Serverless functions exhaust connections quickly without it.
*   Ensure you are using the **Session URL** (port 5432) for the `DIRECT_URL` variable.
*   **Test your connection strings** locally first by adding them to your `.env` file and running `npx prisma db push` to verify they work.
