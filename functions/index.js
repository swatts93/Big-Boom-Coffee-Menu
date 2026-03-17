const functions  = require('firebase-functions');
const admin      = require('firebase-admin');
const axios      = require('axios');

admin.initializeApp();

// ── Toast API endpoints ────────────────────────────────────────────────────
const TOAST_BASE  = 'https://ws-api.toasttab.com';
const TOAST_AUTH  = `${TOAST_BASE}/authentication/v1/authentication/login`;
const TOAST_MENUS = `${TOAST_BASE}/menus/v2/menus`;

// ── Categories to exclude from the TV display (retail, merch, etc.) ───────
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

// ── Fetch restaurant menus ─────────────────────────────────────────────────
// Returns a Restaurant object: { menus[], modifierGroupReferences{}, modifierOptionReferences{} }
async function fetchRestaurant(token, restaurantGuid) {
  const { data } = await axios.get(TOAST_MENUS, {
    headers: {
      'Authorization':                `Bearer ${token}`,
      'Toast-Restaurant-External-ID': restaurantGuid,
    },
  });
  return data;
}

// ── Build modifier lookup maps from the top-level Restaurant reference maps ─
// V2 stores all modifier groups/options at the Restaurant level, referenced by
// integer referenceIds from MenuItem.modifierGroupReferences arrays.
function buildModifierMaps(restaurant) {
  // keyed by GUID — used to find the size group from pricingRules.sizeSpecificPricingGuid
  const groupsByGuid = {};
  Object.values(restaurant.modifierGroupReferences || {}).forEach(mg => {
    groupsByGuid[mg.guid] = mg;
  });

  // keyed by referenceId integer — used to look up size options
  const optionsByRef = {};
  Object.values(restaurant.modifierOptionReferences || {}).forEach(mo => {
    optionsByRef[mo.referenceId] = mo;
  });

  return { groupsByGuid, optionsByRef };
}

// ── For SIZE_PRICE items: find the size modifier group and extract sizes ───
// Toast encodes coffee-style multi-size pricing as:
//   item.pricingStrategy === 'SIZE_PRICE'
//   item.pricingRules.sizeSpecificPricingGuid → a ModifierGroup
//   that ModifierGroup.modifierOptionReferences → array of referenceIds
//   each ModifierOption has .name ("12oz") and .price (4.49)
function getSizes(item, groupsByGuid, optionsByRef) {
  if (item.pricingStrategy !== 'SIZE_PRICE') return null;
  const sizeGuid = item.pricingRules && item.pricingRules.sizeSpecificPricingGuid;
  if (!sizeGuid) return null;

  const sizeGroup = groupsByGuid[sizeGuid];
  if (!sizeGroup || !Array.isArray(sizeGroup.modifierOptionReferences)) return null;

  const sizes = sizeGroup.modifierOptionReferences
    .map(refId => optionsByRef[refId])
    .filter(mo => mo && mo.price != null)
    .map(mo => ({ label: mo.name, price: mo.price.toFixed(2) }));

  return sizes.length > 1 ? sizes : null;
}

// ── Determine if an item should appear on the menu board ──────────────────
// visibility[] is empty when an item is hidden from all channels.
// We include items visible on POS; null/missing visibility is treated as visible.
function isVisible(item) {
  const vis = item.visibility;
  if (!Array.isArray(vis)) return true;   // unset = include
  if (vis.length === 0) return false;     // explicitly hidden everywhere
  return vis.includes('POS');
}

// ── Transform a single Toast menu item → our format ───────────────────────
function transformItem(toastItem, groupsByGuid, optionsByRef) {
  const base = {
    id:   toastItem.guid,
    name: toastItem.name,
  };

  const sizes = getSizes(toastItem, groupsByGuid, optionsByRef);
  if (sizes) {
    return {
      ...base,
      note:  toastItem.description || undefined,
      sizes,
    };
  }

  return {
    ...base,
    price:       toastItem.price != null ? toastItem.price.toFixed(2) : undefined,
    description: toastItem.description || undefined,
  };
}

// ── Recursively collect items from a MenuGroup and its nested children ─────
// Child menu groups become subCategory dividers within the parent section.
function collectItems(group, groupsByGuid, optionsByRef, subCategoryName) {
  const items = [];

  (group.menuItems || []).forEach(item => {
    if (!isVisible(item)) return;
    const transformed = transformItem(item, groupsByGuid, optionsByRef);
    if (subCategoryName) transformed.subCategory = subCategoryName;
    items.push(transformed);
  });

  (group.menuGroups || []).forEach(child => {
    const childNameLower = (child.name || '').toLowerCase();
    if (EXCLUDED_CATEGORIES.some(ex => childNameLower.includes(ex))) return;
    items.push(...collectItems(child, groupsByGuid, optionsByRef, child.name));
  });

  return items;
}

// ── Transform Restaurant → our { sections } format ────────────────────────
function transformMenu(restaurant) {
  const { groupsByGuid, optionsByRef } = buildModifierMaps(restaurant);
  const sections = [];

  (restaurant.menus || []).forEach(menu => {
    (menu.menuGroups || []).forEach(group => {
      const groupNameLower = (group.name || '').toLowerCase();
      if (EXCLUDED_CATEGORIES.some(ex => groupNameLower.includes(ex))) return;

      const items = collectItems(group, groupsByGuid, optionsByRef, null);
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

  const token      = await getToken(clientId, clientSecret);
  const restaurant = await fetchRestaurant(token, restaurantGuid);
  const menuData   = transformMenu(restaurant);

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

// ── Manual HTTP trigger — POST /syncNow with optional x-sync-secret header ─
exports.syncNow = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Use POST');
    return;
  }

  const cfg     = functions.config().toast || {};
  const syncCfg = functions.config().sync  || {};

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
