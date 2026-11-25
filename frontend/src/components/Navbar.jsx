import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';
import pandaLogo from './panda-icon-8264976-512.png';
import catLogo from './CatDoodleLogo-removebg-preview.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // How It Works is a hash link, so NavLink cannot tell it apart from Home.
  // The hash is the single source of truth for the desktop active box.
  const howItWorksActive =
    location.pathname === '/' && location.hash === '#how-it-works';

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMenu = () => setMobileMenuOpen(false);

  // Desktop active link floats in a light box; mobile keeps the black bar.
  const desktopActiveBox =
    'md:border-ink md:bg-white md:text-ink md:shadow-[0_6px_14px_rgba(17,17,17,0.18)] md:-translate-y-px';
  const navClass = (isActive) =>
    `ui block px-4 py-2 text-base leading-6 md:rounded-[10px] md:border-[3px] ${
      isActive
        ? `bg-ink text-yellow ${desktopActiveBox}`
        : 'md:border-transparent flip'
    }`;
  const desktopLink = ({ isActive }) => navClass(isActive);

  // Mobile menu keeps its original styling.
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
        <NavLink to="/" className="flex items-center gap-2">
          <img
            src={pandaLogo}
            alt=""
            aria-hidden="true"
            className="wiggle block h-10 w-10 object-cover"
          />
          <span className="font-head text-xl font-bold tracking-[-0.02em]">
            Temu Pacil
          </span>
          <img
            src={catLogo}
            alt=""
            aria-hidden="true"
            className="cat-hop block h-11 w-auto object-contain"
          />
        </NavLink>

        <nav className="hidden md:flex" aria-label="Main">
          <NavLink to="/" className={desktopLink}>
            Home
          </NavLink>
          <NavLink to="/reports" className={desktopLink}>
            Browse Items
          </NavLink>
          <NavLink
            to="/#how-it-works"
            onClick={goToHowItWorks}
            className={navClass(howItWorksActive)}
          >
            How It Works
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Button to="/create?type=LOST" small className="!px-6 !py-2">
            Report an Item
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
            <Button to="/create?type=LOST" full onClick={closeMenu}>
              Report an Item
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
