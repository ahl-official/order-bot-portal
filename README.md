# AHL Order Management, Edit & Repeat CRR Single Page Application

A lightweight, ultra-fast, serverless Web + Mobile Single Page Application (SPA) designed for American Hairline staff (Roshani, Saniya, Branch Managers) to:
1. **Directly Edit Finalized Orders:** Open an order via link (`?id=AHL-XXXX`), modify any field (Advance, Size, Measurements, etc.), and save.
2. **Auto-Synchronize Records:** Updates the Google Sheets database (`Order Forms`), regenerates the PDF in Google Drive, and sends an updated copy to WhatsApp via WAHA.
3. **1-Click Repeat Orders (CRR):** Clones past client specifications and measurements into a new linked Order ID (`AHL-XXXX-CRR`) in 15 seconds.

---

## 🚀 Live Workflow

```
1. Order Completed on WhatsApp Bot
      │
      ▼
2. Bot sends Drive PDF + One-Click Edit Link
   (e.g. https://ahl-orders.vercel.app/?id=AHL-2006)
      │
      ▼
3. Staff opens link on Phone / Laptop
   (Pre-fills all 6 sections: Client, Consultation, Payment, Specs, Tech, Media)
      │
      ▼
4. Staff edits fields (e.g. changes Advance from ₹5k to ₹10k, Size to 6.8x8.5)
      │
      ▼
5. Staff enters 4-digit PIN (2026) and clicks "Save & Send"
      │
      ├── Updates Google Sheet row in 'Order Forms'
      ├── Updates/Regenerates PDF in Google Drive
      ├── Logs change in 'CRR New Order Changes Log'
      └── Sends WhatsApp notification: "🔔 Updated Order AHL-2006 is ready! [Link]"
```

---

## 🛠️ Local Testing (0 Dependencies)

Run locally right now:

```bash
cd ahl-order-portal
node server.js
```

Open `http://localhost:3000` or `http://localhost:3000/?id=AHL-9913` in your browser.

---

## ☁️ 1-Minute Deployment to Vercel

### Method 1: Using Vercel CLI
```bash
npm install -g vercel
cd ahl-order-portal
vercel
```

### Method 2: Git Repository / Vercel Dashboard
1. Push `ahl-order-portal/` to your GitHub/GitLab repo.
2. In [Vercel Dashboard](https://vercel.com/new), import the repository.
3. Set the **Root Directory** to `ahl-order-portal`.
4. Add the following **Environment Variables** in Vercel:

| Environment Variable | Description / Value |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `ahl-sheets-bot@ahl-sheets-automation.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | *(Private key from ahl-sheets-automation.json)* |
| `GOOGLE_SHEET_DOCUMENT_ID` | `1Z-sAT1BUDkfbVCx7GqsYPy31IXYlkhSCHwkeYZqJDIA` |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | `1fkoqNh-26LdbaOxTD7kC3glmd3AtgdIc` |
| `WAHA_BASE_URL` | `https://waha.hairscalptradingco.com` |
| `WAHA_SESSION_NAME` | `ahlaiteam` |
| `STAFF_PIN` | `2026` |

5. Click **Deploy**! Vercel will give you a live domain like `https://ahl-orders.vercel.app`.

---

## 🔗 Connecting to Live WhatsApp Bot

In `live_workflow.json` on n8n, inside node `Build Package PDF Delivery Message`, append the portal link:

```javascript
const portalLinks = links.map(item => 
  '✏️ *Review / Edit Order ' + item.orderNumber + ':*\n'
  + 'https://ahl-orders.vercel.app/?id=' + encodeURIComponent(item.orderNumber)
).join('\n\n');

const deliveryText = '*Your American Hairline order PDFs are ready*\n\n'
  + links.map(item => 'Unit ' + item.unit + ' - ' + item.type + '\nProduct ID: ' + item.productId + '\n' + item.link).join('\n\n')
  + '\n\n' + portalLinks;
```

