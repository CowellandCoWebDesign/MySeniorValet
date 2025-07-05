import { Link } from "wouter";
import { Home, Facebook, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Home className="text-white h-6 w-6" />
              </div>
              <div>
                <span className="text-2xl font-display font-bold">TrueView</span>
                <p className="text-sm text-blue-400 font-medium">Clarity in Senior Living</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The trusted platform for authentic senior living community information. Helping families make informed decisions with verified data and transparent pricing.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">For Families</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/search" className="hover:text-blue-400 transition-colors font-medium">Search Communities</Link></li>
              <li><Link href="/explore" className="hover:text-blue-400 transition-colors font-medium">Explore All Communities</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors font-medium">How it Works</Link></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors font-medium">Care Type Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">For Communities</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/claim" className="hover:text-blue-400 transition-colors font-medium">Claim Your Profile</Link></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors font-medium">Community Portal</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors font-medium">Transparency Benefits</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors font-medium">Support Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Legal & Compliance</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/privacy" className="hover:text-blue-400 transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-400 transition-colors font-medium">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-blue-400 transition-colors font-medium">Disclaimer</Link></li>
              <li><Link href="/accessibility" className="hover:text-blue-400 transition-colors font-medium">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm font-medium">
                © 2025 TrueView. All rights reserved.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Data sourced from authentic, verified state licensing agencies and Google Places.
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Terms</Link>
              <Link href="/disclaimer" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Disclaimer</Link>
              <Link href="/accessibility" className="text-gray-400 hover:text-blue-400 text-sm transition-colors font-medium">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
