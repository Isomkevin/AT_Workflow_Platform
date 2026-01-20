'use client'

import { useState, useEffect } from 'react'

// Header Component
function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold" style={{ color: '#126DBF' }}>AT Workflow</span>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <a href="#features" className="text-gray-700 px-3 py-2 text-sm font-medium transition-colors hover:text-[#126DBF]">
                Features
              </a>
              <a href="#use-cases" className="text-gray-700 px-3 py-2 text-sm font-medium transition-colors hover:text-[#126DBF]">
                Use Cases
              </a>
              <a href="#pricing" className="text-gray-700 px-3 py-2 text-sm font-medium transition-colors hover:text-[#126DBF]">
                Pricing
              </a>
              <a href="#how-it-works" className="text-gray-700 px-3 py-2 text-sm font-medium transition-colors hover:text-[#126DBF]">
                How It Works
              </a>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            <a href="#demo" className="text-gray-700 px-4 py-2 text-sm font-medium transition-colors hover:text-[#126DBF]">
              See Demo
            </a>
            <a href="#get-started" className="text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#0B3B6A]" style={{ backgroundColor: '#126DBF' }}>
              Get Started
            </a>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 p-2 hover:text-[#126DBF] transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-[#126DBF] transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#use-cases" className="block px-3 py-2 text-gray-700 hover:text-[#126DBF] transition-colors" onClick={() => setMobileMenuOpen(false)}>Use Cases</a>
            <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-[#126DBF] transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:text-[#126DBF] transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <div className="mt-4 space-y-2">
              <a href="#demo" className="block px-3 py-2 text-gray-700 hover:text-[#126DBF] transition-colors" onClick={() => setMobileMenuOpen(false)}>See Demo</a>
              <a href="#get-started" className="block mx-3 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors hover:bg-[#0B3B6A]" style={{ backgroundColor: '#126DBF' }} onClick={() => setMobileMenuOpen(false)}>Get Started</a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

// Hero Section
function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance">
              Build Africa's Talking Workflows
              <span className="text-primary-600 block mt-2">Without Writing Code</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 text-balance">
              The visual workflow builder that connects SMS, USSD, Voice, and Payments. 
              Deploy production-grade automations in minutes, not weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#get-started"
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors text-center shadow-lg hover:shadow-xl hover:bg-[#0B3B6A]"
                style={{ backgroundColor: '#126DBF' }}
              >
                Start Building Free
              </a>
              <a
                href="#demo"
                className="bg-white border-2 px-8 py-4 rounded-lg text-lg font-semibold transition-colors text-center hover:bg-blue-50"
                style={{ color: '#126DBF', borderColor: '#126DBF' }}
              >
                See Demo
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              ✓ No credit card required • ✓ Free tier available • ✓ Deploy in minutes
            </p>
          </div>
          <div className="relative">
            <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
              {/* Workflow Builder Mockup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-semibold text-gray-900">Workflow Builder</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                {/* Visual workflow representation */}
                <div className="relative h-64 bg-gray-50 rounded-lg overflow-hidden">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    {/* USSD Trigger */}
                    <rect x="50" y="50" width="100" height="60" rx="8" fill="#126DBF" className="drop-shadow-sm"/>
                    <text x="100" y="85" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">USSD</text>
                    <text x="100" y="100" textAnchor="middle" fill="white" fontSize="10">Trigger</text>
                    
                    {/* Arrow */}
                    <path d="M 150 80 L 200 80" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    
                    {/* SMS Node */}
                    <rect x="200" y="50" width="100" height="60" rx="8" fill="#0B3B6A" className="drop-shadow-sm"/>
                    <text x="250" y="85" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">SMS</text>
                    <text x="250" y="100" textAnchor="middle" fill="white" fontSize="10">Send</text>
                    
                    {/* Arrow */}
                    <path d="M 300 80 L 350 80" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    
                    {/* Payment Node */}
                    <rect x="350" y="50" width="100" height="60" rx="8" fill="#126DBF" className="drop-shadow-sm" opacity="0.8"/>
                    <text x="400" y="85" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Payment</text>
                    <text x="400" y="100" textAnchor="middle" fill="white" fontSize="10">Process</text>
                    
                    {/* Branch arrow */}
                    <path d="M 250 110 L 250 150" stroke="#94a3b8" strokeWidth="2"/>
                    <path d="M 250 150 L 150 150" stroke="#94a3b8" strokeWidth="2"/>
                    <path d="M 150 150 L 150 200" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    
                    {/* Voice Node */}
                    <rect x="100" y="200" width="100" height="60" rx="8" fill="#0B3B6A" className="drop-shadow-sm" opacity="0.9"/>
                    <text x="150" y="235" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Voice</text>
                    <text x="150" y="250" textAnchor="middle" fill="white" fontSize="10">Callback</text>
                    
                    {/* Arrow marker definition */}
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                      </marker>
                    </defs>
                  </svg>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#126DBF' }}></div>
                    <span>USSD Session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0B3B6A' }}></div>
                    <span>SMS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#126DBF' }}></div>
                    <span>Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0B3B6A' }}></div>
                    <span>Voice</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -z-10 -top-4 -right-4 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: '#126DBF' }}></div>
            <div className="absolute -z-10 -bottom-4 -left-4 w-64 h-64 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: '#0B3B6A' }}></div>
          </div>
        </div>
      </div>
    </section>
  )
}

