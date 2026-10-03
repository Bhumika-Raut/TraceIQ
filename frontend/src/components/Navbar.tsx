import React, { useState } from 'react';
import { Search, ShieldAlert, Network, LayoutDashboard, Cpu, Activity, X } from 'lucide-react';
import { EntityDetail } from '../types';
import { searchEntities } from '../services/api';

interface NavbarProps {
  activeTab: 'overview' | 'explore' | 'investigate';
  setActiveTab: (tab: 'overview' | 'explore' | 'investigate') => void;
  onSelectEntity: (entityId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onSelectEntity }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EntityDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchEntities(query);
      setSearchResults(results);
      setShowDropdown(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (entityId: string) => {
    onSelectEntity(entityId);
    setShowDropdown(false);
    setSearchQuery('');
    setActiveTab('investigate');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b1329]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-purple-300">
                  Trace<span className="text-purple-400">IQ</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-300 bg-purple-950/60 border border-purple-800/50 rounded-full uppercase">
                  Beta
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Find the connections hiding in your data.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Explore Graph</span>
            </button>
            <button
              onClick={() => setActiveTab('investigate')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'investigate'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Investigate</span>
            </button>
          </nav>

          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search user, account, device, IP or TX..."
                className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-xs text-slate-400 text-center flex items-center justify-center space-x-2">
                    <Activity className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>Searching connections...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-800">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                      Search Results ({searchResults.length})
                    </div>
                    {searchResults.map((res) => (
                      <div
                        key={res.entity_id}
                        onClick={() => handleSelectResult(res.entity_id)}
                        className="px-3 py-2.5 hover:bg-slate-800/70 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            res.entity_type === 'user' ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' :
                            res.entity_type === 'account' ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' :
                            res.entity_type === 'device' ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50' :
                            res.entity_type === 'ip' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {res.entity_type}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-100">{res.entity_id}</p>
                            <p className="text-[11px] text-slate-400">{res.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                            res.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            res.risk_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            Risk: {res.risk_score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching entities found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
