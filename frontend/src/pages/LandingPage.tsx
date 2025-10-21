import React, { useState, useEffect } from 'react';
import { BarChart3, Globe, Shield, Zap, Check, ArrowRight, Menu, X, Eye, Users, TrendingUp, Clock } from 'lucide-react';

interface LandingPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
}

const LandingPage = ({ onNavigateToSignIn, onNavigateToSignUp }: LandingPageProps) => {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Privacy-First Analytics',
      description: 'No cookies, no tracking pixels, 100% GDPR compliant. Respect your visitors\' privacy while gaining insights.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Under 3KB tracking script with minimal impact on page load. Your site stays fast, always.'
    },
    {
      icon: Globe,
      title: 'Real-Time Data',
      description: 'Monitor your website traffic in real-time with live visitor tracking and instant insights.'
    },
    {
      icon: BarChart3,
      title: 'Beautiful Dashboard',
      description: 'Clean, intuitive interface with powerful analytics. See what matters most at a glance.'
    }
  ];

  const stats = [
    { icon: Eye, value: '10M+', label: 'Pageviews Tracked' },
    { icon: Users, value: '50K+', label: 'Active Users' },
    { icon: TrendingUp, value: '99.9%', label: 'Uptime' },
    { icon: Clock, value: '<3KB', label: 'Script Size' }
  ];

  const pricing = [
    {
      name: 'Starter',
      price: '0',
      description: 'Perfect for personal projects',
      features: [
        '1 website',
        '10K pageviews/month',
        'Real-time analytics',
        'Email support',
        '90 days data retention'
      ]
    },
    {
      name: 'Professional',
      price: '19',
      description: 'For growing businesses',
      features: [
        '10 websites',
        '100K pageviews/month',
        'Real-time analytics',
        'Priority support',
        'Unlimited data retention',
        'Custom events',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '99',
      description: 'For large organizations',
      features: [
        'Unlimited websites',
        'Unlimited pageviews',
        'Real-time analytics',
        'Dedicated support',
        'Unlimited data retention',
        'Custom events',
        'API access',
        'White-label option',
        'SLA guarantee'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">Trackless</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-lg text-gray-700 hover:text-gray-900 font-medium transition-colors">Features</a>
            <a href="#pricing" className="text-lg text-gray-700 hover:text-gray-900 font-medium transition-colors">Pricing</a>
            <a href="#docs" className="text-lg text-gray-700 hover:text-gray-900 font-medium transition-colors">Docs</a>
            <button 
              onClick={onNavigateToSignIn}
              className="text-lg text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onNavigateToSignUp}
              className="px-8 py-3 bg-[#FDC726] text-gray-900 rounded-lg font-semibold text-lg hover:bg-[#e5b520] transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-3"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-6 px-4">
            <div className="flex flex-col gap-5 text-lg">
              <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium py-2">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium py-2">Pricing</a>
              <a href="#docs" className="text-gray-700 hover:text-gray-900 font-medium py-2">Docs</a>
              <button 
                onClick={() => {
                  onNavigateToSignIn();
                  setMobileMenuOpen(false);
                }}
                className="text-gray-700 hover:text-gray-900 font-medium py-2 text-left"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  onNavigateToSignUp();
                  setMobileMenuOpen(false);
                }}
                className="px-6 py-3 bg-[#FDC726] text-gray-900 rounded-lg font-semibold text-center text-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Full Page */}
      <section className="min-h-screen flex items-center justify-center relative pt-20 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            backgroundImage: 'radial-gradient(circle, #FDC726 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-100 rounded-full mb-8">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-base font-medium text-gray-700">Privacy-first analytics</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Analytics Without
                <span className="text-[#FDC726] block">Compromise</span>
              </h1>
              
              <p className="text-2xl text-gray-600 mb-10 leading-relaxed">
                Powerful, privacy-focused web analytics that respects your visitors. 
                No cookies, no tracking, 100% GDPR compliant.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <button 
                  onClick={onNavigateToSignUp}
                  className="px-10 py-5 bg-[#FDC726] text-gray-900 rounded-xl font-semibold text-lg hover:bg-[#e5b520] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                >
                  Start Free Trial
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onNavigateToSignIn}
                  className="px-10 py-5 bg-white text-gray-900 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-3"
                >
                  View Demo
                </button>
              </div>
            </div>

            {/* 3D Dashboard Preview */}
            <div 
              className="relative"
              style={{ transform: `translateY(${scrollY * -0.1}px)` }}
            >
              <div className="bg-gradient-to-br from-gray-50 to-white p-10 rounded-3xl shadow-2xl border border-gray-200">
                <div className="bg-white rounded-xl p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-lg border border-gray-100">
                      <Eye className="w-8 h-8 text-gray-400 mb-3" />
                      <div className="text-3xl font-bold text-gray-900">24.5K</div>
                      <div className="text-base text-gray-500">Pageviews</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-lg border border-gray-100">
                      <Users className="w-8 h-8 text-gray-400 mb-3" />
                      <div className="text-3xl font-bold text-gray-900">8.2K</div>
                      <div className="text-base text-gray-500">Visitors</div>
                    </div>
                  </div>
                  
                  <div className="h-40 flex items-end gap-3">
                    {[45, 62, 58, 73, 68, 82, 75, 88, 92, 85, 78, 95, 89, 84].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#FDC726] to-[#e5b520] rounded-t" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-md mb-5">
                  <stat.icon className="w-10 h-10 text-[#FDC726]" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-3">{stat.value}</div>
                <div className="text-lg text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for <span className="text-[#FDC726]">Better Analytics</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to give you insights while respecting privacy
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-10 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#FDC726] to-[#e5b520] rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-xl text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Simple, <span className="text-[#FDC726]">Transparent</span> Pricing
            </h2>
            <p className="text-2xl text-gray-600">Choose the plan that's right for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {pricing.map((plan, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl p-10 ${
                  plan.popular 
                    ? 'border-2 border-[#FDC726] shadow-2xl scale-105' 
                    : 'border border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="inline-block px-5 py-2 bg-[#FDC726] text-gray-900 rounded-full text-base font-semibold mb-5">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <p className="text-xl text-gray-600 mb-8">{plan.description}</p>
                
                <div className="mb-8">
                  <span className="text-6xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-xl text-gray-600">/month</span>
                </div>

                <button 
                  onClick={onNavigateToSignUp}
                  className={`block w-full py-4 rounded-xl font-semibold text-lg text-center mb-10 transition-all ${
                    plan.popular
                      ? 'bg-[#FDC726] text-gray-900 hover:bg-[#e5b520] shadow-md'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </button>

                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <Check className="w-6 h-6 text-[#FDC726] flex-shrink-0 mt-0.5" />
                      <span className="text-lg text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #FDC726 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-2xl text-gray-300 mb-10">
            Join thousands of websites using privacy-first analytics
          </p>
          <button 
            onClick={onNavigateToSignUp}
            className="inline-flex items-center gap-3 px-12 py-6 bg-[#FDC726] text-gray-900 rounded-xl font-semibold text-lg hover:bg-[#e5b520] transition-all shadow-lg hover:shadow-xl"
          >
            Start Your Free Trial
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Trackless</span>
              </div>
              <p className="text-lg text-gray-600">Privacy-first analytics for the modern web.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 text-lg mb-6">Product</h4>
              <ul className="space-y-3 text-lg">
                <li><a href="#features" className="text-gray-600 hover:text-gray-900">Features</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
                <li><a href="#docs" className="text-gray-600 hover:text-gray-900">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 text-lg mb-6">Company</h4>
              <ul className="space-y-3 text-lg">
                <li><a href="#about" className="text-gray-600 hover:text-gray-900">About</a></li>
                <li><a href="#blog" className="text-gray-600 hover:text-gray-900">Blog</a></li>
                <li><a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 text-lg mb-6">Legal</h4>
              <ul className="space-y-3 text-lg">
                <li><a href="#privacy" className="text-gray-600 hover:text-gray-900">Privacy</a></li>
                <li><a href="#terms" className="text-gray-600 hover:text-gray-900">Terms</a></li>
                <li><a href="#gdpr" className="text-gray-600 hover:text-gray-900">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-10 text-center text-lg text-gray-600">
            <p>© 2025 Trackless Analytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;