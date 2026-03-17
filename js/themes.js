// ── Display themes for Big Boom Coffee menu boards ────────────────────────
// Each theme is a CSS string injected into a <style id="theme-vars"> tag.
// Override any :root variables from style.css, or add element-specific rules.

const THEMES = {

  dark: {
    name: 'Dark (Default)',
    emoji: '☕',
    css: '' // uses style.css defaults
  },

  light: {
    name: 'Light',
    emoji: '☀️',
    css: `
      :root {
        --bg:          #fdf5e4;
        --brown-dk:    #fdf5e4;
        --orange:      #bf5200;
        --orange-lt:   #d46010;
        --sage-lt:     #3d5c18;
        --cream:       #1a0800;
        --cream-dim:   #5c3010;
        --text-muted:  #5c3010;
        --divider:     rgba(140,70,0,0.25);
      }
      /* Keep header text readable on the dark header gradient */
      .header-title, .hdr-title { color: #f2e4c6 !important; }
      .header-hours, .hdr-hours { color: #b8c88a !important; }
      .item-name, .cg-name { text-shadow: none !important; }
    `
  },

  halloween: {
    name: 'Halloween',
    emoji: '🎃',
    css: `
      :root {
        --bg:          #0d0010;
        --brown-dk:    #0d0010;
        --brown-md:    #160020;
        --brown-lg:    #220030;
        --orange:      #ff6a00;
        --orange-lt:   #ff8c30;
        --sage:        #6a0dad;
        --sage-lt:     #c084e8;
        --cream:       #f5e6ff;
        --cream-dim:   #c8a0e0;
        --divider:     rgba(255,106,0,0.35);
        --rust:        #aa00cc;
      }
    `
  },

  christmas: {
    name: 'Christmas',
    emoji: '🎄',
    css: `
      :root {
        --bg:          #061206;
        --brown-dk:    #061206;
        --brown-md:    #0c1e0c;
        --brown-lg:    #152815;
        --orange:      #cc1800;
        --orange-lt:   #ff3322;
        --sage:        #1a7a1a;
        --sage-lt:     #55cc55;
        --cream:       #fff8e8;
        --cream-dim:   #ffd700;
        --divider:     rgba(200,20,0,0.40);
      }
    `
  },

  valentines: {
    name: "Valentine's Day",
    emoji: '💕',
    css: `
      :root {
        --bg:          #150008;
        --brown-dk:    #150008;
        --brown-md:    #220012;
        --brown-lg:    #32001c;
        --orange:      #e0245e;
        --orange-lt:   #ff4d8d;
        --sage:        #8b1a4a;
        --sage-lt:     #ff99cc;
        --cream:       #fff0f5;
        --cream-dim:   #ffb3cc;
        --divider:     rgba(224,36,94,0.35);
      }
    `
  },

  stpatricks: {
    name: "St. Patrick's Day",
    emoji: '🍀',
    css: `
      :root {
        --bg:          #011506;
        --brown-dk:    #011506;
        --brown-md:    #042010;
        --brown-lg:    #082e18;
        --orange:      #22aa00;
        --orange-lt:   #44dd00;
        --sage:        #156600;
        --sage-lt:     #66cc44;
        --cream:       #f0ffe8;
        --cream-dim:   #b8e890;
        --divider:     rgba(34,170,0,0.35);
      }
    `
  },

  july4th: {
    name: '4th of July',
    emoji: '🎆',
    css: `
      :root {
        --bg:          #01010f;
        --brown-dk:    #01010f;
        --brown-md:    #05051a;
        --brown-lg:    #080828;
        --orange:      #cc1100;
        --orange-lt:   #ff3322;
        --sage:        #1a1a9a;
        --sage-lt:     #8899ff;
        --cream:       #ffffff;
        --cream-dim:   #c8d8ff;
        --divider:     rgba(200,10,0,0.45);
      }
    `
  },

  thanksgiving: {
    name: 'Thanksgiving',
    emoji: '🦃',
    css: `
      :root {
        --bg:          #120600;
        --brown-dk:    #120600;
        --brown-md:    #221000;
        --brown-lg:    #321800;
        --orange:      #d46000;
        --orange-lt:   #e87c20;
        --sage:        #8a4000;
        --sage-lt:     #cc8040;
        --cream:       #fff5e0;
        --cream-dim:   #e8c880;
        --divider:     rgba(180,80,0,0.35);
      }
    `
  },

  easter: {
    name: 'Easter',
    emoji: '🐣',
    css: `
      :root {
        --bg:          #0e0818;
        --brown-dk:    #0e0818;
        --brown-md:    #180f28;
        --brown-lg:    #241538;
        --orange:      #cc44cc;
        --orange-lt:   #ee66ee;
        --sage:        #228822;
        --sage-lt:     #66cc66;
        --cream:       #fff0ff;
        --cream-dim:   #d8b8f0;
        --divider:     rgba(180,60,180,0.30);
      }
    `
  },

  newyear: {
    name: "New Year's",
    emoji: '🥂',
    css: `
      :root {
        --bg:          #040404;
        --brown-dk:    #040404;
        --brown-md:    #0e0e0e;
        --brown-lg:    #181818;
        --orange:      #c8a800;
        --orange-lt:   #ffd700;
        --sage:        #888888;
        --sage-lt:     #cccccc;
        --cream:       #ffffff;
        --cream-dim:   #e0d090;
        --divider:     rgba(200,168,0,0.45);
      }
    `
  },

  starwars: {
    name: 'Star Wars Day',
    emoji: '⚔️',
    css: `
      :root {
        --bg:          #010408;
        --brown-dk:    #010408;
        --brown-md:    #050c18;
        --brown-lg:    #0a1525;
        --orange:      #00cc44;
        --orange-lt:   #00ff66;
        --sage:        #0055aa;
        --sage-lt:     #4499ee;
        --cream:       #e8f4ff;
        --cream-dim:   #88ccff;
        --divider:     rgba(0,180,60,0.40);
      }
    `
  },

  nationalcoffeeday: {
    name: 'National Coffee Day',
    emoji: '☕',
    css: `
      :root {
        --bg:          #0c0500;
        --brown-dk:    #0c0500;
        --brown-md:    #1e0d00;
        --brown-lg:    #2c1500;
        --orange:      #c07820;
        --orange-lt:   #e09840;
        --sage:        #7a5030;
        --sage-lt:     #c09060;
        --cream:       #fff8ee;
        --cream-dim:   #e8d0a0;
        --divider:     rgba(160,90,10,0.40);
      }
    `
  },

};
