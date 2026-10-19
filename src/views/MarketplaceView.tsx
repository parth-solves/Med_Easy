import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, MapPin, MessageCircle, Plus, Search, ShoppingBag, Store, X } from 'lucide-react';
import { MARKET_LISTINGS, MarketListing, MarketListingKind } from '../data/marketListings';
import { useApp } from '../context/AppContext';

const INDIA_OUTLINE =
  'M173.8,59.5 L189.1,78.0 L187.6,90.8 L193.3,98.9 L192.8,106.9 L182.6,104.8 L186.6,122.2 L200.6,132.2 L220.3,143.2 L211.3,150.3 L205.8,165.1 L219.5,171.0 L232.9,178.8 L251.4,187.6 L270.9,189.6 L279.1,197.6 L290.0,199.1 L307.1,202.8 L318.9,202.6 L320.5,196.3 L318.7,186.3 L319.8,179.5 L328.4,176.2 L329.6,188.6 L329.9,191.8 L342.8,197.8 L351.7,195.3 L363.7,196.3 L375.3,195.9 L376.3,186.2 L370.5,181.2 L382.0,179.2 L394.9,167.5 L411.3,157.4 L423.2,161.3 L433.3,154.7 L439.9,164.5 L435.1,171.1 L450.4,173.5 L451.5,179.4 L446.5,182.3 L447.7,192.0 L437.6,189.2 L419.2,200.1 L419.6,209.1 L411.8,222.3 L411.1,230.0 L404.7,243.0 L393.6,239.4 L393.1,255.7 L389.9,261.0 L391.4,267.7 L384.4,271.5 L376.9,246.5 L373.0,246.5 L370.7,256.6 L362.9,248.4 L367.3,239.5 L373.6,238.6 L380.2,225.2 L372.0,222.5 L358.8,222.8 L345.3,220.6 L344.1,209.6 L337.3,208.9 L326.1,202.1 L321.0,212.7 L331.3,221.1 L322.4,227.0 L319.3,232.7 L328.0,236.9 L325.6,246.4 L330.5,258.3 L332.7,271.2 L330.7,277.0 L321.0,276.8 L303.5,280.1 L304.3,291.9 L296.8,301.2 L276.3,311.9 L260.5,330.4 L249.8,340.3 L235.6,350.6 L235.6,357.9 L228.5,361.8 L215.8,367.4 L209.1,368.3 L204.9,380.3 L207.8,400.8 L208.6,413.8 L202.6,428.8 L202.5,455.6 L195.2,456.3 L188.7,468.4 L193.0,473.6 L180.1,478.0 L175.3,488.7 L169.6,493.3 L156.2,478.6 L149.6,456.5 L144.1,440.6 L139.2,433.1 L131.6,418.0 L128.1,398.3 L125.7,388.5 L112.7,366.8 L106.9,336.3 L102.6,316.1 L102.7,297.0 L99.9,282.3 L79.3,291.7 L69.3,289.8 L50.7,270.7 L57.5,265.0 L53.3,258.8 L36.7,245.5 L46.2,234.9 L77.4,235.0 L74.6,221.5 L66.6,213.5 L65.0,201.3 L55.7,194.3 L71.3,177.7 L87.8,178.9 L102.7,162.4 L111.6,146.4 L125.3,130.6 L125.1,119.4 L137.2,110.3 L125.8,102.5 L120.8,91.8 L115.8,78.0 L122.8,71.2 L144.3,75.1 L160.1,72.7 L173.8,59.5 Z';

type ListingFilter = 'all' | MarketListingKind;
type ListingFormKind = 'buyer' | 'seller';

const LISTINGS_STORAGE_KEY = 'medeasy_user_market_listings_v1';

const getSavedListings = (): MarketListing[] => {
  try {
    const saved = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as MarketListing[]) : [];
  } catch (error) {
    console.error('Could not load saved marketplace listings.', error);
    return [];
  }
};

const listingLocation = (listing: MarketListing) => `${listing.city}, ${listing.state}`;

