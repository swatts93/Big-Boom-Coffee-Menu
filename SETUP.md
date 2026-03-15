# Setup Guide — Big Boom Coffee Menu System

## What you have

| File | Purpose |
|------|---------|
| `landscape.html`   | Display on the **horizontal** TV (1920×1080) |
| `portrait.html`    | Display on the **vertical** TV (1080×1920) |
| `admin.html`       | Password-protected menu editor (manual overrides) |
| `js/config.js`     | Firebase credentials & settings |
| `functions/`       | Firebase Cloud Function — syncs Toast → Firebase every 5 min |

---

## Part 1 — Firebase setup

### Step 1 — Create a free Firebase project

1. Go to **https://console.firebase.google.com**
2. Click **Add project** → name it `big-boom-menu`
3. Disable Google Analytics → **Create project**
4. **Upgrade to Blaze plan** (pay-as-you-go) — required for the Cloud Function
   to make outbound calls to Toast's API. Cost is essentially $0 for this usage.

### Step 2 — Enable Realtime Database

1. **Build → Realtime Database → Create database**
2. Choose **Start in test mode**
3. Pick `us-central1` (or closest region)

### Step 3 — Get your web config keys

1. **Gear icon → Project settings → Your apps → </>**
2. Register a web app, copy the `firebaseConfig` block
3. Paste values into `js/config.js`

### Step 4 — Deploy

```bash
npm install -g firebase-tools
firebase login
firebase init          # select Hosting, Functions, Realtime Database
firebase deploy
```

Your URLs:
- `https://big-boom-menu.web.app/landscape.html`
- `https://big-boom-menu.web.app/portrait.html`
- `https://big-boom-menu.web.app/admin.html`

---

## Part 2 — Toast API sync

### Step 5 — Get Toast API credentials

You need three things from Toast:

| Value | Where to find it |
|-------|-----------------|
| `client_id` | Toast developer portal (see below) |
| `client_secret` | Toast developer portal |
| `restaurant_guid` | Your Toast management portal URL |

**Getting API credentials:**
1. Go to **https://developer.toasttab.com**
2. Sign in with your Toast account
3. Request Restaurant API access — approval takes 1–3 business days
4. Once approved, generate a `clientId` and `clientSecret`

**Finding your Restaurant GUID:**
- Log into **https://www.toasttab.com/restaurants/admin**
- The GUID is the long UUID in your browser's URL bar

### Step 6 — Set credentials in Firebase Functions config

```bash
firebase functions:config:set \
  toast.client_id="YOUR_CLIENT_ID" \
  toast.client_secret="YOUR_CLIENT_SECRET" \
  toast.restaurant_guid="YOUR_RESTAURANT_GUID"
```

### Step 7 — Deploy the function

```bash
firebase deploy --only functions
```

The function runs **every 5 minutes** automatically.
To trigger an immediate sync manually:

```bash
curl -X POST https://YOUR_REGION-big-boom-menu.cloudfunctions.net/syncNow
```

---

## How it works after setup

```
You update price or 86 item in Toast
         ↓
  (within 5 minutes)
         ↓
Firebase Cloud Function fetches Toast Menus V2 API
         ↓
Firebase Realtime Database is updated
         ↓
Both TVs update automatically
```

- **Price changes** → reflected on TVs within 5 minutes
- **86'd items** → show as "SOLD OUT" on TVs within 5 minutes
- **New items added in Toast** → appear on TVs within 5 minutes
- **Retail / merch categories** → automatically excluded (see `EXCLUDED_CATEGORIES` in `functions/index.js`)

---

## Adjusting the portrait TV rotation speed

In `js/config.js`:
```js
const SECTION_ROTATION_SECONDS = 22; // increase or decrease
```

## Changing the admin password

In `js/config.js`:
```js
const ADMIN_PASSWORD = "YourNewPassword";
```

## Excluding additional Toast categories from the TVs

In `functions/index.js`, add to the `EXCLUDED_CATEGORIES` array:
```js
const EXCLUDED_CATEGORIES = [
  'retail',
  'merchandise',
  'your category name here',  // ← add any others
];
```
