import { useEffect, useRef } from 'react';
import { FaBuilding, FaMapMarkerAlt, FaGooglePlay, FaApple } from 'react-icons/fa';
import './PromoBanner.css';

const COMPANY_LOGO_PATH = '/assets/logo/company-logo.svg';
const WEBSITE_URL = 'https://thebuilderbazar.com/';
const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.builderbazar.app';
const IOS_APP_URL = 'https://apps.apple.com/app/id0000000000'; // TODO: replace with real App Store ID

function getExploreUrl() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return IOS_APP_URL;
  if (/Android/i.test(ua)) return ANDROID_APP_URL;
  return WEBSITE_URL;
}

export default function PromoBanner() {
  const scrollRef = useRef(null);
  const pauseScrollRef = useRef(false);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;

    let frameId = 0;
    const animate = () => {
      if (!pauseScrollRef.current) {
        const trackWidth = node.scrollWidth / 2;
        node.scrollLeft += 1.2;
        if (node.scrollLeft >= trackWidth) {
          node.scrollLeft -= trackWidth;
        }
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
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

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="promo-bar"
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div
        className="promo-bar__top"
        ref={scrollRef}
        onMouseEnter={() => {
          pauseScrollRef.current = true;
        }}
        onMouseLeave={() => {
          pauseScrollRef.current = false;
        }}
      >
        <div className="promo-bar__scroll-track">
          <div className="promo-bar__section promo-bar__section--brand">
            <div className="promo-bar__brand">
              <img
                src={COMPANY_LOGO_PATH}
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
        </div>

        <div className="promo-bar__scroll-gap" aria-hidden="true" />

        <div className="promo-bar__scroll-track" aria-hidden="true">
          <div className="promo-bar__section promo-bar__section--brand">
            <div className="promo-bar__brand">
              <img
                src={COMPANY_LOGO_PATH}
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
        </div>
      </div>
    </div>
  );
}
