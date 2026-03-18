// Default menu — loaded when Firebase isn't configured yet.
// Once Firebase is set up, the admin panel manages all data.

const DEFAULT_MENU = {
  sections: [
    {
      id: "coffee",
      title: "Coffee & Drinks",
      note: null,
      items: [
        // ── oz-grid items (rendered as aligned table in landscape) ──
        {
          id: "drip-coffee",
          name: "Drip Coffee",
          sizes: [
            { label: "16oz", price: "2.99" },
            { label: "20oz", price: "3.49" },
            { label: "24oz", price: "3.99" }
          ]
        },
        {
          id: "cold-brew",
          name: "Signature Cold Brew",
          sizes: [
            { label: "16oz", price: "3.99" },
            { label: "20oz", price: "4.49" },
            { label: "24oz", price: "4.99" }
          ]
        },
        {
          id: "latte",
          name: "Latte",
          note: "Hot or Iced",
          sizes: [
            { label: "16oz", price: "4.99" },
            { label: "20oz", price: "5.49" },
            { label: "24oz", price: "5.99" }
          ]
        },
        {
          id: "mocha",
          name: "Mocha",
          note: "Hot or Iced",
          sizes: [
            { label: "16oz", price: "4.99" },
            { label: "20oz", price: "5.49" },
            { label: "24oz", price: "5.99" }
          ]
        },
        {
          id: "americano",
          name: "Americano",
          sizes: [
            { label: "16oz", price: "3.99" }
          ]
        },
        {
          id: "cappuccino",
          name: "Cappuccino",
          sizes: [
            { label: "16oz", price: "4.49" }
          ]
        },
        {
          id: "mocha-frappe",
          name: "Mocha Frappe",
          sizes: [
            { label: "16oz", price: "5.75" },
            { label: "20oz", price: "6.75" }
          ]
        },
        // ── non-grid items ──
        {
          id: "espresso",
          name: "Espresso",
          sizes: [
            { label: "Single", price: "2.99" },
            { label: "Double", price: "4.99" }
          ]
        },
        {
          id: "tea",
          name: "Tea (sweet)",
          sizes: [
            { label: "16oz", price: "2.49" },
            { label: "20oz", price: "2.79" },
            { label: "32oz", price: "3.49" }
          ]
        },
        {
          id: "lit-tea",
          name: "LIT TEA!!!",
          price: "7.99",
          description: "<b>Cherry Boom</b> (Cherry/Lemonade) \u00b7 <b>Firecracker Punch</b> (Fruit Punch) \u00b7 <b>Blue Bomb</b> (Blue Raspberry) \u00b7 <b>Fourth of July</b> (Blue Raspberry/Cherry)",
          levels: ["No Lit (0mg)", "Not So Lit (35mg)", "Lit (115mg)", "Boosted (200mg)"],
          special: true
        },
        {
          id: "bottled-drinks",
          name: "Bottled Drinks",
          price: "2.25",
          sectionGap: true
        },
        {
          id: "water",
          name: "Water",
          price: "1.00"
        },
        {
          id: "kids-drinks",
          name: "Kids Drinks",
          price: "1.50",
          kidsSep: true
        }
      ]
    },
    {
      id: "breakfast",
      title: "Breakfast",
      note: "Served 5:00am \u2013 10:30am",
      items: [
        // ── Burritos & Sandwiches ──
        {
          id: "breakfast-burrito",
          name: "Breakfast Burrito",
          price: "6.49",
          description: "Bacon or Sausage",
          subCategory: "Burritos & Sandwiches",
          subCategoryNote: "All include Eggs & Cheese"
        },
        {
          id: "big-boom-burrito",
          name: "Big Boom Burrito",
          price: "6.99",
          description: "Sausage, Bacon, Gravy, Potatoes",
          subCategory: "Burritos & Sandwiches"
        },
        {
          id: "flaky-boom",
          name: "The Flaky Boom",
          price: "6.49",
          description: "Croissant, Bacon or Sausage",
          subCategory: "Burritos & Sandwiches"
        },
        {
          id: "breakfast-biscuit",
          name: "The Breakfast Biscuit",
          price: "6.49",
          description: "Biscuit, Bacon or Sausage",
          subCategory: "Burritos & Sandwiches"
        },
        {
          id: "kids-breakfast",
          name: "Kids Breakfast",
          price: "5.99",
          description: "Biscuit, Bacon or Sausage",
          subCategory: "Burritos & Sandwiches"
        },
        // ── Bowls ──
        {
          id: "breakfast-bowl",
          name: "Breakfast Bowl",
          price: "6.99",
          description: "Bacon or Sausage",
          subCategory: "Bowls",
          subCategoryNote: "All include Eggs & Cheese"
        },
        {
          id: "big-breakfast-bowl",
          name: "Big Breakfast Bowl",
          price: "7.99",
          description: "Sausage, Bacon, Gravy, Potatoes",
          subCategory: "Bowls"
        },
        {
          id: "biscuits-gravy",
          name: "Biscuits & Gravy Bowl",
          price: "7.49",
          description: "Biscuit, Gravy",
          subCategory: "Bowls"
        },
        {
          id: "bacon-grits",
          name: "Bacon & Grits Bowl",
          price: "7.49",
          description: "Grits, Bacon",
          subCategory: "Bowls"
        },
        {
          id: "sausage-grits",
          name: "Sausage & Grits Bowl",
          price: "7.49",
          description: "Grits, Sausage",
          subCategory: "Bowls"
        }
      ]
    },
    {
      id: "lunch",
      title: "Lunch",
      note: "Served from 10:30am",
      items: [
        {
          id: "paninis",
          name: "Paninis",
          price: "9.49",
          description: "Turkey, Ham or Roast Beef \u00b7 Cheese & Boom Sauce"
        },
        {
          id: "garden-salad",
          name: "Garden Salad",
          price: "7.99",
          description: "Spring Mix, Cheese, Tomatoes"
        },
        {
          id: "blt",
          name: "BLT",
          price: "8.99",
          description: "Spring Mix, Bacon, Lettuce, Tomato"
        },
        {
          id: "club-salad",
          name: "Club Salad",
          price: "10.49",
          description: "Ham, Bacon, Lettuce, Tomato"
        },
        {
          id: "chicken-salad",
          name: "Chicken Salad",
          price: "10.49",
          description: "Chicken, Bacon, Lettuce, Tomato"
        },
        {
          id: "lunch-combo",
          name: "Lunch Combo",
          price: "13.49",
          description: "Choice of Sandwich, Chips & Drink"
        },
        {
          id: "kids-lunch",
          name: "Kids Lunch",
          price: "5.99",
          description: "Grilled Cheese, Chips & Drink"
        },
        {
          id: "kids-chicken-fingers",
          name: "Kids Chicken Fingers",
          price: "5.99",
          description: "4pc Chicken Fingers, Chips & Drink"
        },
        {
          id: "soup",
          name: "Soup of the Day",
          price: null,
          badge: "Coming Soon!"
        },
        // ── Bakery ──
        {
          id: "scones",
          name: "Scones",
          price: "3.79",
          description: "Chocolate · Blueberry · Flavor of the Day",
          subCategory: "Bakery"
        },
        {
          id: "muffins",
          name: "Banana Nut Muffins",
          price: "3.99",
          subCategory: "Bakery"
        }
      ]
    }
  ]
};

// ── Helpers ────────────────────────────────────────────────────────────────

// Firebase converts arrays to {0: …, 1: …} objects — this converts them back
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.keys(val)
    .sort((a, b) => Number(a) - Number(b))
    .map(k => val[k]);
}

function normalizeMenu(data) {
  if (!data || !data.sections) return DEFAULT_MENU;
  const themes = data.themes || { landscape: data.theme || 'dark', portrait: data.theme || 'dark' };
  return {
    themes,
    portraitRight: data.portraitRight || 'auto',
    sections: toArray(data.sections).map(s => ({
      ...s,
      items: toArray(s.items).map(item => ({
        ...item,
        sizes:  item.sizes  ? toArray(item.sizes)  : undefined,
        levels: item.levels ? toArray(item.levels) : undefined
      }))
    }))
  };
}
