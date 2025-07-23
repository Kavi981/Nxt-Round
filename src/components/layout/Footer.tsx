import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Section - Platform Overview */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/nxt_round.png" alt="Nxt Round Logo" style={{ height: 32 }} />
              <span className="text-xl font-bold text-white">Nxt Round</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nxt Round is a collaborative platform designed to help freshers and job seekers 
              prepare for company-specific interviews. Share experiences, learn from others, 
              and ace your next interview.
            </p>
            <div className="flex space-x-4 mt-6">
              <a 
                href="https://github.com/Kavi981" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/kaviyarasu-s-a90587324" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="mailto:kavithamil2005@gmail.com" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Center Section - Copyright */}
          <div className="col-span-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                © 2025 Nxt Round. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Empowering job seekers with collaborative interview preparation
              </p>
            </div>
          </div>

          {/* Right Section - Useful Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-gray-400 hover:text-white transition-colors">
                  Companies
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-gray-400 hover:text-white transition-colors">
                  Questions
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;