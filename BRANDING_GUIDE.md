# 🏆 Z2B LEGACY BUILDERS APP - Branding Guide

## Premium Gold & Black Edition

---

## 🎨 Color Palette

### Primary Colors

**Gold Shades:**
- `#FFD700` - Bright Gold (Primary gold, highlights)
- `#DAA520` - Goldenrod (Main gold, accents)
- `#B8860B` - Dark Goldenrod (Shadows, gradients)

**Black Shades:**
- `#000000` - Pure Black (Primary background)
- `#1a1a1a` - Dark Charcoal (Secondary background)
- `#2a2a2a` - Charcoal (Tertiary background)

### Accent Colors

**Neutral Shades:**
- `#ffffff` - White (Cards, content areas)
- `#f5f5f5` - Light Gray (Main content background)
- `#e8e8e8` - Soft Gray (Subtle backgrounds)
- `#d4d4d4` - Medium Gray (Text on dark)

---

## 🎯 Usage Guidelines

### Sidebar
- **Background:** Pure Black `#000000`
- **Header:** Dark gradient with gold border
- **Title:** Bright Gold `#DAA520` with bold weight
- **Menu Text:** Light Gray `#d4d4d4`
- **Active Menu:** Gold gradient `#DAA520` to `#B8860B`
- **Border:** Gold `#DAA520`

### Header Banners
- **Background:** Black gradient `#000000` to `#1a1a1a`
- **Border:** Gold `#DAA520` (2px)
- **Title:** Bright Gold `#FFD700`
- **Text:** Light Gray `#d4d4d4`

### Buttons
- **Primary:** Gold gradient `#DAA520` to `#B8860B`
- **Text:** Black `#000000`
- **Hover:** Lighter gold gradient `#FFD700` to `#DAA520`

### Cards
- **Background:** White `#ffffff`
- **Border:** Light gray `#e5e5e5`
- **Hover Shadow:** Gold glow `rgba(218, 165, 32, 0.2)`
- **Gold Accent Cards:** Border `#DAA520`

### Progress Bars
- **Track:** Light gray `#e5e5e5`
- **Fill:** Gold gradient `#FFD700` to `#DAA520`
- **Border:** Gold `#DAA520`

### Info Boxes
- **Background:** Transparent gold `rgba(218, 165, 32, 0.1)`
- **Border:** Gold `#DAA520` (2px)
- **Amber Variant:** Gold gradient background

---

## 🎭 Tier Colors

### Bronze Tier
```css
background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
color: #fff;
```

### Silver Tier
```css
background: linear-gradient(135deg, #C0C0C0 0%, #808080 100%);
color: #000;
```

### Gold Tier
```css
background: linear-gradient(135deg, #FFD700 0%, #DAA520 100%);
color: #000;
```

### Platinum Tier
```css
background: linear-gradient(135deg, #E5E4E2 0%, #BCC6CC 100%);
color: #000;
```

### Diamond Tier
```css
background: linear-gradient(135deg, #B9F2FF 0%, #00CED1 100%);
color: #000;
```

---

## 📐 Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
```

### Font Weights
- **Regular:** 400
- **Medium:** 500
- **Semibold:** 600
- **Bold:** 700

### Sizes
- **Headings:** 20px - 32px
- **Body:** 14px - 16px
- **Small:** 12px - 13px
- **Tiny:** 11px

### Letter Spacing
- **Headings:** 1px
- **Uppercase Labels:** 0.5px
- **Body:** Normal

---

## 🌟 Effects & Animations

### Shadows
```css
/* Standard Card Shadow */
box-shadow: 0 4px 6px rgba(0,0,0,0.1);

/* Hover Shadow (Gold Glow) */
box-shadow: 0 6px 12px rgba(218, 165, 32, 0.2);

/* Sidebar Shadow */
box-shadow: 2px 0 5px rgba(218, 165, 32, 0.3);
```

### Transitions
```css
/* Standard */
transition: all 0.3s;

