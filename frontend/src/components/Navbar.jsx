import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMenu = () => setMobileMenuOpen(false);

  const activeLink = ({ isActive }) =>
    `ui block px-4 py-2 text-base leading-6 ${
      isActive ? 'bg-ink text-yellow' : 'flip'
    }`;
  const plainLink = 'ui block px-4 py-2 text-base leading-6 flip';

  // Re-clicking "How It Works" while already on the home page must scroll again,
  // even though the URL hash does not change.
  const goToHowItWorks = (event) => {
    closeMenu();
    if (location.pathname !== '/') return; // let the link navigate home first
    const section = document.getElementById('how-it-works');
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth' });
    if (location.hash !== '#how-it-works') {
      navigate('/#how-it-works', { replace: true });
    }
  };

  return (
    <header className="stamp sticky top-0 z-30 border-b-[3px] border-ink bg-cream" style={{ '--i': 0 }}>
      <div className="flex items-center justify-between px-4 py-4 md:px-16 md:py-5">
        <div className="flex items-center gap-2">
          <span
            className="wiggle block h-8 w-8 rounded-[10px] border-[3px] border-ink bg-pink"
            aria-hidden="true"
          />
          <NavLink
            to="/"
            className="font-head text-xl font-bold tracking-[-0.02em]"
          >
            Temu Pacil
          </NavLink>
        </div>

        <nav className="hidden md:flex" aria-label="Main">
          <NavLink to="/" className={activeLink}>
            Home
          </NavLink>
          <NavLink to="/reports" className={activeLink}>
            Browse Items
          </NavLink>
          <NavLink to="/#how-it-works" onClick={goToHowItWorks} className={plainLink}>
            How It Works
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Button to="/create" small className="!px-4 !py-2">
            Report
          </Button>
          <button
            onClick={toggleMenu}
            className="press grid h-12 w-12 place-items-center rounded-[10px] bg-pink md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="grid gap-1" aria-hidden="true">
              <i className="block h-[3px] w-6 bg-ink" />
              <i className="block h-[3px] w-6 bg-ink" />
              <i className="block h-[3px] w-6 bg-ink" />
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          key={location.pathname}
          id="mobile-menu"
          className="snap-y border-t-[3px] border-ink bg-cream md:hidden"
          aria-label="Mobile"
        >
          <div className="grid gap-1 border-b-[3px] border-ink px-4 py-3">
            <NavLink to="/" onClick={closeMenu} className={activeLink}>
              Home
            </NavLink>
            <NavLink to="/reports" onClick={closeMenu} className={activeLink}>
              Browse Items
            </NavLink>
            <NavLink to="/#how-it-works" onClick={goToHowItWorks} className={plainLink}>
              How It Works
            </NavLink>
          </div>
          <div className="px-4 py-3">
            <Button to="/create" full onClick={closeMenu}>
              Report an Item
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