// What It Is Section
function WhatItIs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          The Zapier for Africa's Talking
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Connect SMS, USSD, Voice, and Payments in visual workflows. 
          Built for Africa, powered by Africa's Talking APIs.
        </p>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all" onMouseEnter={(e) => e.currentTarget.style.borderColor = '#126DBF'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: '#e6f2fb' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#126DBF' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">USSD-First</h3>
            <p className="text-gray-600 text-sm">Session-aware workflows that remember context across USSD interactions</p>
          </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all" onMouseEnter={(e) => e.currentTarget.style.borderColor = '#126DBF'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: '#e6f2fb' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#126DBF' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Production-Grade</h3>
            <p className="text-gray-600 text-sm">Enterprise-ready with audit logs, retries, and SLA guarantees</p>
          </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all" onMouseEnter={(e) => e.currentTarget.style.borderColor = '#126DBF'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: '#e6f2fb' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#126DBF' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Backend Needed</h3>
            <p className="text-gray-600 text-sm">Deploy workflows directly from the visual builder. No servers, no DevOps</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section
function Features() {
  const features = [
    {
      title: 'Visual Workflow Builder',
      description: 'Drag-and-drop interface to connect SMS, USSD, Voice, and Payment nodes. See your automation flow before deploying.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
        </svg>
      ),
    },
    {
      title: 'USSD Session Management',
      description: 'Maintain context across USSD menu interactions. Remember user choices, store session data, and build multi-step flows.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: 'SMS + Voice + Payments',
      description: 'Send SMS notifications, trigger voice callbacks, process M-Pesa payments, and handle airtime top-ups—all in one workflow.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      title: 'Logs & Replay',
      description: 'View execution logs in real-time. Replay failed workflows, debug issues, and monitor performance metrics.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Templates & Marketplace',
      description: 'Start with pre-built templates for school fees, customer support, surveys, and more. Share workflows with your team.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: 'Conditional Logic',
      description: 'Add if/then branches, loops, and data transformations. Build complex business logic without code.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Automate
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for Africa's unique communication and payment landscape
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all" onMouseEnter={(e) => e.currentTarget.style.borderColor = '#126DBF'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#e6f2fb' }}>
                <div style={{ color: '#126DBF' }}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Use Cases Section
function UseCases() {
  const useCases = [
    {
      title: 'School Fees Payments',
      description: 'Automate fee collection via USSD. Send SMS reminders, process M-Pesa payments, and send confirmation receipts.',
      example: 'Parents dial *123# → Select "Pay Fees" → Enter amount → Receive M-Pesa prompt → Get SMS confirmation',
      icon: '🎓',
    },
    {
      title: 'Customer Support Automation',
      description: 'Handle support tickets via USSD menus. Route to agents, send SMS updates, and track resolution status.',
      example: 'Customer dials *456# → Select issue type → Get ticket number → Receive SMS with agent contact → Track via SMS',
      icon: '💬',
    },
    {
      title: 'NGO Surveys & Data Collection',
      description: 'Collect field data via USSD forms. Store responses, send reminders, and export to analytics dashboards.',
      example: 'Field worker dials *789# → Answer survey questions → Data saved automatically → Supervisor gets SMS summary',
      icon: '📊',
    },
    {
      title: 'Fintech Onboarding',
      description: 'Onboard new users with USSD verification. Send OTP via SMS, verify identity, and activate accounts.',
      example: 'User dials *321# → Enter phone number → Receive OTP → Verify → Account activated → Welcome SMS sent',
      icon: '💳',
    },
    {
      title: 'Health Appointment Reminders',
      description: 'Send automated SMS reminders for appointments. Allow rescheduling via USSD and confirm via voice call.',
      example: 'Patient receives SMS 24h before → Dial *555# to confirm/reschedule → Get voice call reminder 2h before',
      icon: '🏥',
    },
    {
      title: 'Airtime & Data Top-Up',
      description: 'Enable self-service top-ups via USSD. Process payments, send confirmations, and track usage.',
      example: 'User dials *999# → Select "Buy Airtime" → Enter amount → Pay via M-Pesa → Receive confirmation SMS',
      icon: '📱',
    },
  ]

  return (
    <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built for Africa's Real Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how businesses across Africa are automating workflows
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all" onMouseEnter={(e) => e.currentTarget.style.borderColor = '#126DBF'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
              <div className="text-4xl mb-4">{useCase.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
              <p className="text-gray-600 mb-4">{useCase.description}</p>
              <div className="border-l-4 p-3 rounded" style={{ backgroundColor: '#e6f2fb', borderLeftColor: '#126DBF' }}>
                <p className="text-sm text-gray-700 italic">{useCase.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Build',
      description: 'Drag and drop nodes to create your workflow. Connect USSD triggers to SMS, Voice, and Payment actions.',
      detail: 'Visual builder with real-time preview. No coding required.',
    },
    {
      number: '2',
      title: 'Deploy',
      description: 'Click deploy and your workflow goes live instantly. Get a USSD shortcode or webhook URL.',
      detail: 'One-click deployment. Automatic API configuration.',
    },
    {
      number: '3',
      title: 'Monitor',
      description: 'Track executions in real-time. View logs, replay failures, and optimize performance.',
      detail: 'Full audit trail. Analytics and alerting included.',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            From Idea to Production in Minutes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to automate your Africa's Talking workflows
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 z-0" style={{ width: 'calc(100% - 4rem)', backgroundColor: '#cce5f7' }}>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-t-4 border-t-transparent border-b-4 border-b-transparent" style={{ borderLeftColor: '#cce5f7' }}></div>
                </div>
              )}
              <div className="relative bg-white p-8 rounded-xl border-2 transition-all shadow-lg" style={{ borderColor: '#cce5f7' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#126DBF'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cce5f7'}>
                <div className="w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto" style={{ backgroundColor: '#126DBF' }}>
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{step.title}</h3>
                <p className="text-gray-600 mb-3 text-center">{step.description}</p>
                <p className="text-sm text-gray-500 text-center italic">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Trust & Security Section
function TrustSecurity() {
  const features = [
    {
      title: 'Audit Logs',
      description: 'Every workflow execution is logged with timestamps, inputs, outputs, and user context.',
      icon: '📋',
    },
    {
      title: 'Role-Based Access',
      description: 'Control who can view, edit, or deploy workflows. Integrate with your existing auth system.',
      icon: '🔐',
    },
    {
      title: 'Reliable Retries',
      description: 'Automatic retry logic with exponential backoff. Never lose a transaction due to network issues.',
      icon: '🔄',
    },
    {
      title: 'Enterprise-Grade',
      description: '99.9% uptime SLA, data encryption at rest and in transit, and compliance with regional regulations.',
      icon: '🛡️',
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trust & Security Built In
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enterprise-ready security and reliability for mission-critical workflows
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-xl p-8 border" style={{ backgroundColor: '#e6f2fb', borderColor: '#cce5f7' }}>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#126DBF' }}>99.9%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#126DBF' }}>256-bit</div>
              <div className="text-gray-600">Encryption</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#126DBF' }}>24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Pricing Section
function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for testing and small projects',
      features: [
        'Up to 100 workflow executions/month',
        '1 active workflow',
        'Basic SMS & USSD nodes',
        'Community support',
        'Execution logs (7 days)',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$49',
      period: 'per month',
      description: 'For growing businesses and agencies',
      features: [
        '10,000 workflow executions/month',
        'Unlimited active workflows',
        'All node types (SMS, USSD, Voice, Payments)',
        'Priority support',
        'Execution logs (90 days)',
        'Workflow templates',
        'Team collaboration (up to 5 users)',
        'Custom webhooks',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with custom needs',
      features: [
        'Unlimited executions',
        'Dedicated infrastructure',
        'Custom SLA guarantees',
        'Dedicated account manager',
        'Unlimited execution logs',
        'Advanced analytics & reporting',
        'SSO & custom integrations',
        'On-premise deployment option',
        'Custom training & onboarding',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border-2 p-8 ${
                plan.popular
                  ? 'shadow-xl scale-105 relative'
                  : 'border-gray-200'
              } transition-all`}
              style={plan.popular ? { borderColor: '#126DBF' } : {}}
              onMouseEnter={(e) => !plan.popular && (e.currentTarget.style.borderColor = '#126DBF')}
              onMouseLeave={(e) => !plan.popular && (e.currentTarget.style.borderColor = '#e5e7eb')}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-white px-4 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#126DBF' }}>
                  Most Popular
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600 ml-2">{plan.period}</span>}
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#get-started"
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
                style={plan.popular ? { backgroundColor: '#126DBF' } : {}}
                onMouseEnter={(e) => plan.popular && (e.currentTarget.style.backgroundColor = '#0B3B6A')}
                onMouseLeave={(e) => plan.popular && (e.currentTarget.style.backgroundColor = '#126DBF')}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center text-gray-600">
          <p>All plans include Africa's Talking API integration. Pay only for what you use beyond included limits.</p>
        </div>
      </div>
    </section>
  )
}

// Final CTA Section
function FinalCTA() {
  return (
    <section id="get-started" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to right, #126DBF, #0B3B6A)' }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Automate Your Workflows?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join businesses across Africa who are building better customer experiences with AT Workflow
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#get-started"
            className="bg-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            style={{ color: '#126DBF' }}
          >
            Start Building Free
          </a>
          <a
            href="#demo"
            className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Schedule a Demo
          </a>
        </div>
        <p className="mt-8 text-white/80 text-sm">
          No credit card required • Setup in 5 minutes • Free tier includes 100 executions/month
        </p>
      </div>
    </section>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">AT Workflow</h3>
            <p className="text-gray-400 text-sm">
              The visual workflow builder for Africa's Talking. Build, deploy, and monitor automations without code.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} AT Workflow. All rights reserved. Built for Africa, powered by Africa's Talking.</p>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <WhatItIs />
      <Features />
      <UseCases />
      <HowItWorks />
      <TrustSecurity />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  )
}
