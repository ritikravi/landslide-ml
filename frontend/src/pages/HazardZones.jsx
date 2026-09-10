import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Users, TrendingUp, Eye, Filter, Globe } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://landslide-api.onrender.com';

const HazardZones = () => {
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [liveReport, setLiveReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [filter, setFilter] = useState({ country: '', riskLevel: '' });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchZones();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [zones, filter]);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/hazard-zones`);
      if (response.data.success) {
        setZones(response.data.zones);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/hazard-zones/stats/summary`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLiveReport = async (zoneId) => {
    try {
      setReportLoading(true);
      const response = await axios.get(`${API_URL}/api/hazard-zones/${zoneId}/live-report`);
      if (response.data.success) {
        setLiveReport(response.data.report);
      }
    } catch (error) {
      console.error('Error fetching live report:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = zones;

    if (filter.country) {
      filtered = filtered.filter(z => z.country.toLowerCase().includes(filter.country.toLowerCase()));
    }

    if (filter.riskLevel) {
      filtered = filtered.filter(z => z.riskLevel === filter.riskLevel);
    }

    setFilteredZones(filtered);
  };

  const handleViewReport = (zone) => {
    setSelectedZone(zone);
    setLiveReport(null);
    fetchLiveReport(zone.id);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-400 bg-red-900/20 border-red-500';
      case 'HIGH': return 'text-orange-400 bg-orange-900/20 border-orange-500';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
      case 'LOW': return 'text-green-400 bg-green-900/20 border-green-500';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-2 border-red-500/50 rounded-xl p-6">
        <div className="flex items-center mb-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">Global Landslide Hazard Zones</h1>
        </div>
        <p className="text-gray-300 mb-4">
          Monitor real-time conditions in landslide-prone regions across the world
        </p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Zones</div>
            </div>
            <div className="bg-red-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{stats.byRiskLevel.CRITICAL}</div>
              <div className="text-xs text-gray-400">Critical Risk</div>
            </div>
            <div className="bg-orange-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-400">{stats.byRiskLevel.HIGH}</div>
              <div className="text-xs text-gray-400">High Risk</div>
            </div>
            <div className="bg-yellow-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{stats.byRiskLevel.MEDIUM}</div>
              <div className="text-xs text-gray-400">Medium Risk</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center mb-3">
          <Filter className="w-5 h-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Country</label>
            <select
              value={filter.country}
              onChange={(e) => setFilter({...filter, country: e.target.value})}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
            >
              <option value="">All Countries</option>
              <option value="India">India</option>
              <option value="Nepal">Nepal</option>
              <option value="China">China</option>
              <option value="Philippines">Philippines</option>
              <option value="Colombia">Colombia</option>
              <option value="Italy">Italy</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Risk Level</label>
            <select
              value={filter.riskLevel}
              onChange={(e) => setFilter({...filter, riskLevel: e.target.value})}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
            >
              <option value="">All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ country: '', riskLevel: '' })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredZones.map((zone) => (
          <div
            key={zone.id}
            className={`${getRiskColor(zone.riskLevel)} border-2 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
            onClick={() => handleViewReport(zone)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{zone.name}</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="w-4 h-4 mr-1" />
                  {zone.region}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                zone.riskLevel === 'CRITICAL' ? 'bg-red-500' :
                zone.riskLevel === 'HIGH' ? 'bg-orange-500' :
                zone.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                'bg-green-500'
              } text-white`}>
                {zone.riskLevel}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 mb-4">{zone.description}</p>

            {/* Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-300">Population: {zone.population}</span>
              </div>
              <div className="flex items-center text-sm">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-300">Area: {zone.vulnerableArea}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {zone.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* View Button */}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Live Report
            </button>
          </div>
        ))}
      </div>

      {/* Live Report Modal */}
      {selectedZone && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedZone.name}</h2>
                <p className="text-gray-400">{selectedZone.region}</p>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {reportLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Loading live data...</span>
                </div>
              ) : liveReport ? (
                <>
                  {/* Live Risk Assessment */}
                  <div className={`${getRiskColor(liveReport.liveData.riskLevel)} border-2 rounded-xl p-6`}>
                    <h3 className="text-xl font-bold mb-2">CURRENT RISK: {liveReport.liveData.riskLevel}</h3>
                    <div className="text-3xl font-bold mb-2">{liveReport.liveData.riskScore}/100</div>
                    <p className="text-sm opacity-80">{liveReport.liveData.confidence}% confidence</p>
                    <p className="text-xs mt-2">
                      Updated: {new Date(liveReport.liveData.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Risk Factors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(liveReport.liveData.factors).map(([key, factor]) => {
                      if (!factor) return null;
                      return (
                        <div key={key} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-2 capitalize">{key} Risk</h4>
                          <div className="text-2xl font-bold text-blue-400 mb-2">{factor.level}</div>
                          <div className="text-sm text-gray-400 mb-2">Score: {factor.score}/100</div>
                          <ul className="space-y-1">
                            {factor.factors.map((f, i) => (
                              <li key={i} className="text-xs text-gray-300">• {f}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  {/* Historical Events */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Historical Events</h3>
                    <ul className="space-y-2">
                      {liveReport.historicalEvents.map((event, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start">
                          <span className="text-red-400 mr-2">⚠</span>
                          {event}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Monitoring Status */}
                  <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Monitoring Status</h4>
                    <p className="text-sm text-gray-300">{liveReport.monitoringStatus}</p>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-400 py-12">Unable to load report</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HazardZones;
