const functions  = require('firebase-functions');
const admin      = require('firebase-admin');
const axios      = require('axios');

admin.initializeApp();

// ── Toast API endpoints ────────────────────────────────────────────────────
const TOAST_BASE   = 'https://ws-api.toasttab.com';
const TOAST_AUTH   = `${TOAST_BASE}/authentication/v1/authentication/login`;
const TOAST_MENUS  = `${TOAST_BASE}/menus/v2/menus`;
const TOAST_AVAIL  = `${TOAST_BASE}/menus/v2/itemAvailability`;

// ── Categories to exclude from the TV display (retail, merch, etc.) ───────
// Add any Toast menu group names you want hidden from the boards
const EXCLUDED_CATEGORIES = [
  'retail',
  'merchandise',
  'merch',
  'gift cards',
  'gift card',
  'whole bean',
  'beans',
  'bags',
];

// ── Auth ───────────────────────────────────────────────────────────────────
async function getToken(clientId, clientSecret) {
  const { data } = await axios.post(TOAST_AUTH, {
    clientId,
    clientSecret,
    userAccessType: 'TOAST_MACHINE_CLIENT',
  });
  return data.token.accessToken;
}

// ── Fetch menus + availability in parallel ─────────────────────────────────
async function fetchToastData(token, restaurantGuid) {
  const headers = {
    'Authorization':                 `Bearer ${token}`,
    'Toast-Restaurant-External-ID':  restaurantGuid,
  };

  const [menusRes, availRes] = await Promise.all([
    axios.get(TOAST_MENUS, { headers }),
    axios.get(TOAST_AVAIL, { headers }).catch(() => ({ data: [] })),
  ]);

  return {
    menus:        menusRes.data,
    availability: availRes.data,
  };
}

// ── Build a Set of out-of-stock item GUIDs ─────────────────────────────────
function buildOutOfStockSet(availability) {
  const set = new Set();
  if (!Array.isArray(availability)) return set;
  availability.forEach(a => {
    if (a.available === false || a.outOfStock === true) {
      set.add(a.guid);
    }
  });
  return set;
}

// ── Detect if a modifier group represents drink sizes ─────────────────────
const SIZE_PATTERN = /\d+\s*oz|small|medium|large|single|double/i;

function findSizeGroup(modifierGroups) {
  if (!Array.isArray(modifierGroups)) return null;
  return modifierGroups.find(mg =>
    Array.isArray(mg.modifiers) &&
    mg.modifiers.some(m => SIZE_PATTERN.test(m.name))
  ) || null;
}

// ── Transform a single Toast menu item → our format ───────────────────────
function transformItem(toastItem, outOfStock) {
  const base = {
    id:      toastItem.guid,
    name:    toastItem.name,
    soldOut: outOfStock.has(toastItem.guid) || undefined,
  };

  // Remove undefined keys to keep Firebase tidy
  if (!base.soldOut) delete base.soldOut;

  const sizeGroup = findSizeGroup(toastItem.modifierGroups);

  if (sizeGroup && sizeGroup.modifiers.length > 1) {
    // Coffee-style item — build sizes array
    return {
      ...base,
      note: toastItem.description || undefined,
      sizes: sizeGroup.modifiers.map(m => ({
        label: m.name,
        // Base price + modifier price
        price: ((toastItem.price || 0) + (m.price || 0)).toFixed(2),
      })),
    };
  }

  return {
    ...base,
    price:       toastItem.price != null ? toastItem.price.toFixed(2) : undefined,
    description: toastItem.description || undefined,
  };
}

// ── Transform Toast menus → our sections format ───────────────────────────
function transformMenu(toastMenus, availability) {
  const outOfStock = buildOutOfStockSet(availability);
  const sections   = [];

  (toastMenus || []).forEach(menu => {
    (menu.menuGroups || []).forEach(group => {
      // Skip excluded categories (case-insensitive)
      const groupNameLower = (group.name || '').toLowerCase();
      if (EXCLUDED_CATEGORIES.some(ex => groupNameLower.includes(ex))) return;

      const items = (group.menuItems || [])
        .filter(item => {
          // Skip items not visible on online ordering
          const vis = item.visibility;
          if (Array.isArray(vis) && vis.length && !vis.includes('TOAST_ONLINE_ORDERING')) {
            return false;
          }
          return true;
        })
        .map(item => transformItem(item, outOfStock));

      if (items.length === 0) return;

      sections.push({
        id:    group.guid,
        title: group.name,
        note:  null,
        items,
      });
    });
  });

  return { sections };
}

// ── Core sync logic (shared by scheduled + HTTP triggers) ─────────────────
async function runSync(config) {
  const { clientId, clientSecret, restaurantGuid } = config;

  if (!clientId || !clientSecret || !restaurantGuid) {
    throw new Error(
      'Missing Toast credentials. Set them with:\n' +
      '  firebase functions:config:set ' +
      'toast.client_id="…" toast.client_secret="…" toast.restaurant_guid="…"'
    );
  }

  const token           = await getToken(clientId, clientSecret);
  const { menus, availability } = await fetchToastData(token, restaurantGuid);
  const menuData        = transformMenu(menus, availability);

  await admin.database().ref('menu').set(menuData);

  console.log(
    `[Toast sync] Updated ${menuData.sections.length} sections, ` +
    `${menuData.sections.reduce((n, s) => n + s.items.length, 0)} items.`
  );

  return menuData;
}

// ── Scheduled sync — every 5 minutes ──────────────────────────────────────
exports.syncToastMenu = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('America/Chicago')
  .onRun(async () => {
    const cfg = functions.config().toast || {};
    try {
      await runSync({
        clientId:       cfg.client_id,
        clientSecret:   cfg.client_secret,
        restaurantGuid: cfg.restaurant_guid,
      });
    } catch (err) {
      console.error('[Toast sync] Failed:', err.message);
    }
    return null;
  });

// ── Manual HTTP trigger — POST /syncNow with header x-sync-secret ─────────
exports.syncNow = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Use POST');
    return;
  }

  const cfg    = functions.config().toast    || {};
  const syncCfg = functions.config().sync   || {};

  // Optional secret header to prevent random people triggering syncs
  if (syncCfg.secret && req.headers['x-sync-secret'] !== syncCfg.secret) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    const result = await runSync({
      clientId:       cfg.client_id,
      clientSecret:   cfg.client_secret,
      restaurantGuid: cfg.restaurant_guid,
    });
    res.json({
      ok:       true,
      sections: result.sections.length,
      items:    result.sections.reduce((n, s) => n + s.items.length, 0),
    });
  } catch (err) {
    console.error('[syncNow] Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});
