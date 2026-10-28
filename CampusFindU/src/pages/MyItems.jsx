import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/apiClient";
import Swal from "../utils/swal";
import EmptyState from "../components/EmptyState";
import { CardGridSkeleton } from "../components/Skeleton";
import {
  Search,
  X,
  Filter,
  MapPin,
  Tag,
  Calendar,
  Eye,
  Plus,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Package,
  Clock,
} from "lucide-react";

export default function MyItems() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("lost");
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const currentUserId = user?.id || null;
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all"); // "all" vs "mine"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lostData, foundData, claimsData] = await Promise.all([
          apiClient.get("https://campusfindu-backend.onrender.com/api/lost-items"),
          apiClient.get("https://campusfindu-backend.onrender.com/api/found-items"),
          apiClient.get("https://campusfindu-backend.onrender.com/api/claims"),
        ]);

        setLostItems(lostData || []);
        setFoundItems(foundData || []);
        setMyClaims(
          (claimsData || []).filter((claim) => claim.claimant_id === currentUserId),
        );
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  // Quick lookup map for found items matching claims
  const foundItemsMap = useMemo(() => {
    const map = new Map();
    foundItems.forEach((item) => {
      map.set(String(item.id), item);
    });
    return map;
  }, [foundItems]);

  // Dynamic category options derived from all items
  const categoryOptions = useMemo(() => {
    const categories = new Set();
    [...lostItems, ...foundItems].forEach((item) => {
      if (item.category && item.category.trim()) {
        categories.add(item.category.trim());
      }
    });
    return Array.from(categories).sort();
  }, [lostItems, foundItems]);

  // Statistics calculation
  const stats = useMemo(() => {
    const myLostCount = lostItems.filter(
      (item) => item.user_id === currentUserId,
    ).length;
    const myFoundCount = foundItems.filter(
      (item) => item.user_id === currentUserId,
    ).length;
    const pendingClaimsCount = myClaims.filter(
      (c) => c.status === "pending",
    ).length;

    return {
      totalLost: lostItems.length,
      myLostCount,
      totalFound: foundItems.length,
      myFoundCount,
      totalClaims: myClaims.length,
      pendingClaimsCount,
    };
  }, [lostItems, foundItems, myClaims, currentUserId]);

  // Filtered Lost Items
  const filteredLostItems = useMemo(() => {
    return lostItems.filter((item) => {
      if (scopeFilter === "mine" && item.user_id !== currentUserId) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchLoc = item.location_name?.toLowerCase().includes(query);
        const matchCat = item.category?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLoc && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [lostItems, scopeFilter, statusFilter, categoryFilter, searchTerm, currentUserId]);

  // Filtered Found Items
  const filteredFoundItems = useMemo(() => {
    return foundItems.filter((item) => {
      if (scopeFilter === "mine" && item.user_id !== currentUserId) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchLoc = item.location_name?.toLowerCase().includes(query);
        const matchCat = item.category?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLoc && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [foundItems, scopeFilter, statusFilter, categoryFilter, searchTerm, currentUserId]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return myClaims.filter((claim) => {
      if (statusFilter !== "all" && claim.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchProof = claim.proof_description?.toLowerCase().includes(query);
        const item = foundItemsMap.get(String(claim.found_item_id));
        const matchItemTitle = item?.title?.toLowerCase().includes(query);
        const matchItemCategory = item?.category?.toLowerCase().includes(query);
        const matchItemLocation = item?.location_name?.toLowerCase().includes(query);
        if (!matchProof && !matchItemTitle && !matchItemCategory && !matchItemLocation) {
          return false;
        }
      }
      return true;
    });
  }, [myClaims, statusFilter, searchTerm, foundItemsMap]);

  // Image modal preview
  const openImageModal = (title, imageUrl) => {
    if (!imageUrl) return;
    Swal.fire({
      title: title || "Item Photo",
      imageUrl: imageUrl,
      imageAlt: title || "Item Photo",
      width: "90%",
      imageWidth: "100%",
      confirmButtonColor: "#0A4222",
      confirmButtonText: "Close Preview",
      showCloseButton: true,
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setScopeFilter("all");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    scopeFilter !== "all";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto font-sans space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-56 mb-2" />
          <div className="h-4 bg-gray-150 rounded w-80 max-w-full" />
        </div>
        <CardGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto font-sans space-y-6 pb-12">
      {/* SaaS Dashboard Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 md:p-8 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-green-50 text-mmsu-green border border-green-200/60 shadow-inner">
                <Package className="w-5 h-5 text-mmsu-green" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Items & Claims Hub
              </h1>
            </div>
            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
              Manage your campus lost reports, found submissions, and track
              ownership claims in real-time.
            </p>
          </div>

          {/* Quick Action SaaS Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/report-lost"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 text-rose-700 text-xs md:text-sm font-semibold transition-all shadow-xs hover:shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Report Lost</span>
            </Link>
            <Link
              to="/report-found"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mmsu-green hover:bg-mmsu-light-green text-white text-xs md:text-sm font-semibold transition-all shadow-xs hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-mmsu-green"
            >
              <Plus className="w-4 h-4" />
              <span>Report Found</span>
            </Link>
          </div>
        </div>

        {/* Quick Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="bg-gray-50/80 hover:bg-gray-50 p-3.5 md:p-4 rounded-xl border border-gray-200/70 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>Lost Reports</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100/80 text-amber-800">
                {stats.myLostCount} by you
              </span>
            </div>
            <p className="text-xl md:text-2xl font-black text-gray-900">
              {stats.totalLost}
            </p>
          </div>

          <div className="bg-gray-50/80 hover:bg-gray-50 p-3.5 md:p-4 rounded-xl border border-gray-200/70 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>Found Reports</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100/80 text-green-800">
                {stats.myFoundCount} by you
              </span>
            </div>
            <p className="text-xl md:text-2xl font-black text-gray-900">
              {stats.totalFound}
            </p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-gray-50/80 hover:bg-gray-50 p-3.5 md:p-4 rounded-xl border border-gray-200/70 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>My Claims</span>
              {stats.pendingClaimsCount > 0 ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  {stats.pendingClaimsCount} pending
                </span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700">
                  Updated
                </span>
              )}
            </div>
            <p className="text-xl md:text-2xl font-black text-gray-900">
              {stats.totalClaims}
            </p>
          </div>
        </div>
      </div>

      {/* Pill-Shaped Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Item and Claim Sections"
          className="bg-white/80 backdrop-blur-xs p-1.5 rounded-2xl border border-gray-200/80 shadow-xs inline-flex items-center gap-1.5 overflow-x-auto max-w-full"
        >
          <button
            role="tab"
            aria-selected={activeTab === "lost"}
            onClick={() => {
              setActiveTab("lost");
              setStatusFilter("all");
            }}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
              activeTab === "lost"
                ? "bg-mmsu-green text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <span>Lost Items</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === "lost"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {lostItems.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "found"}
            onClick={() => {
              setActiveTab("found");
              setStatusFilter("all");
            }}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
              activeTab === "found"
                ? "bg-mmsu-green text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <span>Found Items</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === "found"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {foundItems.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "claims"}
            onClick={() => {
              setActiveTab("claims");
              setStatusFilter("all");
            }}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
              activeTab === "claims"
                ? "bg-mmsu-green text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <span>My Claims</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === "claims"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {myClaims.length}
            </span>
            {stats.pendingClaimsCount > 0 && activeTab !== "claims" && (
              <span
                className="w-2 h-2 rounded-full bg-mmsu-gold"
                title={`${stats.pendingClaimsCount} pending claims`}
              />
            )}
          </button>
        </div>

        {/* Scope Pill Toggle (Only for Lost and Found tabs) */}
        {activeTab !== "claims" && (
          <div className="inline-flex items-center p-1 bg-white rounded-xl border border-gray-200/80 shadow-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setScopeFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                scopeFilter === "all"
                  ? "bg-mmsu-green text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              All Campus Items
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter("mine")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] flex items-center gap-1.5 ${
                scopeFilter === "mine"
                  ? "bg-mmsu-green text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span>My Reports Only</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  scopeFilter === "mine"
                    ? "bg-white/20 text-white"
                    : "bg-mmsu-gold/20 text-mmsu-green"
                }`}
              >
                {activeTab === "lost" ? stats.myLostCount : stats.myFoundCount}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Control Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 md:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "claims"
                  ? "Search claims by proof or item name..."
                  : `Search ${activeTab === "lost" ? "lost" : "found"} items by title, location, category...`
              }
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200/90 focus:border-mmsu-green focus:ring-2 focus:ring-mmsu-green/20 outline-none transition shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
                className="appearance-none pl-3.5 pr-8 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-xs md:text-sm font-medium text-gray-800 rounded-xl border border-gray-200/90 focus:border-mmsu-green focus:ring-2 focus:ring-mmsu-green/20 outline-none cursor-pointer transition shadow-xs"
              >
                <option value="all">All Statuses</option>
                {activeTab === "claims" ? (
                  <>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </>
                ) : (
                  <>
                    <option value="lost">Status: Lost</option>
                    <option value="found">Status: Found</option>
                    <option value="claimed">Status: Claimed</option>
                    <option value="resolved">Status: Resolved</option>
                    <option value="pending">Status: Pending</option>
                  </>
                )}
              </select>
              <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category Filter (For Lost/Found tabs) */}
            {activeTab !== "claims" && categoryOptions.length > 0 && (
              <div className="relative shrink-0">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter by Category"
                  className="appearance-none pl-3.5 pr-8 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-xs md:text-sm font-medium text-gray-800 rounded-xl border border-gray-200/90 focus:border-mmsu-green focus:ring-2 focus:ring-mmsu-green/20 outline-none cursor-pointer transition shadow-xs max-w-[160px] truncate"
                >
                  <option value="all">All Categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Tag className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Pills Indicator */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span className="font-medium text-gray-400">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-medium">
                Query: &quot;{searchTerm}&quot;
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-medium capitalize">
                Status: {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-medium">
                Category: {categoryFilter}
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {scopeFilter === "mine" && (
              <span className="inline-flex items-center gap-1 bg-mmsu-gold/20 text-mmsu-green px-2 py-0.5 rounded-lg font-bold">
                My Reports Only
                <button
                  type="button"
                  onClick={() => setScopeFilter("all")}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content Sections: Modern Responsive Cards */}
      <div className="transition-all duration-150">
        {/* Tab 1: Lost Items List */}
        {activeTab === "lost" && (
          <div>
            {filteredLostItems.length === 0 ? (
              <div className="py-8 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                <EmptyState
                  title={
                    hasActiveFilters
                      ? "No Lost Items Match Filters"
                      : "No Lost Items Reported Yet"
                  }
                  description={
                    hasActiveFilters
                      ? "Try clearing your search terms or filters to see all reported lost items."
                      : "You haven't reported any lost items. If you misplaced an item on campus, report it now to help find it."
                  }
                  actionText={hasActiveFilters ? "Clear Filters" : "Report Lost Item"}
                  actionLink={hasActiveFilters ? null : "/report-lost"}
                  onAction={hasActiveFilters ? clearAllFilters : null}
                  secondaryActionText={
                    hasActiveFilters ? "Report Lost Item" : null
                  }
                  secondaryActionLink={hasActiveFilters ? "/report-lost" : null}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 md:gap-6">
                {filteredLostItems.map((item) => (
                  <ItemCard
                    key={`lost-${item.id}`}
                    item={item}
                    type="lost"
                    isOwner={item.user_id === currentUserId}
                    onOpenImage={() => openImageModal(item.title, item.image_url)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Found Items List */}
        {activeTab === "found" && (
          <div>
            {filteredFoundItems.length === 0 ? (
              <div className="py-8 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                <EmptyState
                  title={
                    hasActiveFilters
                      ? "No Found Items Match Filters"
                      : "No Found Items Reported Yet"
                  }
                  description={
                    hasActiveFilters
                      ? "Try clearing your search terms or filters to see all reported found items."
                      : "You haven't reported any found items. Help return discovered belongings to their owners."
                  }
                  actionText={hasActiveFilters ? "Clear Filters" : "Report Found Item"}
                  actionLink={hasActiveFilters ? null : "/report-found"}
                  onAction={hasActiveFilters ? clearAllFilters : null}
                  secondaryActionText={
                    hasActiveFilters ? "Report Found Item" : null
                  }
                  secondaryActionLink={hasActiveFilters ? "/report-found" : null}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 md:gap-6">
                {filteredFoundItems.map((item) => (
                  <ItemCard
                    key={`found-${item.id}`}
                    item={item}
                    type="found"
                    isOwner={item.user_id === currentUserId}
                    onOpenImage={() => openImageModal(item.title, item.image_url)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Claims */}
        {activeTab === "claims" && (
          <div>
            {filteredClaims.length === 0 ? (
              <div className="py-8 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                <EmptyState
                  title={
                    hasActiveFilters
                      ? "No Claims Match Filter"
                      : "No Claims Submitted Yet"
                  }
                  description={
                    hasActiveFilters
                      ? "No claims match your current search query. Clear filters to see all your filed claims."
                      : "You haven't filed any ownership claims yet. Browse the found items board to locate and claim your missing belongings."
                  }
                  actionText={
                    hasActiveFilters ? "Clear Filters" : "Browse Found Items"
                  }
                  actionLink={hasActiveFilters ? null : "/found-items"}
                  onAction={hasActiveFilters ? clearAllFilters : null}
                  secondaryActionText={
                    hasActiveFilters ? "Browse Found Items" : null
                  }
                  secondaryActionLink={hasActiveFilters ? "/found-items" : null}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 md:gap-6">
                {filteredClaims.map((claim) => (
                  <ClaimCard
                    key={`claim-${claim.id}`}
                    claim={claim}
                    relatedFoundItem={foundItemsMap.get(
                      String(claim.found_item_id),
                    )}
                    onOpenProof={() =>
                      openImageModal("Claim Proof Image", claim.proof_image_url)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Item Card Component (Lost & Found)
// ==========================================
function ItemCard({ item, type, isOwner, onOpenImage }) {
  const formattedDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-mmsu-light-green/40 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Media / Thumbnail Section */}
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden border-b border-gray-100">
        {item.image_url ? (
          <>
            <img
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-102 transition duration-300 cursor-pointer"
              onClick={onOpenImage}
            />
            <button
              type="button"
              onClick={onOpenImage}
              aria-label={`View enlarged photo of ${item.title}`}
              className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition shadow-sm text-xs flex items-center gap-1 min-h-[36px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Zoom</span>
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/70 text-gray-400 p-4 text-center">
            <Package className="w-9 h-9 stroke-[1.4] opacity-50 mb-1.5 text-mmsu-green/60" />
            <span className="text-xs font-medium text-gray-400">
              No photo attached
            </span>
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-xs backdrop-blur-xs border ${
              type === "lost"
                ? "bg-rose-500/90 text-white border-rose-400/50"
                : "bg-mmsu-green/90 text-white border-green-500/50"
            }`}
          >
            {type === "lost" ? "Lost" : "Found"}
          </span>

          <div className="flex items-center gap-1.5">
            {isOwner && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-mmsu-gold text-mmsu-green shadow-xs border border-amber-300">
                You
              </span>
            )}
            <StatusBadge status={item.status} />
          </div>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h2
            title={item.title}
            className="text-base font-bold text-gray-900 group-hover:text-mmsu-green transition-colors line-clamp-1 mb-1.5"
          >
            {item.title}
          </h2>

          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {item.description || "No specific details provided."}
          </p>
        </div>

        {/* Metadata Chips */}
        <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Tag className="w-3.5 h-3.5 text-mmsu-light-green shrink-0" />
            <span className="truncate">{item.category || "General"}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate text-gray-700">
              {item.location_name || "Campus Grounds"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Reported {formattedDate}</span>
          </div>
        </div>

        {/* Card Action Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
          <Link
            to={type === "lost" ? `/items/lost/${item.id}` : `/items/found/${item.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-mmsu-green hover:bg-mmsu-light-green text-white text-xs font-semibold shadow-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-mmsu-green min-h-[40px]"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            to={`/track/${type}/${item.id}`}
            title="Track timeline status"
            className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100/80 text-gray-700 text-xs font-semibold transition min-h-[40px]"
          >
            <Activity className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Track</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Claim Card Component (My Claims)
// ==========================================
function ClaimCard({ claim, relatedFoundItem, onOpenProof }) {
  const formattedDate = claim.created_at
    ? new Date(claim.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-mmsu-light-green/40 transition-all duration-200 flex flex-col justify-between overflow-hidden p-5">
      <div className="space-y-4">
        {/* Header: Claim Status & Date */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
              <FileText className="w-4 h-4 text-mmsu-green" />
            </span>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Claim Request
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />
                {formattedDate}
              </p>
            </div>
          </div>
          <ClaimStatusBadge status={claim.status} />
        </div>

        {/* Associated Found Item Snippet */}
        <div className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/70 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0 overflow-hidden border border-gray-200">
            {relatedFoundItem?.image_url ? (
              <img
                src={relatedFoundItem.image_url}
                alt={relatedFoundItem.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="w-5 h-5 opacity-40 text-mmsu-green" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase">
              Target Item
            </p>
            <h2 className="text-xs md:text-sm font-bold text-gray-900 truncate">
              {relatedFoundItem?.title || `Found Item #${claim.found_item_id}`}
            </h2>
            {relatedFoundItem?.location_name && (
              <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                {relatedFoundItem.location_name}
              </p>
            )}
          </div>
        </div>

        {/* Proof Description Section */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Submitted Proof of Ownership
          </span>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 leading-relaxed line-clamp-3">
            {claim.proof_description || "No written proof submitted."}
          </div>
        </div>

        {/* Optional Proof Image Preview Button */}
        {claim.proof_image_url && (
          <div>
            <button
              type="button"
              onClick={onOpenProof}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-mmsu-green" />
              <span>View Submitted Proof Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center gap-2">
        <Link
          to={`/items/found/${claim.found_item_id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-mmsu-green hover:bg-mmsu-light-green text-white text-xs font-semibold shadow-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-mmsu-green min-h-[40px]"
        >
          <span>View Found Item</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to={`/track/found/${claim.found_item_id}`}
          title="Track verification progress"
          className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100/80 text-gray-700 text-xs font-semibold transition min-h-[40px]"
        >
          <Activity className="w-3.5 h-3.5 text-gray-500" />
          <span className="hidden sm:inline">Track</span>
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// Status Badge Components
// ==========================================
function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();

  if (s === "pending" || s === "lost") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs capitalize tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {status}
      </span>
    );
  }

  if (s === "claimed" || s === "approved" || s === "found") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs capitalize tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>
    );
  }

  if (s === "resolved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs capitalize tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs capitalize tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      {status || "unknown"}
    </span>
  );
}

function ClaimStatusBadge({ status }) {
  const s = (status || "").toLowerCase();

  if (s === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-200/90 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        Under Review
      </span>
    );
  }

  if (s === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Approved
      </span>
    );
  }

  if (s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/90 shadow-xs">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 shadow-xs capitalize">
      <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
      {status || "Unknown"}
    </span>
  );
}
