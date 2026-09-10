import React, { useState, useEffect, useRef, useCallback } from 'react';
import { loadGoogleMaps } from '../../lib/google-maps';
import { geocodePincode, geocodeFromCoords, validatePincode } from '../../lib/google-geocoding';

const DEFAULT_CENTER = { lat: 20.2961, lng: 85.8245 };
const DEFAULT_ZOOM = 10;
const GEOCODE_ZOOM = 15;

export default function GoogleMap({ onLocationChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const google = await loadGoogleMaps();
        if (cancelled) return;

        const map = new google.maps.Map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeId: 'satellite',
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: ['satellite', 'hybrid', 'roadmap'],
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          scaleControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          gestureHandling: 'greedy',
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setMapError(err.message || 'Failed to load Google Maps');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const placeMarker = useCallback((google, lat, lng, title) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: title || 'Location',
      animation: google.maps.Animation.DROP,
    });

    markerRef.current = marker;
  }, []);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    setSearchError('');

    const validation = validatePincode(pinInput);
    if (!validation.valid) {
      setSearchError(validation.error);
      return;
    }

    setSearching(true);
    try {
      const result = await geocodePincode(pinInput);
      const google = await loadGoogleMaps();

      mapInstanceRef.current.panTo({ lat: result.lat, lng: result.lng });
      mapInstanceRef.current.setZoom(GEOCODE_ZOOM);

      placeMarker(google, result.lat, result.lng, `PIN: ${result.postalCode}`);

      const loc = {
        lat: result.lat,
        lng: result.lng,
        address: result.address,
        postalCode: result.postalCode,
      };
      setLocation(loc);
      onLocationChange?.(loc);
    } catch (err) {
      setSearchError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [pinInput, placeMarker, onLocationChange]);

  const handleMyLocation = useCallback(() => {
    setSearchError('');
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by this browser');
      return;
    }

    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const loc = await geocodeFromCoords(lat, lng);
          const google = await loadGoogleMaps();

          mapInstanceRef.current.panTo({ lat, lng });
          mapInstanceRef.current.setZoom(GEOCODE_ZOOM);

          placeMarker(google, lat, lng, 'Your Location');

          const locationData = {
            lat,
            lng,
            address: loc.address,
            postalCode: loc.postalCode,
          };
          setLocation(locationData);
          onLocationChange?.(locationData);
        } catch (err) {
          setSearchError(err.message || 'Failed to get address for your location');
        } finally {
          setSearching(false);
        }
      },
      (err) => {
        setSearching(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setSearchError('Location permission denied. You can search by PIN code instead.');
            break;
          case err.POSITION_UNAVAILABLE:
            setSearchError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setSearchError('Location request timed out.');
            break;
          default:
            setSearchError('An unknown error occurred getting your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [placeMarker, onLocationChange]);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="flex items-center gap-2 p-3 bg-slate-900 border-b border-slate-800">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPinInput(val);
                setSearchError('');
              }}
              placeholder="Enter 6-digit PIN"
              maxLength={6}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching || pinInput.length !== 6}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <button
          onClick={handleMyLocation}
          disabled={searching}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
        >
          My Location
        </button>
      </div>

      {/* Error display */}
      {searchError && (
        <div className="px-3 py-2 bg-red-950 border-b border-red-800 text-red-300 text-xs">
          {searchError}
        </div>
      )}

      {/* Map error display */}
      {mapError && (
        <div className="flex-1 flex items-center justify-center bg-slate-950">
          <div className="text-center space-y-2 p-6">
            <div className="text-red-400 text-sm font-bold">Failed to load Google Maps</div>
            <div className="text-slate-400 text-xs">{mapError}</div>
            <div className="text-slate-500 text-[10px]">
              Check that VITE_GOOGLE_MAPS_API_KEY is set and the Maps JavaScript API is enabled.
            </div>
          </div>
        </div>
      )}

      {/* Map container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />

        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
            <div className="text-center space-y-2">
              <div className="h-6 w-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-slate-400 text-xs">Loading Google Maps...</div>
            </div>
          </div>
        )}
      </div>

      {/* Location info bar */}
      {location && (
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-4 flex-wrap">
          <span>
            <span className="text-slate-500">lat:</span>{' '}
            <span className="text-sky-300 font-bold">{location.lat.toFixed(6)}</span>
          </span>
          <span>
            <span className="text-slate-500">lng:</span>{' '}
            <span className="text-sky-300 font-bold">{location.lng.toFixed(6)}</span>
          </span>
          <span>
            <span className="text-slate-500">PIN:</span>{' '}
            <span className="text-amber-300 font-bold">{location.postalCode}</span>
          </span>
          <span className="text-slate-500 truncate max-w-xs">
            {location.address}
          </span>
        </div>
      )}
    </div>
  );
}