/* Button Hover */
transition: transform 0.3s, box-shadow 0.3s;

/* Sidebar Collapse */
transition: width 0.3s;
```

### Hover Effects
- **Cards:** Lift up 2px + gold shadow
- **Buttons:** Lift up 2px + darker shadow
- **Menu Items:** Gold tint background

---

## 🎨 Gradient Patterns

### Primary Gold Gradient
```css
background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
```

### Bright Gold Gradient
```css
background: linear-gradient(135deg, #FFD700 0%, #DAA520 100%);
```

### Dark Background Gradient
```css
background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
```

### Light Background Gradient
```css
background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
```

### Gold Progress Fill
```css
background: linear-gradient(90deg, #FFD700 0%, #DAA520 100%);
```

---

## 🔲 Border Styles

### Standard Border
```css
border: 1px solid #e5e5e5;
```

### Gold Accent Border
```css
border: 2px solid #DAA520;
```

### Gold Highlight Border
```css
border: 2px solid #FFD700;
```

---

## 🖱️ Scrollbar Styling

```css
/* Track */
::-webkit-scrollbar-track {
    background: #1a1a1a;
}

/* Thumb */
::-webkit-scrollbar-thumb {
    background: #DAA520;
    border-radius: 4px;
}

/* Thumb Hover */
::-webkit-scrollbar-thumb:hover {
    background: #FFD700;
}
```

---

## 📱 Component-Specific Colors

### Badges
- **Active:** Green variations (maintain functionality)
- **Bronze:** Use bronze tier gradient
- **Silver:** Use silver tier gradient
- **Gold:** Use gold tier gradient
- **Platinum:** Use platinum tier gradient

### Tables
- **Header Background:** `#f9fafb`
- **Border:** `#e5e5e5`
- **Hover Row:** Light gold tint

### Forms
- **Input Border:** `#ddd`
- **Focus Border:** `#DAA520`
- **Label Color:** `#333`

---

## 🎯 Key Brand Elements

### App Name
**Official Name:** Z2B LEGACY BUILDERS APP

**Display Formats:**
- Full: "Z2B LEGACY BUILDERS APP"
- Short: "Z2B LEGACY"
- Tagline: "Premium Gold & Black Edition"

### Logo Text Styling
```css
color: #DAA520;
font-size: 20px;
font-weight: 700;
letter-spacing: 1px;
```

---

## 💡 Best Practices

### Do's ✅
- Use gold gradients for primary CTAs
- Maintain high contrast for readability
- Use gold accents sparingly for emphasis
- Keep backgrounds primarily black or white
- Use transitions for smooth interactions
- Apply gold glow on hover states

### Don'ts ❌
- Don't use too many gold elements together
- Don't use low-contrast gold on white
- Don't mix incompatible gradients
- Don't overuse animations
- Don't forget accessibility contrast ratios

---

## 📊 Accessibility

### Contrast Ratios
- Gold `#DAA520` on Black `#000000`: ✅ AAA (>7:1)
- White `#ffffff` on Black `#000000`: ✅ AAA (>7:1)
- Black `#000000` on Gold `#DAA520`: ✅ AAA (>7:1)
- Gray `#d4d4d4` on Black `#000000`: ✅ AA (>4.5:1)

---

## 🚀 Quick Reference

### CSS Variables (Recommended)
```css
:root {
    --gold-bright: #FFD700;
    --gold-main: #DAA520;
    --gold-dark: #B8860B;

    --black-pure: #000000;
    --black-dark: #1a1a1a;
    --black-medium: #2a2a2a;

    --white: #ffffff;
    --gray-light: #f5f5f5;
    --gray-medium: #e8e8e8;
    --gray-text: #d4d4d4;
}
```

---

**Last Updated:** 2025
**Version:** 1.0 - Gold & Black Edition
**Status:** Active
