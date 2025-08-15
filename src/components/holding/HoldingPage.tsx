'use client';

import Link from 'next/link';
import { ArrowRight, Mail, Calendar, Users, Zap, Shield, Clock } from 'lucide-react';
import { useState } from 'react';

export default function HoldingPage() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual email subscription
    setIsSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary-600">Auto-Shopify Platform</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="mailto:hello@auto-shopify.com"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </a>
              <button
                onClick={() =>
                  document.getElementById('notify')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Notified
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Calendar className="h-4 w-4 mr-2" />
                  Launching Early 2025
                </div>

                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">The Future of</span>{' '}
                  <span className="block text-primary-600 xl:inline">Shopify Automation</span>
                </h1>

                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  We're building the most advanced platform for automated Shopify store creation.
                  From idea to launch in under 20 minutes - completely automated, professionally
                  designed, ready for business.
                </p>

                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button
                      onClick={() =>
                        document.getElementById('notify')?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Join the Waitlist
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="mailto:hello@auto-shopify.com"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-primary-400 to-primary-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-white text-center">
              <Zap className="h-24 w-24 mx-auto mb-4 opacity-80" />
              <p className="text-xl font-semibold">Automated Excellence</p>
              <p className="text-primary-100 mt-2">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              What We're Building
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Revolutionary Shopify Automation
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative text-center">
                <dt>
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                    <Clock className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-lg leading-6 font-medium text-gray-900">
                    20-Minute Store Creation
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Complete Shopify store setup with AI-powered product creation, theme
                  customization, and payment integration.
                </dd>
              </div>

              <div className="relative text-center">
                <dt>
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                    <Shield className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-lg leading-6 font-medium text-gray-900">
                    Enterprise Security
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Bank-grade security with automated compliance, secure API integrations, and
                  professional hosting.
                </dd>
              </div>

              <div className="relative text-center">
                <dt>
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                    <Users className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-lg leading-6 font-medium text-gray-900">
                    Built for Entrepreneurs
                  </p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Designed specifically for first-time store builders and aspiring entrepreneurs who
                  want professional results.
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Signup Section */}
      <div id="notify" className="bg-primary-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Be the first to know when we launch
            </h2>
            <p className="mt-3 text-xl text-primary-200 sm:mt-4">
              Join our exclusive waitlist and get early access to the most advanced Shopify
              automation platform
            </p>

            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="mt-8 sm:flex sm:max-w-lg sm:mx-auto">
                <div className="min-w-0 flex-1">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white"
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="block w-full px-4 py-3 rounded-md shadow bg-white text-primary-600 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white transition-colors"
                  >
                    <Mail className="h-5 w-5 inline mr-2" />
                    Notify Me
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-8 p-4 bg-primary-700 rounded-md">
                <p className="text-white font-medium">
                  ✅ Thank you! We'll notify you when we launch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Launch Timeline
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Our Road to Launch
            </p>
          </div>

          <div className="mt-10 max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-300"></div>

              <div className="space-y-8">
                <div className="relative flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center bg-primary-600 rounded-full">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Q4 2024</h3>
                    <p className="text-gray-500">
                      Core platform development and testing infrastructure
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center bg-primary-400 rounded-full">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Q1 2025</h3>
                    <p className="text-gray-500">Beta testing with select entrepreneurs</p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center bg-gray-300 rounded-full">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Q2 2025</h3>
                    <p className="text-gray-500">Public launch and general availability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">
              © 2024 Auto-Shopify Platform. Built for entrepreneurs, by entrepreneurs.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="mailto:hello@auto-shopify.com" className="text-gray-400 hover:text-gray-500">
                Contact Us
              </a>
              <a
                href="mailto:privacy@auto-shopify.com"
                className="text-gray-400 hover:text-gray-500"
              >
                Privacy
              </a>
              <a
                href="mailto:support@auto-shopify.com"
                className="text-gray-400 hover:text-gray-500"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
