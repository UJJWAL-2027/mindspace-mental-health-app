import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-chart-line" },
    { path: "/journal", label: "Journal", icon: "fas fa-book-open" },
    { path: "/chat", label: "AI Companion", icon: "fas fa-comments" },
    { path: "/mood", label: "Mood Tracker", icon: "fas fa-heart" },
    { path: "/search", label: "Search Entries", icon: "fas fa-search" },
    { path: "/profile", label: "Profile", icon: "fas fa-user" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-screen border-r border-neutral-200">
        <nav className="p-6 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 font-medium cursor-pointer",
                  location === item.path
                    ? "bg-primary text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-primary"
                )}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="p-6 border-t border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <Link href="/journal">
            <div className="w-full flex items-center justify-center space-x-2 bg-secondary text-white p-3 rounded-xl hover:bg-green-600 transition-colors duration-200 cursor-pointer">
              <i className="fas fa-plus"></i>
              <span className="font-medium">New Journal Entry</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="lg:hidden mb-6">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm mx-6">
          {navItems.slice(0, 3).map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  location === item.path
                    ? "bg-primary text-white"
                    : "text-neutral-600"
                )}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
