import { Link } from "wouter";
import { Home, Facebook, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="text-white text-sm" />
              </div>
              <span className="text-xl font-display font-semibold">TrueView</span>
            </div>
            <p className="text-gray-400 mb-4">
              Providing transparent, real-time data to help families make informed decisions about senior living.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Families</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/search" className="hover:text-white transition-colors">Search Communities</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Care Type Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Planning Resources</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Communities</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/claim" className="hover:text-white transition-colors">Claim Your Profile</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Login</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Transparency Benefits</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Data Sources</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 TrueView. All rights reserved. Data sourced from public state licensing agencies.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
