# SCI-FI DASHBOARD THEME - QUICK START GUIDE

## 🚀 30-Second Setup

### Step 1: Copy The CSS File
Move `scifi-theme.css` to your project's CSS folder.

### Step 2: Import in Your HTML
```html
<link rel="stylesheet" href="path/to/scifi-theme.css">
```

### Step 3: Use It!
```html
<div class="card">
  <div class="card-header">My Card</div>
  <div class="card-body">Content here</div>
</div>

<button class="btn btn-primary">Click Me</button>
```

**That's it!** Your components now have the sci-fi theme. ✨

---

## 📦 What You Have

```
coreui-free-react-admin-template-main/
├── src/scss/
│   ├── scifi-theme.scss        ← Source (SASS)
│   └── scifi-theme.css         ← Compiled CSS (use this!)
├── src/views/
│   └── SciFiDashboardShowcase.jsx  ← React component example
├── scifi-theme-demo.html       ← View in browser!
└── SCIFI_THEME_DOCUMENTATION.md ← Full docs
```

---

## 👁️ Preview

### View the Demo
1. Open `scifi-theme-demo.html` in your browser
2. See all components and effects live
3. Copy classes from the demo to your code

### Use React Component
```javascript
import SciFiDashboardShowcase from './views/SciFiDashboardShowcase'

export default function App() {
  return <SciFiDashboardShowcase />
}
```

---

## 🎨 Basic Components

### Cards
```html
<div class="card">
  <div class="card-header">Title</div>
  <div class="card-body">Content</div>
</div>
```

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
```

### Badges
```html
<span class="badge badge-primary">New</span>
<span class="badge badge-success">Active</span>
<span class="badge badge-danger">Alert</span>
```

### Alerts
```html
<div class="alert alert-primary">Info message</div>
<div class="alert alert-success">Success!</div>
<div class="alert alert-danger">Error!</div>
```

### Tables
```html
<table class="table">
  <thead>
    <tr><th>Name</th></tr>
  </thead>
  <tbody>
    <tr><td>Data</td></tr>
  </tbody>
</table>
```

### Progress
```html
<div class="progress">
  <div class="progress-bar" style="width: 65%"></div>
</div>
```

### Forms
```html
<input class="form-control" placeholder="Enter text">
<select class="form-select">
  <option>Option 1</option>
</select>
```

---

## ✨ Special Effects

### Glowing Text
```html
<h1 class="glow-text">Glowing Heading</h1>
```

### Neon Border
```html
<div class="card neon-border">Neon Border Card</div>
```

### Hologram Effect
```html
<div class="card hologram">Floating Card</div>
```

### Cyber Frame
```html
<div class="card cyberframe">Corner Brackets</div>
```

---

## 🎨 Colors & Text

### Text Colors
```html
<p class="text-cyan">Cyan Text</p>
<p class="text-purple">Purple Text</p>
```

### Background
```html
<div class="bg-dark-sci">Dark Background</div>
```

### Brand
```html
<span class="navbar-brand">My Dashboard</span>
```

---

## 🔧 Customization

### Change Colors
Edit the CSS variables at the top of `scifi-theme.css`:

```css
:root {
  --accent-cyan: #00d4ff;      /* Change this */
  --accent-purple: #8b5cf6;    /* Change this */
  --primary-dark: #0a0e27;     /* Change this */
  /* ... more variables ... */
}
```

### Disable Animations
Add this to your CSS:
```css
* {
  animation: none !important;
}
```

### Reduce Glow Effects
Change the `box-shadow` values to smaller numbers:
```css
.card {
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.05); /* Less intense */
}
```

---

## 🌍 Framework Integration

### React (CoreUI)
```javascript
import { CCard, CCardBody, CButton } from '@coreui/react'
import './scifi-theme.css'

export default function MyComponent() {
  return (
    <CCard>
      <CCardBody>
        <CButton color="primary">Click Me</CButton>
      </CCardBody>
    </CCard>
  )
}
```

### Vue
```vue
<template>
  <div class="card">
    <button class="btn btn-primary">Vue Button</button>
  </div>
</template>

<style>
import './scifi-theme.css'
</style>
```

### Angular
```typescript
import './scifi-theme.css'

@Component({
  selector: 'app-root',
  template: `
    <div class="card">
      <div class="card-body">
        <button class="btn btn-primary">Angular Button</button>
      </div>
    </div>
  `
})
export class AppComponent {}
```

### Plain HTML + Bootstrap
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="scifi-theme.css">
</head>
<body>
  <div class="container">
    <div class="card">
      <button class="btn btn-primary">HTML Button</button>
    </div>
  </div>
</body>
</html>
```

---

## ❓ Common Issues

### Colors don't look right
- Make sure the dark background is set on your `body` or `html` element
- The theme is optimized for dark backgrounds

### Animations are too fast/slow
- All animations are controlled by CSS variables
- Modify the animation duration in the CSS

### Scrollbar doesn't show style
- Some browsers don't support scrollbar styling
- Works best in Chrome, Edge, and Safari

### Text is hard to read
- Increase contrast by modifying `--text-primary` color
- Make it lighter or more saturated

---

## 🎯 Key Features

✅ **30+ Animations** - Smooth, cyber-style effects
✅ **Full Components** - All UI elements styled
✅ **No Dependencies** - Pure CSS, works anywhere
✅ **Responsive** - Mobile, tablet, desktop
✅ **Customizable** - Easy to modify colors
✅ **Production Ready** - Optimized and tested

---

## 📖 Need More Help?

Read the full documentation: `SCIFI_THEME_DOCUMENTATION.md`

View the demo: `scifi-theme-demo.html`

---

## 🎉 You're Ready!

Start using the sci-fi theme in your project:

1. Copy `scifi-theme.css`
2. Import in your HTML/React
3. Add theme classes to your elements
4. Enjoy your futuristic dashboard! 🚀

---

**Happy coding!** ✨