const whatsappLink = (listing: MarketListing) => {
  const action = listing.kind === 'seller' ? 'buy' : 'sell';
  const message = `Hello, I saw your ${listing.kind === 'seller' ? 'medicine offer' : 'medicine request'} on the MedEasy demo marketplace. I am interested to ${action} ${listing.medicine} (${listing.strength}) in ${listingLocation(listing)}. Please share details.`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

const MapPinButton: React.FC<{
  listing: MarketListing;
  selected: boolean;
  onSelect: (id: string) => void;
}> = ({ listing, selected, onSelect }) => {
  const x = (20 + ((listing.longitude - 67) / 31) * 440) / 480 * 100;
  const y = (20 + ((38 - listing.latitude) / 33) * 520) / 560 * 100;
  const color = listing.kind === 'seller' ? 'bg-red-600' : 'bg-emerald-600';

  return (
    <button
      type="button"
      title={`${listing.kind === 'seller' ? 'Seller' : 'Buyer'}: ${listingLocation(listing)} — ${listing.medicine}`}
      aria-label={`${listing.kind === 'seller' ? 'Seller' : 'Buyer'} in ${listingLocation(listing)} for ${listing.medicine}`}
      onClick={() => onSelect(listing.id)}
      className={`absolute z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-md transition hover:z-20 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 ${color} ${selected ? 'scale-125 ring-2 ring-slate-900 ring-offset-1' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="sr-only">{listing.city}</span>
    </button>
  );
};

export const MarketplaceView: React.FC = () => {
  const { activeView, setActiveView } = useApp();
  const [userListings, setUserListings] = useState<MarketListing[]>(getSavedListings);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formKind, setFormKind] = useState<ListingFormKind | null>(null);
  const [formError, setFormError] = useState('');
  const [medicine, setMedicine] = useState('');
  const [strength, setStrength] = useState('');
  const [city, setCity] = useState(MARKET_LISTINGS[0].city);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const listings = useMemo(() => [...userListings, ...MARKET_LISTINGS], [userListings]);
  const locations = useMemo(
    () =>
      Array.from(
        new Map(
          MARKET_LISTINGS.map((listing) => [
            `${listing.city}, ${listing.state}`,
            {
              city: listing.city,
              state: listing.state,
              latitude: listing.latitude,
              longitude: listing.longitude,
            },
          ])
        ).values()
      ).sort((a, b) => a.city.localeCompare(b.city)),
    []
  );
  const filter: ListingFilter = activeView === 'buy' ? 'seller' : activeView === 'sell' ? 'buyer' : 'all';

  useEffect(() => {
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(userListings));
  }, [userListings]);

  const visibleListings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesType = filter === 'all' || listing.kind === filter;
      const matchesSearch =
        !query ||
        listing.medicine.toLowerCase().includes(query) ||
        listing.strength.toLowerCase().includes(query) ||
        listing.city.toLowerCase().includes(query) ||
        listing.state.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [filter, listings, search]);

  const selectedListing = listings.find((listing) => listing.id === selectedId);
  const sellerCount = listings.filter((listing) => listing.kind === 'seller').length;
  const buyerCount = listings.length - sellerCount;

  const openListingForm = (kind: ListingFormKind) => {
    setFormKind(kind);
    setFormError('');
    setMedicine('');
    setStrength('');
    setQuantity('');
    setPrice('');
  };

  const handleAddListing = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formKind) return;

    const selectedLocation = locations.find((location) => location.city === city);
    const quantityValue = Number(quantity);
    const priceValue = Number(price);
    if (!selectedLocation || !Number.isFinite(quantityValue) || quantityValue <= 0 || !Number.isFinite(priceValue) || priceValue <= 0) {
      setFormError('Choose a location and enter a quantity and price greater than zero.');
      return;
    }

    const listing: MarketListing = {
      id: `user-${Date.now()}`,
      medicine: medicine.trim(),
      strength: strength.trim(),
      kind: formKind,
      ...selectedLocation,
      quantity: `${quantityValue} packs`,
      price: priceValue,
      isUserAdded: true,
    };

    setUserListings((current) => [listing, ...current]);
    setSelectedId(listing.id);
    setFormKind(null);
    setActiveView('dashboard');
  };

  const removeUserListing = (listingId: string) => {
    setUserListings((current) => current.filter((listing) => listing.id !== listingId));
    if (selectedId === listingId) setSelectedId(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">MedEasy marketplace</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Find medicine buyers and sellers across India
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Browse medicine listings, post what you need or have, and start a WhatsApp conversation.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveView('buy')}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-50"
            >
              I want to buy
            </button>
            <button
              type="button"
              onClick={() => setActiveView('sell')}
              className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              I want to sell
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Add your medicine listing</h2>
          <p className="mt-1 text-xs text-slate-500">Post a medicine you need or one you have for sale.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openListingForm('buyer')}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add medicine to buy
          </button>
          <button
            type="button"
            onClick={() => openListingForm('seller')}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Add medicine to sell
          </button>
        </div>
      </section>

      {formKind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-form-title"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Marketplace listing</p>
                <h2 id="listing-form-title" className="mt-1 text-xl font-bold text-slate-900">
                  {formKind === 'buyer' ? 'Add medicine you want to buy' : 'Add medicine you want to sell'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">This sample listing stays saved in this browser.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormKind(null)}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddListing} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Medicine name
                <input
                  required
                  maxLength={80}
                  value={medicine}
                  onChange={(event) => setMedicine(event.target.value)}
                  placeholder="For example, Paracetamol"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Strength or pack
                <input
                  required
                  maxLength={80}
                  value={strength}
                  onChange={(event) => setStrength(event.target.value)}
                  placeholder="For example, 500 mg tablets"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                City
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500"
                >
                  {locations.map((location) => (
                    <option key={location.city} value={location.city}>
                      {location.city}, {location.state}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Number of packs
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="For example, 20"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Price per pack (₹)
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="For example, 150"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-emerald-500"
                  />
                </label>
              </div>
              {formError && <p role="alert" className="text-sm font-medium text-red-700">{formError}</p>}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setFormKind(null)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-lg px-4 py-2.5 text-sm font-bold text-white transition ${formKind === 'buyer' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Post listing
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">People on the map</h2>
              <p className="mt-0.5 text-xs text-slate-500">Tap a point to see the medicine and city.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="h-3 w-3 rounded-full bg-emerald-600" /> Buyers ({buyerCount})
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="h-3 w-3 rounded-full bg-red-600" /> Sellers ({sellerCount})
              </span>
            </div>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_210px]">
            <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-2xl bg-sky-50">
              <svg
                viewBox="0 0 480 560"
                role="img"
                aria-label="Map of India showing sample medicine buyers and sellers"
                className="block h-auto w-full"
              >
                <defs>
                  <linearGradient id="india-fill" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#d1fae5" />
                    <stop offset="100%" stopColor="#a7f3d0" />
                  </linearGradient>
                  <pattern id="map-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.4" />
                  </pattern>
                </defs>
                <rect width="480" height="560" fill="url(#map-dots)" />
                <path
                  d={INDIA_OUTLINE}
                  fill="url(#india-fill)"
                  stroke="#0f766e"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <text x="236" y="294" fill="#0f766e" opacity="0.45" textAnchor="middle" fontSize="20" fontWeight="700">
                  INDIA
                </text>
              </svg>
              {listings.map((listing) => (
                <MapPinButton
                  key={listing.id}
                  listing={listing}
                  selected={listing.id === selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                {selectedListing ? (
                  <>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${selectedListing.kind === 'seller' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {selectedListing.kind}
                    </span>
                    <h3 className="mt-2 font-bold text-slate-900">{selectedListing.medicine}</h3>
                    <p className="text-xs text-slate-600">{selectedListing.strength}</p>
                    <p className="mt-2 inline-flex items-start gap-1.5 text-xs text-slate-700">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      {listingLocation(selectedListing)}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">{selectedListing.quantity}</p>
                    <a
                      href={whatsappLink(selectedListing)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Open WhatsApp
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </>
                ) : (
                  <div className="py-3 text-center">
                    <MapPin className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-2 text-sm font-semibold text-slate-800">Choose a map point</p>
                    <p className="mt-1 text-xs text-slate-500">Green is a buyer. Red is a seller.</p>
                  </div>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Map dots use city coordinates. Listing names, stock, prices, and locations are examples, not real suppliers or live offers.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-3 border-b border-slate-100 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-slate-900">
                  {filter === 'seller' ? 'Medicine sellers' : filter === 'buyer' ? 'Medicine buyers' : 'Medicine listings'}
                </h2>
                <p className="text-xs text-slate-500">{visibleListings.length} listings across India</p>
              </div>
              <select
                value={filter}
                onChange={(event) => setActiveView(event.target.value === 'seller' ? 'buy' : event.target.value === 'buyer' ? 'sell' : 'dashboard')}
                aria-label="Filter listings"
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700"
              >
                <option value="all">All</option>
                <option value="seller">Sellers</option>
                <option value="buyer">Buyers</option>
              </select>
            </div>
            <label className="relative block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search medicine or city"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </label>
          </div>

          <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto">
            {visibleListings.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">No listings match. Try another search.</p>
            ) : (
              visibleListings.map((listing) => (
                <article
                  key={listing.id}
                  className={`p-4 transition ${selectedId === listing.id ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}
                  onMouseEnter={() => setSelectedId(listing.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${listing.kind === 'seller' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {listing.kind === 'seller' ? <Store className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                        {listing.kind === 'seller' ? 'Seller' : 'Buyer'}
                      </span>
                      <h3 className="mt-2 font-bold text-slate-900">{listing.medicine}</h3>
                      <p className="text-xs text-slate-600">{listing.strength}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {listingLocation(listing)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold text-slate-900">₹{listing.price}</div>
                      <div className="text-[10px] text-slate-500">sample / pack</div>
                      <div className="mt-1 text-xs text-slate-600">{listing.quantity}</div>
                    </div>
                  </div>
                  <a
                    href={whatsappLink(listing)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Connect on WhatsApp
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                  {listing.isUserAdded && (
                    <button
                      type="button"
                      onClick={() => removeUserListing(listing.id)}
                      className="ml-3 mt-3 text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-red-700"
                    >
                      Remove my listing
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        Demo only: the original 30 medicine listings, quantities, prices, and locations are sample data. Listings you add are saved only in this browser. Verify licences, stock, prescriptions where needed, and applicable rules before any real medicine trade.
      </p>
    </div>
  );
};
