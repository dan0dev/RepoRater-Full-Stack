"use client";

import { UrlPreviewType } from "@/types";
import { StarIcon } from "@heroicons/react/24/solid";

import { client } from "@/sanity/lib/client";
import { CARDS_QUERY } from "@/sanity/lib/queries";
import { Card } from "@/types";
import { useEffect, useState } from "react";
import { UrlPreview } from "./UrlPreview";

export default function RepoCard() {
  const [cardData, setCardData] = useState<Card[]>([]);
  const [previews, setPreviews] = useState<(UrlPreviewType | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCardData() {
      setIsLoading(true);
      try {
        const data: Card[] = await client.fetch(CARDS_QUERY);
        setCardData(data);

        const metadataPromises = data.map(async (card) => {
          const response = await fetch(
            `/api/og?url=${encodeURIComponent(card.url)}`
          );
          return response.json();
        });

        const results = await Promise.all(metadataPromises);
        setPreviews(results);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      })
      .replace(",", "");
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden p-4">
      <div className="w-full h-36 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-lg" />
      <div className="flex items-center mt-4 space-x-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 animate-pulse rounded-md" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="w-full h-4 bg-gray-200 animate-pulse rounded-md" />
        <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded-md" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 bg-gray-200 animate-pulse rounded-full"
            />
          ))}
        </div>
        <div className="w-16 h-4 bg-gray-200 animate-pulse rounded-md" />
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? [...Array(cardData.length)].map((_, index) => (
              <div
                key={index}
                className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 overflow-hidden rounded-3xl bg-white shadow-md border border-gray-200"
              >
                <SkeletonCard />
              </div>
            ))
          : cardData.map((card, index) => (
              <div
                key={card.url}
                className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 overflow-hidden rounded-3xl bg-white shadow-md border border-gray-200 opacity-0 animate-fade-in"
              >
                {previews[index] ? (
                  <div>
                    <div className="w-full">
                      <UrlPreview preview={previews[index]!} url={card.url} />
                    </div>
                    <div className="flex items-center p-4">
                      <img
                        src={
                          card.user?.image || "https://i.imgur.com/Xwl9rpU.png"
                        }
                        alt={card.user?.name || "Anonymous"}
                        className="w-12 h-12 rounded-full ring-2 ring-gray-300 shadow-sm"
                      />
                      <div className="ml-3">
                        <h1 className="text-lg font-semibold text-gray-800">
                          {card.user?.name || "Anonymous"}
                        </h1>
                        <p className="text-sm text-gray-500">
                          {card.user?.username
                            ? `@${card.user.username}`
                            : "Anonymous"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 px-4 pb-2">
                      {card.description}
                    </p>
                    <div className="flex items-center justify-between px-4 py-2 mb-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-6 h-6 ${
                              i < card.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {card.rating}/5
                      </span>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <span className="text-sm text-gray-500">
                        {formatDate(card.postedAt)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <SkeletonCard />
                )}
              </div>
            ))}
      </div>
    </div>
  );
}
