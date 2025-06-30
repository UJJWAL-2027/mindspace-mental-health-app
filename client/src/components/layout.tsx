import { ReactNode } from "react";
import { Navigation } from "./navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <i className="fas fa-brain text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-800">MindSpace</h1>
                <p className="text-xs text-neutral-500">Your Mental Wellness Companion</p>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-neutral-500 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-100">
                <i className="fas fa-bell text-lg"></i>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
              </button>
              
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-neutral-700">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <Navigation />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
