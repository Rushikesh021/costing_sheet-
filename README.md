# Greige Costing System

A modern, high-precision full-stack web application for textile weaving mills, fabric sourcing teams, and cost engineers built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Material Design 3 (MD3)** styling.

---

## 🌟 Key Features

- **Textile Engineering Formulation (ASTM D1907 & ISO 2060)**:
  - Exact warp and weft consumption formulas considering yarn count ($N_e$), ply, ends per inch (EPI), picks per inch (PPI), reed space, greige width, and crimp contraction percentages.
  - Automatic calculation of **GLM** (Grams per Linear Meter), **GSM** (Grams per Square Meter), and **oz/yd²**.
  - Peirce fabric cover factor ($K_c$) computation.
- **Material Design 3 (MD3) Design Language**:
  - Expressive MD3 color tokens (`primary`, `surface-container`, `elevation-1..5`, `outline-variant`).
  - Rounded pill buttons, responsive cards, and tactile state layers.
  - Seamless **Dark Mode & Light Mode** support using `next-themes`.
- **Pre-Configured Fabric Quality Presets**:
  - **Classic Poplin** ($40 \times 40 / 133 \times 72$ - 63")
  - **Standard Sheeting** ($30 \times 30 / 68 \times 68$ - 63")
  - **Heavy Chino Twill 2/1** ($20 \times 16 / 108 \times 56$ - 63")
  - **Luxury Bed Satin 4/1** ($60 \times 60 / 173 \times 120$ - 120")
  - **Rigid Denim 3/1** ($10 \times 7 / 72 \times 44$ - 64")
  - **Heavy Duck Canvas** ($10/2 \times 10/2 / 48 \times 32$ - 63")
- **Yarn & Chemical Sizing Cost Breakdown**:
  - Hard waste percentages for warp and weft spinning/winding.
  - Sizing chemical recipe costs and sizing waste factors.
- **Weaving Machinery & Conversion Charges**:
  - Loom selection (Airjet, Rapier, Projectile Sulzer, Waterjet, Shuttleless).
  - Loom RPM, efficiency %, picks per minute, and daily output (meters/24h).
  - Pick rate vs. direct meter conversion charge options.
  - Factory burden: power, operator wages, spares/maintenance, fixed overheads, and 4-point inspection & packaging.
- **Interactive Visual Analytics**:
  - Dynamic SVG Donut Chart showing cost share breakdown.
  - Linear weight distribution bar (Warp % vs Weft %).
  - Real-time **"What-If" Sensitivity Slider** for cotton/yarn market price fluctuations ($\pm 25\%$) with margin erosion protection.
- **Commercial Management & Export**:
  - Multi-Currency conversion (**USD, INR, EUR, GBP, PKR, BDT**).
  - Print-ready and PDF-exportable **Official Mill Quotation Sheet** with ISO certification headers, technical matrices, and signature blocks.
  - Side-by-side **Quality Comparison Matrix** for evaluating up to 3 fabric alternatives.
  - **Textile Yarn Master & Converter**: converts $N_e \leftrightarrow \text{Denier} \leftrightarrow \text{Tex} \leftrightarrow N_m$ and \$/kg to \$/lb.
  - LocalStorage cost sheet management (Save, Load, Duplicate, Delete, JSON Import/Backup).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24.x)
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 🏗 Architecture & Project Structure

```
├── src/
│   ├── app/
│   │   ├── globals.css         # MD3 design system tokens & dark mode variables
│   │   ├── layout.tsx          # Root layout with ThemeProvider and Inter typography
│   │   └── page.tsx            # Main Greige Costing dashboard application
│   ├── components/
│   │   ├── ui/                 # MD3 component primitives
│   │   │   ├── button.tsx      # Filled, Tonal, Outline, Elevated MD3 buttons
│   │   │   ├── card.tsx        # MD3 rounded-3xl cards with elevation
│   │   │   ├── input.tsx       # MD3 outlined inputs with unit badges
│   │   │   ├── select.tsx      # MD3 dropdowns
│   │   │   ├── badge.tsx       # MD3 filter and status chips
│   │   │   ├── dialog.tsx      # MD3 accessible modal containers
│   │   │   └── tabs.tsx        # MD3 segmented tabs
│   │   ├── costing/            # Domain-specific textile components
│   │   │   ├── CostingHeader.tsx       # Nav, presets, currency, modals, dark mode
│   │   │   ├── CostSummaryCards.tsx    # Selling price, GSM/GLM, profit, revenue
│   │   │   ├── CostBreakdownChart.tsx  # Interactive SVG donut and weight progress
│   │   │   ├── FabricSpecsForm.tsx     # Warp, weft, density, crimp, weave parameters
│   │   │   ├── YarnRatesForm.tsx       # Yarn prices, wastage %, sizing chemistry
│   │   │   ├── WeavingChargesForm.tsx  # Loom mechanics, conversion, factory overheads
│   │   │   ├── CommercialsForm.tsx     # Order margins, delivery lead time, feasibility
│   │   │   ├── SensitivityAnalysis.tsx # What-If cotton volatility simulator
│   │   │   ├── PrintQuoteModal.tsx     # Print/PDF mill quotation export
│   │   │   ├── CompareModal.tsx        # Side-by-side quality comparison matrix
│   │   │   ├── YarnMasterModal.tsx     # Yarn count & price conversion utility
│   │   │   ├── SavedQuotesDrawer.tsx   # Saved sheet history and JSON backups
│   │   │   └── SaveCostingModal.tsx    # Naming and tagging saved costings
│   │   └── theme-provider.tsx  # NextThemes dark/light context
│   └── lib/
│       ├── types.ts            # Complete TypeScript domain models
│       ├── costing-calculator.ts # ASTM/ISO textile calculation engine
│       ├── presets.ts          # Industry standard fabric constructions
│       └── utils.ts            # Tailwind CSS merging utilities
├── tailwind.config.ts          # MD3 color palette, elevation shadows, radius tokens
├── tsconfig.json               # Path aliases (@/*) and TypeScript configuration
└── package.json
```

---

## 🧮 Textile Formulas Reference

$$\text{Total Ends} = (\text{EPI} \times \text{Greige Width}) + \text{Selvedge Ends}$$

$$\text{Effective Count} = \frac{\text{Count } (N_e)}{\text{Ply}}$$

$$\text{Warp Weight } (\text{g/m}) = \frac{\text{Total Ends} \times (1 + \text{Warp Crimp} \%) \times 0.590541}{\text{Effective Warp Count}}$$

$$\text{Weft Weight } (\text{g/m}) = \frac{\text{PPI} \times \text{Reed Space (in)} \times (1 + \text{Weft Crimp} \%) \times 0.590541}{\text{Effective Weft Count}}$$

$$\text{GLM } (\text{g/m}) = \text{Warp Weight} + \text{Weft Weight}$$

$$\text{GSM } (\text{g/m}^2) = \frac{\text{GLM}}{\text{Greige Width in Meters}}$$

$$\text{Ounces per Sq Yard } (\text{oz/yd}^2) = \text{GSM} \times 0.0294935$$
