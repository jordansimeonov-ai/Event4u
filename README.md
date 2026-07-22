# Event4u - Multi-Tenant Event Quote Calculator

A professional Next.js application for generating event quotes with multi-tenant support via subdomains.

## Features

✅ **Multi-Tenant Architecture**: Each venue has its own subdomain (e.g., `starosel.event4u.bg`)
✅ **Dynamic Branding**: Automatic theme colors and branding per venue
✅ **3-Step Wedding Calculator**:
  - Step 1: Customer details (name, email, phone, event date, guests)
  - Step 2: Accommodation selection (room types with real-time pricing)
  - Step 3: Services selection (menu, drinks, entertainment, etc.)
✅ **Real-Time Price Summary**: Live calculation of total costs
✅ **Admin Panel**: Password-protected venue management
✅ **Supabase Database**: All data stored and managed in Supabase
✅ **PDF Quote Generation**: Ready for jsPDF integration

## Database Structure

The following tables were created:

- `clients` - Venue information and branding
- `event_types` - Event categories (Wedding, Business, Team Building)
- `rooms` - Accommodation options
- `services` - Service offerings (menu, drinks, ceremony, etc.)
- `quotes` - Submitted customer quotes

### Pre-loaded Venues

1. **Starosel** (`starosel.event4u.bg`)
   - Burgundy theme (#8b0000)
   - 4 room types, comprehensive services

2. **Yastrebec** (`yastrebec.event4u.bg`)
   - Forest green theme (#2d5016)
   - 4 room types, comprehensive services

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Your `.env.local` is already configured with Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
ADMIN_PASSWORD=admin
```

### 3. Run Development Server

```bash
npm run dev
```

Visit:
- http://localhost:3000 - Landing page
- http://localhost:3000?client=starosel - Test Starosel calculator
- http://localhost:3000?client=yastrebec - Test Yastrebec calculator

### 4. Build for Production

```bash
npm run build
npm start
```

## Admin Panel

To access the admin panel:

1. Click the Settings gear icon in the header
2. Enter password: `admin`
3. Manage rooms, services, and venue settings

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial Event4u app"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD`
5. Deploy!

### Step 3: Configure Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add `event4u.bg`
3. Add wildcard: `*.event4u.bg`
4. Update your DNS records as instructed by Vercel

### Step 4: Update DNS

Add these records at your domain registrar:

```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   *       cname.vercel-dns.com
```

## Testing Multi-Tenant URLs

Once deployed:

- Main site: `https://event4u.bg`
- Starosel: `https://starosel.event4u.bg`
- Yastrebec: `https://yastrebec.event4u.bg`

For local testing with subdomains, edit your `/etc/hosts`:

```
127.0.0.1 starosel.localhost
127.0.0.1 yastrebec.localhost
```

Then visit: `http://starosel.localhost:3000`

## Project Structure

```
/
├── app/
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── not-found.tsx            # 404 page
│   └── tenant/[subdomain]/
│       └── page.tsx             # Venue-specific calculator
├── components/
│   ├── WeddingCalculator.tsx    # Main calculator component
│   ├── AdminPanel.tsx           # Admin interface
│   └── calculator/
│       ├── Step1Details.tsx     # Customer details form
│       ├── Step2Accommodation.tsx  # Room selection
│       ├── Step3Services.tsx    # Services selection
│       └── PriceSummary.tsx     # Price breakdown
├── lib/
│   └── supabase.ts              # Supabase client & types
└── middleware.ts                # Subdomain routing
```

## Adding a New Venue

To add a new venue, run this SQL in Supabase:

```sql
INSERT INTO clients (slug, name_bg, name_en, primary_color, secondary_color, welcome_message_bg, welcome_message_en, contact_email, contact_phone)
VALUES (
  'new-venue',
  'Нов Хотел',
  'New Hotel',
  '#0066cc',
  '#f0f0f0',
  'Добре дошли!',
  'Welcome!',
  'info@newhotel.com',
  '+359888000000'
);
```

Then add rooms, event types, and services for that venue.

## Security Notes

- Admin password is stored in environment variables
- All database operations use Supabase Row Level Security (RLS)
- Public can only read active venues and services
- Only authenticated users can modify data via Admin panel
- Quote submissions are public (for calculator), but viewing requires auth

## Next Steps

1. **PDF Generation**: Integrate jsPDF to generate quote PDFs
2. **Email Integration**: Send quotes via email (Resend, SendGrid, etc.)
3. **Authentication**: Replace simple password with proper auth (Supabase Auth)
4. **Analytics**: Track quote submissions and conversions
5. **Multi-Language**: Full i18n support for English/Bulgarian
6. **Business & Team Building**: Add calculators for other event types

---

**Built with**: Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase

**Deployment**: Vercel recommended for serverless + subdomain support
