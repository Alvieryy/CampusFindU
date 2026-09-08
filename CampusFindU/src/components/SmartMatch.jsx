import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function SmartMatch({ currentItem, type }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchAndCompare = async () => {
      try {
        // If viewing a LOST item, check all FOUND items.
        // If viewing a FOUND item, check all LOST items.
        const endpoint =
          type === "lost" ? "/api/found-items" : "/api/lost-items";
        const response = await axios.get(`https://campusfindu-backend.onrender.com${endpoint}`);
        const oppositeItems = response.data;

        const scoredMatches = [];

        // Run the algorithm against every item in the database
        for (const target of oppositeItems) {
          // Skip items that are already resolved/claimed
          if (target.status === "claimed" || target.status === "recovered")
            continue;

          let score = 0;
          const lost = type === "lost" ? currentItem : target;
          const found = type === "found" ? currentItem : target;

          // STEP 1: Compare Category (30%)
          if (lost.category === found.category) score += 30;

          // STEP 2: Compare Keywords (30%)
          // We break the title and description into an array of words
          const lostWords =
            (lost.title + " " + lost.description).toLowerCase().match(/\w+/g) ||
            [];
          const foundWords =
            (found.title + " " + found.description)
              .toLowerCase()
              .match(/\w+/g) || [];

          let matchCount = 0;
          lostWords.forEach((word) => {
            // Only compare words longer than 3 letters to ignore "the", "and", etc.
            if (word.length > 3 && foundWords.includes(word)) matchCount++;
          });
          if (matchCount === 1) score += 15;
          if (matchCount >= 2) score += 30;

          // STEP 3: Compare Location (25%)
          if (lost.location_name && found.location_name) {
            const locLost = lost.location_name.toLowerCase();
            const locFound = found.location_name.toLowerCase();
            // Give points if the locations are the same or share names (e.g. "Library")
            if (locLost.includes(locFound) || locFound.includes(locLost)) {
              score += 25;
            }
          }

          // STEP 4: Compare Dates (15%)
          const lostDate = new Date(lost.created_at);
          const foundDate = new Date(found.created_at);
          // Find the difference in days
          const diffDays = (foundDate - lostDate) / (1000 * 60 * 60 * 24);

          if (diffDays >= 0 && diffDays <= 7) {
            score += 15; // Found within a week of losing it!
          } else if (diffDays > 7 && diffDays <= 30) {
            score += 5; // Found within a month
          }

          // STEP 6: If score >= 70%, add it to matches!
          if (score >= 70) {
            scoredMatches.push({ item: target, score });
          }
        }

        // Sort by the highest score first
        scoredMatches.sort((a, b) => b.score - a.score);
        setMatches(scoredMatches);
      } catch (error) {
        console.error("Smart Match Error:", error);
      }
    };

    fetchAndCompare();
  }, [currentItem, type]);

  // If no matches over 70% were found, don't show the box at all
  if (matches.length === 0) return null;

  return (
    <div className="mt-10 border-2 border-purple-200 bg-purple-50 rounded-xl p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-purple-800 mb-2">
        🤖 Smart Match Suggestions
      </h3>
      <p className="text-purple-600 mb-6 font-medium">
        Our algorithm found highly probable matches based on Category, Keywords,
        Location, and Date!
      </p>

      <div className="flex flex-col gap-4">
        {matches.map((match) => (
          <div
            key={match.item.id}
            className="bg-white p-5 rounded-lg border border-purple-100 flex justify-between items-center shadow-sm"
          >
            <div>
              <p className="font-bold text-gray-800 text-lg">
                {match.item.title}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                📍 {match.item.location_name}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="block text-3xl font-black text-purple-600">
                  {match.score}%
                </span>
                <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">
                  Match
                </span>
              </div>
              <Link
                to={`/items/${type === "lost" ? "found" : "lost"}/${match.item.id}`}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
              >
                View Item
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
