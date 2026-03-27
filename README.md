# La'Fai

## Backend Setup (Supabase + Vercel)

### 1) Create Supabase project
- Create a new project in Supabase.

### 2) Apply database schema
- Open the SQL editor in Supabase.
- Run the contents of `supabase/schema.sql`.

This creates:
- `profiles` (user profiles + role)
- `orders` (checkout data)
- `site_settings` (admin-only key/value store)

### 3) Set environment variables

Create a local `.env` (or `.env.local`) file using `.env.example`:

```
VITE_SUPABASE_URL=...your_project_url...
VITE_SUPABASE_ANON_KEY=...your_anon_key...
SUPABASE_URL=...your_project_url...
SUPABASE_SERVICE_ROLE_KEY=...your_service_role_key...
```

On Vercel, set the same variables in Project Settings > Environment Variables.

### 4) Admin access
Admin privileges are enforced by the `profiles.role` column.

To grant admin:
- In Supabase, update the profile row for the user and set `role = 'admin'`.
- You can do this in the Table Editor or via SQL:

```
update public.profiles
set role = 'admin'
where id = 'USER_UUID_HERE';
```

### 5) Verify admin API
The admin UI uses `/api/admin-query` which:
- validates the user JWT
- checks `profiles.role = 'admin'`
- performs privileged actions using the service role key

Local dev note:
- The admin API is a Vercel Serverless Function. For local testing, use `vercel dev`.

## Notes
- Authenticated users can read/update their own profiles and read their own orders.
- Orders are only insertable by authenticated users; guest checkouts fall back to localStorage.
- `site_settings` is service-role only and cannot be accessed from the client directly.

## Product Image Uploads (Supabase Storage)
1. Run `supabase/storage.sql` in Supabase SQL editor.
2. Ensure your admin user is authenticated (uploads require auth).
3. In Admin → Products, use the image uploader. Images are stored in the `product-images` bucket.

## SEO + Sitemap
- `public/robots.txt` and `public/sitemap.xml` are generated from product slugs.
- Update `index.html` meta tags when you change branding or domain.
