# Quotation Builder Plugin

Professional interactive quotation calculator for service-based Squarespace websites.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Squarespace](https://img.shields.io/badge/Squarespace-7.0%20%7C%207.1-black)
![License](https://img.shields.io/badge/license-Commercial-green)

---

## 🎯 Overview

The **Quotation Builder** helps service businesses create interactive pricing calculators on their Squarespace website.  Customers answer a series of questions, see the price update in real-time, and can save or email their quote.

### Perfect For:
- 📸 Photographers & Videographers
- 🎨 Designers & Creative Agencies
- 🏗️ Contractors & Service Providers
- 💍 Event Planners & Wedding Services
- 🖥️ Web Developers & Consultants
- 🎓 Coaches & Educators

---

## ✨ Features

### Core Features
- ✅ **Interactive Q&A Flow** - Step-by-step question progression
- ✅ **Real-time Total** - Price updates as users make selections
- ✅ **3-Box Layout** - Previous question, current question, summary sidebar
- ✅ **Navigation** - Go back to edit previous answers
- ✅ **Skip Questions** - Optional questions can be skipped
- ✅ **Collapsible Summary** - Show/hide selection details

### Export Options
- 📄 **PDF Download** - Print-friendly quotation summary
- 📧 **Contact Form Integration** - Pass quote data to Squarespace form
- 💾 **Session Storage** - Quote persists during browsing session

### Customization
- 🎨 **Full Theme Control** - Colors, fonts, spacing
- 📱 **Fully Responsive** - Works perfectly on mobile
- ♿ **Accessible** - WCAG compliant
- 🌐 **Multi-currency** - Support any currency symbol

---

## 🚀 Installation

### Step 1: Add Code Block

In your Squarespace page editor: 
1. Click the **+** icon to add a block
2. Select **Code** under the **Advanced** section
3. Paste the installation code below

### Step 2: Basic Installation

```html
<div id="quotemachine"></div>
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/quotation-builder/quotation-builder.min.js"></script>
```

### Step 3: Save & Publish

Click **Save** → **Publish** and view your page! 

---

## 🎨 Customization

### Color & Font Customization

Add parameters to the script URL to match your brand:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/quotation-builder/quotation-builder.min.js?font: Helvetica;bg:ffffff;primary:ff0000"></script>
```

### Available Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `font` | Main font family | `Arial`, `Helvetica`, `Poppins` |
| `accentfont` | Font for prices/numbers | `Georgia`, `Times New Roman` |
| `bg` | Background color (hex, no #) | `ffffff`, `f8f8f8` |
| `fontcolor` | Main text color | `000000`, `333333` |
| `accentcolor` | Secondary text color | `666666`, `999999` |
| `border` | Border color | `e8e8e8`, `cccccc` |
| `primary` | Primary/button color | `ff0000`, `0066cc` |

### Example Themes

**Dark Mode:**
```html
<script src="... quotation-builder.min.js? font:Inter;bg:1a1a1a;fontcolor:ffffff;accentcolor: 9a9a9a;border:333333;primary:ffffff"></script>
```

**Elegant Serif:**
```html
<script src="...quotation-builder.min.js?font:Playfair Display;accentfont:Lato;bg:faf9f7;fontcolor:2c2c2c;primary:8b7355"></script>
```

**Modern Blue:**
```html
<script src="...quotation-builder.min.js?font:Poppins;bg:f0f4f8;fontcolor:1e293b;primary:0ea5e9"></script>
```

---

## ⚙️ Configuration

### Editing Questions & Prices

**Option 1: Contact Anavo Tech** (Recommended)
- Email support@anavotech.com with your questions/pricing
- We'll create a custom version for you
- Includes free updates

**Option 2: Self-Host Custom Version**
1. Download `quotation-builder.js` from this repo
2. Edit the `CONFIG` section (lines 100-200)
3. Upload to your own server
4. Update script URL in your Code Block

### Default Configuration

The plugin comes pre-configured with sample questions for photography services.  You can customize: 

- **Company Name** - Your business name
- **Currency** - Any currency symbol ($, €, £, ¥, etc.)
- **Contact Page** - Where to redirect after quote
- **Questions** - Your service options
- **Pricing** - Your actual prices

---

## 📊 Contact Form Integration

### How It Works

When a customer clicks **"Continue to Contact Form"**, the quote is saved and passed to your Squarespace contact form.

### Setup Instructions

**1. Create a Contact Form page** (if you don't have one)

**2. Add hidden fields to capture quote data:**

```html
<!-- Add this Code Block ABOVE your contact form -->
<script>
window.addEventListener('load', function() {
  // Get saved quote data
  const quoteTotal = sessionStorage.getItem('qb_total');
  const quoteItems = sessionStorage.getItem('qb_items');
  
  if (quoteTotal) {
    // Auto-fill a field in your form (adjust selector to match your form)
    const messageField = document.querySelector('textarea[name*="message"]');
    if (messageField) {
      let message = `Quote Total: $${parseFloat(quoteTotal).toFixed(2)}\n\n`;
      message += 'Selected Services:\n';
      
      if (quoteItems) {
        const items = JSON.parse(quoteItems);
        items.forEach(item => {
          message += `- ${item.label}:  $${item.price.toFixed(2)}\n`;
        });
      }
      
      messageField. value = message + '\n\n[Your message here]';
    }
  }
});
</script>
```

**3. Update your config:**

Set `contactPage` to your form's URL (e.g., `/contact`)

---

## 🎬 Live Examples

### Basic Example
```html
<!DOCTYPE html>
<html>
<head>
    <title>Quotation Builder - Basic Example</title>
</head>
<body>
    <h1>Get Your Custom Quote</h1>
    
    <div id="quotemachine"></div>
    <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/quotation-builder/quotation-builder.min.js"></script>
</body>
</html>
```

See more examples in the [`examples/`](examples/) folder.

---

## 🔐 Licensing

This plugin requires a **valid license** to use on live websites.

### License Types

| License | Domains | Price | Best For |
|---------|---------|-------|----------|
| **Individual** | 1 domain | $49 | Single business |
| **Agency** | 10 domains | $199 | Freelancers/agencies |
| **Enterprise** | Unlimited | $499 | Large agencies |

### How Licensing Works

1. **Purchase** a license at [anavotech.com/plugins](https://anavotech.com/plugins)
2. **Register** your Squarespace domain
3. **Install** the plugin (no code changes needed!)
4. **Automatic activation** - works immediately

### Development & Testing

**Free for development:**
- Works on `localhost`, `.local` domains
- Works on Squarespace staging sites
- Displays watermark on live sites without license

---

## 🆘 Troubleshooting

### Plugin Not Showing

**Check console for errors** (F12 in browser):

✅ Should see: `🎨 Quotation Builder v1.0.0 - Loading...`

If you see errors: 

1. **Make sure you have the div:** `<div id="quotemachine"></div>` BEFORE the script
2. **Check the script URL** is correct
3. **Clear your cache** and reload
4. **Check for JavaScript conflicts** from other plugins

### Styling Issues

**If layout is broken:**
- Check for CSS conflicts with your Squarespace theme
- Try adding `! important` to custom CSS
- Contact support@anavotech.com for theme-specific help

### License Not Activating

**If watermark still shows on licensed domain:**
1. Clear browser cache
2. Check domain is exactly as registered (www vs non-www)
3. Wait 5 minutes for license propagation
4. Contact support@anavotech.com with your license key

---

## 📚 Documentation

- [Installation Guide](../docs/installation.md)
- [Customization Guide](../docs/customization.md)
- [API Reference](../docs/api-reference.md)
- [Troubleshooting](../docs/troubleshooting.md)

---

## 🔄 Updates & Changelog

### Version 1.0.0 (2026-01-20)

**Initial Release:**
- ✨ Interactive quotation builder
- ✨ 3-box responsive layout
- ✨ PDF export functionality
- ✨ Contact form integration
- ✨ Full theme customization
- ✨ Licensing system
- ✨ Mobile responsive design

[View Full Changelog](CHANGELOG.md)

---

## 💬 Support

### Get Help

- 📧 **Email:** support@anavotech.com
- 💬 **Live Chat:** [anavotech.com](https://anavotech.com)
- 📖 **Documentation:** [docs.anavotech.com](https://docs.anavotech.com)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)

### Response Times
- **Email:** Within 24 hours
- **Live Chat:** Business hours (9AM-5PM EST)
- **Enterprise:** Priority support (2-hour response)

---

## 🏗️ Technical Details

### Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)
- ⚠️ IE11 not supported

### Dependencies
- **None! ** Pure vanilla JavaScript
- No jQuery required
- No external libraries

### Performance
- 📦 **Size:** ~8KB minified
- ⚡ **Load Time:** <100ms
- 🚀 **CDN:** Global jsDelivr network

### Privacy
- ✅ No cookies
- ✅ No tracking
- ✅ GDPR compliant
- ✅ Only checks license (domain name only)

---

## 🙏 Credits

**Built by:** [Anavo Tech](https://anavotech.com)

**Technologies:**
- Vanilla JavaScript (ES6+)
- CSS3 with CSS Variables
- jsDelivr CDN
- GitHub for version control

**Inspired by:**
- Squarekicker
- Elfsight
- POWR

---

## ⚖️ License

**Commercial License** - See [LICENSE. md](../LICENSE.md)

© 2026 Anavo Tech. All rights reserved.

---

<p align="center">
  <strong>Built for Squarespace • Powered by Anavo Tech</strong>
</p>

<p align="center">
  <a href="https://anavotech.com">Website</a> •
  <a href="https://anavotech.com/plugins">Get License</a> •
  <a href="https://docs.anavotech.com">Documentation</a> •
  <a href="mailto:support@anavotech.com">Support</a>
</p>
