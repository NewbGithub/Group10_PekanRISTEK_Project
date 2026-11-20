import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex justify-between items-center px-4 py-3 border-b border-gray-300 bg-white">
        <div className="flex items-center gap-2">
          <span className="font-ui border border-gray-300 px-2 py-1 rounded text-[10px] font-semibold tracking-wider">LOGO</span>
          <Link to="/" className="font-headline text-lg font-semibold text-gray-800 hover:text-gray-600">
            TitleName
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <Link to="/" className="font-body hover:text-gray-600">Home</Link>
          <Link to="/reports" className="font-body hover:text-gray-600">Browse Items</Link>
          <Link to="#" className="font-body hover:text-gray-600">How It Works</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/create" className="font-ui text-sm border border-gray-300 px-3 py-1 rounded text-gray-700 hover:bg-gray-50">
            Report
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
            aria-label="Open menu"
          >
            ≡
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-b border-gray-300 bg-white z-50">
          <div className="px-4 py-3 space-y-3 border-b border-gray-300 pb-3">
            <Link to="/" className="font-body block text-sm text-gray-700 hover:bg-gray-50 px-2 py-1 rounded">
              Home
            </Link>
            <Link to="/reports" className="font-body block text-sm text-gray-700 hover:bg-gray-50 px-2 py-1 rounded">
              Browse Items
            </Link>
            <Link to="#" className="font-body block text-sm text-gray-700 hover:bg-gray-50 px-2 py-1 rounded">
              How It Works
            </Link>
          </div>
          <div className="px-4 py-3">
            <Link to="/create" className="font-ui w-full text-sm border border-gray-300 px-3 py-1 rounded text-gray-700 hover:bg-gray-50 block">
              Report an Item
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
