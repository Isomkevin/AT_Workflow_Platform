# AT Workflow Landing Page

A production-ready marketing landing page for Africa's Talking Workflow Automation Platform.

## Features

- ✅ Complete landing page with all required sections
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ SEO optimized with meta tags and structured data
- ✅ Accessible components with ARIA labels
- ✅ Modern UI with Tailwind CSS
- ✅ Smooth scroll navigation
- ✅ Mobile-friendly hamburger menu

## Sections Included

1. **Hero** - Headline, subheadline, primary/secondary CTAs, workflow builder mockup
2. **What It Is** - One-liner and key differentiators
3. **Features** - Visual workflow builder, USSD session management, SMS/Voice/Payments, logs, templates, conditional logic
4. **Use Cases** - Africa-first examples (school fees, customer support, NGO surveys, fintech onboarding, health reminders, airtime top-up)
5. **How It Works** - 3-step flow (Build → Deploy → Monitor)
6. **Trust & Security** - Audit logs, role-based access, retries, enterprise-grade
7. **Pricing** - Free, Pro, and Enterprise tiers with clear feature differentiation
8. **Final CTA** - Get started section
9. **Footer** - Links to docs, support, terms, privacy

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
cd landing
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Design Decisions

- **Color Palette**: Primary blue (#0ea5e9) with accent yellow/gold tones, representing trust and African vibrancy
- **Typography**: Clean, modern sans-serif with clear hierarchy
- **Icons**: SVG icons for scalability and performance
- **Layout**: Component-based architecture for maintainability
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation support

## Customization

### Brand Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
colors: {
  primary: { /* your primary colors */ },
  accent: { /* your accent colors */ },
}
```

### Content

All content is in `app/page.tsx`. Update the text, features, use cases, and pricing as needed.

### SEO

Update metadata in `app/layout.tsx`:

- Title
- Description
- Open Graph tags
- Structured data (JSON-LD)

## Notes

- All content is Africa-first and telco-native
- No placeholder content - all copy is production-ready
- Uses inline SVG for workflow mockup (no external images)
- Fully responsive and accessible
- Ready for deployment to Vercel, Netlify, or any Next.js hosting

## License

Proprietary - Africa's Talking Workflow Platform
