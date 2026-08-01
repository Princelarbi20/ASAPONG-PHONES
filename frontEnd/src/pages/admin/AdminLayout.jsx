
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import SignOut from '../auth/Sign-Out';
import Logo from '../../component/Logo';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ClipboardList,
  Menu,
  X,
  DollarSign,
  Clock,
  AlertTriangle,
  History,
  Store
} from 'lucide-react';

// STATIC NAVIGATION SOURCE PROFILE ARRAYS
const menuItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: ShoppingBag },
  { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
  { name: 'Users', path: '/admin/users', icon: Users },
];

const shopMenu = [
  { name: 'New Requests', path: '/admin/shop-request', icon: Store },
  { name: 'Shops History', path: '/admin/registered-shops', icon: Store },
];

const metricItems = [
  { name: 'Total Revenue', path: '/admin/metrics/revenue', icon: DollarSign },
  { name: 'Pending Orders', path: '/admin/metrics/pending', icon: Clock },
  { name: 'Out of Stock', path: '/admin/metrics/out-of-stock', icon: AlertTriangle },
  { name: 'Recent Orders', path: '/admin/metrics/recent', icon: History },
];

// CLEAN COMPONENT FUNCTION: NavigationMenu Render Sheet

const NavigationMenu = ({ currentPath, closeMobileMenu }) => {
  return (
    <>

      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <Logo />
        <button
          type="button"
          onClick={closeMobileMenu}
          className="lg:hidden p-1.5 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Core Management Section */}
        <div className="space-y-1.5">
          <p className="px-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Management</p>
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all select-none ${isActive
                    ? 'bg-red-400 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-red-100 hover:text-red-500'
                  }`}
              >
                <item.icon className={`w-4 h-4 transition-colors shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Shops Management Section */}
        <div className="space-y-1.5">
          <p className="px-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Shops Management</p>
          {shopMenu.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all select-none ${isActive
                    ? 'bg-red-400 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-red-100 hover:text-red-500'
                  }`}
              >
                <item.icon className={`w-4 h-4 transition-colors shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Live Insights/Metrics Section */}
        <div className="space-y-1.5">
          <p className="px-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Live Insights</p>
          {metricItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all select-none ${isActive
                    ? 'bg-red-400 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-red-100 hover:text-red-500'
                  }`}
              >
                <item.icon className={`w-4 h-4 transition-colors shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'}`} />
                <span className="truncate">{item.name}</span>
                <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded border ${isActive ? 'bg-white/20 text-white border-transparent' : 'bg-gray-100 text-slate-400 border-gray-200'
                  }`}>
                  API
                </span>
              </Link>
            );
          })}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <SignOut />
        </div>
      </div>
    </>
  );
};

// MAIN MASTER EXPORT COMPONENT LAYER
export default function AdminLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Freeze main window scrolling when mobile panel drawer triggers open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen bg-gray-100 antialiased font-sans overflow-hidden w-full select-none selection:bg-red-400 selection:text-white">

      {/* DESKTOP SIDEBAR PANEL (🚀 FIXED: Style layout updated to match red-50 navbar theme) */}
      <aside className="hidden lg:flex w-64 bg-white lg:bg-red-50 border-r border-gray-200 flex-col shadow-xs shrink-0 h-full overflow-hidden">
        <NavigationMenu currentPath={location.pathname} closeMobileMenu={closeMobileMenu} />
      </aside>

      {/* MOBILE SIDEBAR DRAWER WITH MODAL OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden h-full w-full">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity duration-200"
            onClick={closeMobileMenu}
          />
          {/* Mobile Panel Drawer matches 53vw viewport dimensions cleanly */}
          <aside className="relative flex w-[53vw] flex-col bg-white shadow-2xl h-full animate-in slide-in-from-left duration-200 overflow-hidden z-10">
            <NavigationMenu currentPath={location.pathname} closeMobileMenu={closeMobileMenu} />
          </aside>
        </div>
      )}

      {/* MAIN CONTENT SPACE CONTAINER SLATE */}
      <div className="flex-1 flex flex-col overflow-hidden w-full h-full">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm shrink-0">

          {/* Mobile Menu Hamburger Action Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`p-2 -ml-2 text-gray-600 hover:text-red-400 transition-colors focus:outline-none lg:hidden ${isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            aria-label="Open Management Sidebar Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-gray-500 hidden sm:inline">API Gateway Online</span>
            <span className="text-xs font-medium text-emerald-600 sm:hidden">Live</span>
          </div>
        </header>

        {/* ACTIVE CHILD OUTLET INNER CONTENT SLOT VIEW */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>

    </div>
  );
}