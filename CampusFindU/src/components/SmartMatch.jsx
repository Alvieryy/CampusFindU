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
        const response = await axios.get(
          `https://campusfindu-backend.onrender.com${endpoint}`,
        );
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
    <section
      aria-labelledby="matching-items-heading"
      className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white"
    >
      <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <h3
            id="matching-items-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Possible matches
          </h3>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {matches.length}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-6 text-gray-500">
          Review these {type === "lost" ? "found" : "lost"} items and compare
          the details before making a claim.
        </p>
      </div>

      <ul className="divide-y divide-gray-100">
        {matches.map(({ item, score }) => (
          <li key={item.id} className="px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="break-words text-base font-semibold text-gray-900">
                  {item.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                  {item.category && (
                    <span className="break-words">{item.category}</span>
                  )}
                  <span className="inline-flex min-w-0 items-start gap-1.5">
                    <svg
                      aria-hidden="true"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 shrink-0"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span className="break-words">
                      {item.location_name || "Location not specified"}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-5">
                <span className="text-sm text-gray-500">
                  Similarity{" "}
                  <span className="ml-1 font-semibold tabular-nums text-gray-800">
                    {score}/100
                  </span>
                </span>
                <Link
                  to={`/items/${type === "lost" ? "found" : "lost"}/${item.id}`}
                  aria-label={`View details for ${item.title}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-mmsu-green transition hover:border-mmsu-green hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mmsu-green"
                >
                  View details
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500 sm:px-6">
        Similarity is based on category, description, location and report date.
        It does not confirm ownership.
      </p>
    </section>
  );
}
