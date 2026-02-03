# Deploy Checklist (Backend + DB)

## Backend – sab theek hai

- **Auth:** Login (public), baaki sab routes JWT se protected
- **Cars:** CRUD, VIN decode, list/detail
- **Media:** Upload (image + video), list by car, delete – file type validation `ALLOWED_FILE_TYPES` se
- **Remarks:** CRUD per car
- **Search:** Filters, pagination
- **Health:** `GET /api/health` (no auth) – Docker/load balancer health check ke liye

## Database (Prisma)

- **Schema:** Car, Media, Remark, Damage + enums
- **Migrations:** `prisma/migrations/20260126120000_init` – initial migration maujood hai

### Pehli baar deploy (fresh DB)

1. Railway (ya koi host) par **Environment Variables** set karein (ref: `RAILWAY_ENV.txt` + `env.example`):
   - `DATABASE_URL`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (login ke liye)
   - `CORS_ORIGIN` = frontend URL (e.g. `https://your-app.vercel.app`)
   - `STORAGE_PUBLIC_URL` = backend public URL + `/uploads` (e.g. `https://your-backend.up.railway.app/uploads`)
   - `ALLOWED_FILE_TYPES` = `image/jpeg,image/png,image/webp,video/mp4,video/webm`
   - `VIN_DECODER_API_URL` = `https://vpic.nhtsa.dot.gov/api`

2. **Migrations:** Container start par **khud chalti hain** (`start:prod:full` = `prisma migrate deploy` phir server). Koi release command mat set karo.

### Agar DB pehle se `prisma db push` se bani hai

- Pehli baar "relation already exists" aaye to Railway par **one-off** chalao:
  ```bash
  npx prisma migrate resolve --applied 20260126120000_init
  ```
  Phir se deploy karo; uske baad sab auto chalega.

## Uploads (production)

- Abhi **local disk** (`./uploads`) use ho raha hai – Railway redeploy par files mit sakti hain.
- Permanent storage ke liye baad mein S3/R2 + `STORAGE_PUBLIC_URL` set karna hoga.

## Frontend deploy ke baad

- Backend par `CORS_ORIGIN` zaroor set karein frontend URL par (e.g. `https://your-app.vercel.app`).
