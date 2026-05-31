# Fatboy Cookies 🍪 — Order Site

## How to Deploy to Vercel (Free)

### Option 1 — Drag & Drop (Easiest, no account needed for basic)
1. Go to https://vercel.com
2. Sign up with Google (free)
3. Click "Add New Project"
4. Drag this entire folder onto the page
5. Vercel detects it's a Vite/React app automatically
6. Click Deploy — done in ~60 seconds
7. Your live URL will be something like: fatboy-cookies.vercel.app

### Option 2 — Vercel CLI
```
npm install -g vercel
vercel
```

---

## Admin Panel
- Tap ⚙️ ADMIN button on the site
- PIN: 0476 (change in src/App.jsx → ADMIN_PIN)

## Customizing
All key settings are at the top of src/App.jsx:
- ADMIN_PIN — your secret 4-digit PIN
- OWNER_PHONE — your phone number
- COOKIES — your 4 flavors
- DEFAULT_PICKUP_SLOTS — your pickup times

## Weekly Reset
Go to Admin → tap "🔄 NEW WEEK RESET" every time you start a new drop.
