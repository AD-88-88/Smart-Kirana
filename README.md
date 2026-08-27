# SmartKirana — Phase 1

Functional Phase 1 build of the platform specified in the PRD: **Digital Inventory & Pricing Dashboard**, **Quick Rate Lookup**, and **POS Billing**, with a lightweight Customer/Udhar layer since POS billing needs it to tag credit sales. Full Khata reporting and the customer-facing storefront are Phase 2/3, per the roadmap.

```
smartkirana/
├── backend/     Node.js + Express API (Firebase Admin SDK)
├── frontend/    React + Tailwind PWA (Firebase client SDK)
├── firestore.rules
└── firestore.indexes.json
```

## How reads and writes are split

- **Reads** (product catalog, rate lookup) happen straight from the browser via the Firestore client SDK using live listeners (`onSnapshot`). This is what makes the rate lookup instant and keeps every phone/tablet/PC in the shop in sync in real time.
- **Writes that touch money or stock** (generating a bill, adding a product, recording a payment) go through the Express backend, which uses the Firebase **Admin** SDK inside a Firestore **transaction**. This is what stops two staff members from ever double-selling the last unit of an item, and it's why Firestore security rules block direct client writes entirely (see `firestore.rules`).

## 1. Firebase project setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Firestore Database** (production mode) and **Authentication → Email/Password** sign-in.
3. Under **Project Settings → General → Your apps**, add a Web app and copy the config values into `frontend/.env` (copy from `frontend/.env.example`).
4. Under **Project Settings → Service Accounts**, click **Generate new private key**. Save the downloaded file as `backend/config/serviceAccountKey.json`.
5. Deploy the security rules and indexes (requires the [Firebase CLI](https://firebase.google.com/docs/cli)):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes --project your-project-id
   ```

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env        # adjust if needed
node scripts/createStaff.js owner 998877 owner    # create the owner login
node scripts/createStaff.js ramesh 4821 staff     # create a staff login
node scripts/seedDemoData.js                      # optional: adds 8 sample products
npm run dev                                        # starts on http://localhost:5000
```

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env         # fill in Firebase web config + VITE_API_BASE_URL
npm run dev                  # starts on http://localhost:5173
```

Open `http://localhost:5173`, log in with Staff ID `owner` / PIN `998877` (or the staff account you created), and you're in.

## 4. What's implemented in Phase 1

**Dashboard** — today's sales total, quick rate lookup search bar, low-stock and pending-udhar widgets, quick-action tiles, floating "New Bill" button.

**Inventory** — searchable/filterable product list with color-coded stock badges (🟢🟠🔴), add/edit form with all PRD fields, purchase price hidden from non-owner staff, delete (owner-only).

**POS Billing** — search or quick-tile item entry, live cart with +/- steppers, GST toggle (5% default), flat discount, Cash/UPI/Udhar payment modes, inline customer search/quick-add for Udhar, atomic bill generation, Print and WhatsApp share on the success screen.

**Customers (lightweight)** — list with outstanding balance, profile page with payment recording and recent purchase history. Full reporting/reminders ship in Phase 2 per the roadmap.

## 5. Deploying

- **Frontend**: `npm run build` in `frontend/`, then deploy the `dist/` folder to Firebase Hosting or Vercel.
- **Backend**: deploy `backend/` to Render, Railway, or a small VM. Set the same environment variables from `.env.example` (paste the service account JSON as a Render "Secret File" rather than committing it).
- Update `VITE_API_BASE_URL` in the frontend's production env to point at the deployed backend URL.

## 6. Next steps toward Phase 2/3

- Bulk CSV import for initial inventory setup
- Full Udhar aging report + WhatsApp payment reminders
- Sales/stock-valuation reports for the owner
- Public customer-facing catalog + Click & Collect (same Firestore data, new read-only routes)
