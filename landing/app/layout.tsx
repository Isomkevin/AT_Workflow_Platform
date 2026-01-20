import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AT Workflow - The Zapier for Africa\'s Talking',
  description: 'Build SMS, USSD, Voice, and Payment workflows visually. No backend required. Africa-first workflow automation platform.',
  keywords: 'Africa\'s Talking, workflow automation, SMS, USSD, Voice, Payments, Africa, automation platform',
  authors: [{ name: 'AT Workflow' }],
  openGraph: {
    title: 'AT Workflow - The Zapier for Africa\'s Talking',
    description: 'Build SMS, USSD, Voice, and Payment workflows visually. No backend required.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AT Workflow - The Zapier for Africa\'s Talking',
    description: 'Build SMS, USSD, Voice, and Payment workflows visually. No backend required.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AT Workflow",
              "applicationCategory": "BusinessApplication",
              "description": "Visual workflow builder and automation engine for Africa's Talking APIs (SMS, USSD, Voice, Payments)",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              }
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
