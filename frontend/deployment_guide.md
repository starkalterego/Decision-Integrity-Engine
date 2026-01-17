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
2.  **Test the End-to-End Flow**:
    *   Create a new Portfolio.
    *   Add an Initiative.
    *   Run a Scenario.
    *   View the Executive Output.

---

## Troubleshooting

### Build Failures
*   **Prisma Client Error**: If you see "Prisma Client not initialized", ensure `prisma generate` ran. (We added this to `package.json` scripts, so it should handle itself).
*   **Type Errors**: If the build fails due to TypeScript errors, run `yarn build` locally to identify and fix them before pushing.

### Database Connection Errors
*   Ensure you are using the **Pooler URL** (`pgbouncer=true`) for the `DATABASE_URL` variable. Serverless functions exhaust connections quickly without it.
