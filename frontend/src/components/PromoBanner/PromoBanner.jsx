import { useEffect, useState } from 'react';
import { FaBuilding, FaMapMarkerAlt, FaGooglePlay, FaApple } from 'react-icons/fa';
import './PromoBanner.css';
import companyLogo from '../../assets/logo/company-logo.png';

const WEBSITE_URL = 'https://thebuilderbazar.com/';
const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.builderbazar.app';
const IOS_APP_URL = 'https://apps.apple.com/in/app/the-builder-bazar/id6759222031';

function getExploreUrl() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return IOS_APP_URL;
  if (/Android/i.test(ua)) return ANDROID_APP_URL;
  return WEBSITE_URL;
}

// One copy of the promo content. We render this TWICE (see below) so the
// CSS marquee animation can loop seamlessly from -50% back to 0%.
function PromoContent() {
  const stop = (e) => e.stopPropagation();

  return (
    <>
      <div className="promo-bar__section promo-bar__section--brand">
        <div className="promo-bar__brand">
          <img
            src={companyLogo}
            alt="The Builder Bazar logo"
            className="promo-bar__logo"
          />
          <div className="promo-bar__brand-text">
            <span className="promo-bar__name">The Builder Bazar</span>
            <span className="promo-bar__tagline">Fresh Builder Floor Listings</span>
          </div>
        </div>
      </div>

      <div className="promo-bar__divider" aria-hidden="true" />

      <div className="promo-bar__section promo-bar__section--info">
        <div className="promo-bar__info-pill">
          <FaBuilding className="promo-bar__info-icon" />
          <span className="promo-bar__info-text">
            <span className="promo-bar__info-small">Direct</span>
            <span className="promo-bar__info-big">Builder Number</span>
          </span>
        </div>
      </div>

      <div className="promo-bar__divider" aria-hidden="true" />

      <div className="promo-bar__section promo-bar__section--info">
        <div className="promo-bar__info-pill">
          <FaMapMarkerAlt className="promo-bar__info-icon" />
          <span className="promo-bar__info-text">
            <span className="promo-bar__info-small">Direct</span>
            <span className="promo-bar__info-big">Plot Number</span>
          </span>
        </div>
      </div>

      <div className="promo-bar__divider" aria-hidden="true" />

      <div className="promo-bar__section promo-bar__section--download">
        <div className="promo-bar__badges">
          <a
            href={ANDROID_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="promo-bar__badge"
            onClick={stop}
            aria-label="Get it on Google Play"
          >
            <FaGooglePlay className="promo-bar__badge-icon" />
          </a>
          <a
            href={IOS_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="promo-bar__badge"
            onClick={stop}
            aria-label="Download on the App Store"
          >
            <FaApple className="promo-bar__badge-icon" />
          </a>
        </div>
      </div>
    </>
  );
}

export default function PromoBanner() {
  // We control "pause on hover" ourselves (instead of a plain CSS :hover
  // rule) because CSS :hover can get "stuck" true: if the click opens a
  // new tab and the user switches back without moving the mouse, no
  // mousemove event fires, so the browser never re-evaluates :hover and
  // the marquee stays paused forever. Tracking it in React lets us force
  // it back to "not hovered" whenever the tab regains focus/visibility.
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const resume = () => setIsPaused(false);

    // Tab/window regains focus (e.g. user comes back from the new tab)
    window.addEventListener('focus', resume);
    // Tab becomes visible again (covers more browsers/cases than 'focus')
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resume();
    });
    // Safety net: if the pointer leaves the window entirely, don't stay paused
    window.addEventListener('blur', resume);

    return () => {
      window.removeEventListener('focus', resume);
      window.removeEventListener('blur', resume);
      document.removeEventListener('visibilitychange', resume);
    };
  }, []);

  const handleNavigate = () => {
    window.open(getExploreUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <div
      className="promo-bar"
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="button"
      tabIndex={0}
    >
      <div className="promo-bar__top">
        {/* Decorative shine sweep — purely visual, sits above the marquee */}
        <div className="promo-bar__shine" aria-hidden="true" />

        {/* .promo-bar__marquee animates via CSS (translateX 0 -> -50%). 
            Because it contains exactly TWO identical .promo-bar__track copies,
            the animation loops with zero visible seam. isPaused (React state,
            not CSS :hover) controls whether it's running. */}
        <div className={`promo-bar__marquee${isPaused ? ' is-paused' : ''}`}>
          <div className="promo-bar__track">
            <PromoContent />
          </div>
          <div className="promo-bar__track" aria-hidden="true">
            <PromoContent />
          </div>
        </div>
      </div>
    </div>
  );
}