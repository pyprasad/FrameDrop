'use client';

import { useState } from 'react';
import { Upload, Lock, Users, Zap, Shield, Globe } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FrameDrop</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#enterprise" className="text-gray-600 hover:text-gray-900">Enterprise</a>
            <a href="/login" className="text-gray-600 hover:text-gray-900">Sign in</a>
            <Button>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Send Large Files
            <span className="text-indigo-600"> Securely</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Enterprise-grade file transfer platform with SSO support.
            Share up to 10GB per transfer with ease.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-3xl mx-auto">
          <FileUploader />
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">10GB</div>
            <div className="text-gray-600">Max Transfer Size</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">256-bit</div>
            <div className="text-gray-600">Encryption</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime SLA</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-xl text-gray-600">
              Built for teams, loved by everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Secure & Private"
              description="End-to-end encryption with password protection and expiring links"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Enterprise SSO"
              description="SAML 2.0 and OAuth 2.0 support for seamless team authentication"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Lightning Fast"
              description="Resumable uploads with intelligent chunking for maximum speed"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Compliance Ready"
              description="Audit logs, data retention policies, and GDPR compliance"
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Self-Hosted"
              description="Deploy on your infrastructure with full control over your data"
            />
            <FeatureCard
              icon={<Upload className="w-6 h-6" />}
              title="Easy Sharing"
              description="Share via email or link with download tracking and analytics"
            />
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Built for Enterprise</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Trusted by organizations worldwide for secure file transfers
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg">
              Contact Sales
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-indigo-600">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FrameDrop</span>
              </div>
              <p className="text-gray-600 text-sm">
                Enterprise file transfer platform
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            © 2024 FrameDrop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg border bg-white hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
