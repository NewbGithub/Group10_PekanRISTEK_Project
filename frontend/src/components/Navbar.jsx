import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev);

  return (
    <>
      <nav className="flex justify-between items-center px-4 py-3 border-b border-gray-300 bg-white">
        <div className="flex items-center gap-2">
          <span className="font-ui border border-gray-300 px-2 py-1 rounded text-[10px] font-semibold tracking-wider">LOGO</span>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-headline text-lg font-semibold tracking-wider ${
                isActive ? 'text-gray-900' : 'text-gray-800 hover:text-gray-600'
              }`
            }
          >
            TitleName
          </NavLink>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-body px-2 py-1 rounded ${
                isActive ? 'bg-gray-200 text-gray-800' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `font-body px-2 py-1 rounded ${
                isActive ? 'bg-gray-200 text-gray-800' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            Browse Items
          </NavLink>
          <NavLink
            to="/#how-it-works"
            className="font-body hover:text-gray-600"
          >
            How It Works
          </NavLink>
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to="/create"
            className="font-ui text-sm border border-gray-300 px-3 py-1 rounded text-gray-700 hover:bg-gray-50"
          >
            Report
          </NavLink>
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            ≡
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div key={location.pathname} id="mobile-menu" className="md:hidden border-t border-b border-gray-300 bg-white z-50">
          <div className="px-4 py-3 space-y-3 border-b border-gray-300 pb-3">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `font-body block text-sm px-2 py-1 rounded ${
                  isActive ? 'bg-gray-200 text-gray-800' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `font-body block text-sm px-2 py-1 rounded ${
                  isActive ? 'bg-gray-200 text-gray-800' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              Browse Items
            </NavLink>
            <NavLink
              to="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="font-body block text-sm text-gray-700 hover:bg-gray-50 px-2 py-1 rounded"
            >
              How It Works
            </NavLink>
          </div>
          <div className="px-4 py-3">
            <NavLink
              to="/create"
              className="font-ui w-full text-sm border border-gray-300 px-3 py-1 rounded text-gray-700 hover:bg-gray-50 block"
            >
              Report an Item
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
}
