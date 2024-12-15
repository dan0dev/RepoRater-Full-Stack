"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UrlPreviewType } from "@/types";
import { StarIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@nextui-org/tooltip";

import { useEffect, useState } from "react";
import { UrlPreview } from "./UrlPreview";

const CardData = [
  {
    url: "https://github.com/shadcn/ui",
    avatarSrc: "https://github.com/shadcn.png",
    userName: "shadcn",
    description:
      "I think this repo is amazing! You should definitely check it out. Big rep++ 🚀",
    rating: 5,
    timestamp: "Dec 14, 2024",
    exactTime: "Dec 14, 2024 01:28 PM",
  },
  {
    url: "https://github.com/vercel/next.js",
    avatarSrc: "https://github.com/vercel.png",
    userName: "vercel",
    description:
      "The Next.js framework is revolutionary! Get started with it today.",
    rating: 5,
    timestamp: "Dec 13, 2024",
    exactTime: "Dec 13, 2024 05:34 AM",
  },
  {
    url: "https://github.com/tailwindlabs/tailwindcss",
    avatarSrc: "https://github.com/tailwindlabs.png",
    userName: "tailwindlabs",
    description:
      "Tailwind CSS is the best utility-first CSS framework for modern web development.",
    rating: 4,
    timestamp: "Dec 09, 2024",
    exactTime: "Dec 09, 2024 8:56 PM",
  },
];

export default function RepoCard() {
  const [previews, setPreviews] = useState<(UrlPreviewType | null)[]>([
    null,
    null,
    null,
  ]);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const metadataPromises = CardData.map(async (card) => {
          const response = await fetch(
            `/api/og?url=${encodeURIComponent(card.url)}`
          );
          return response.json();
        });

        const results = await Promise.all(metadataPromises);
        setPreviews(results);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    }

    fetchMetadata();
  }, []);

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Skeleton Preview */}
      <div className="w-full h-32 bg-gray-200 animate-pulse" />

      {/* Skeleton Header with Avatar */}
      <div className="flex items-center space-x-4 p-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-24 h-6 bg-gray-200 animate-pulse" />
      </div>

      {/* Skeleton Description */}
      <div className="px-4 pb-2">
        <div className="w-full h-4 bg-gray-200 animate-pulse mb-2" />
        <div className="w-3/4 h-4 bg-gray-200 animate-pulse" />
      </div>

      {/* Skeleton Star Rating */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-6 h-6 bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="w-16 h-4 bg-gray-200 animate-pulse" />
      </div>

      {/* Skeleton Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="w-32 h-3 bg-gray-200 animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CardData.map((card, index) => (
          <div
            key={card.url}
            className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1.5 overflow-hidden rounded-2xl"
          >
            {previews[index] ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                <div className="w-full">
                  <UrlPreview preview={previews[index]!} url={card.url} />
                </div>
                {/* Header with Avatar */}
                <div className="flex items-center space-x-4 p-4">
                  <Avatar className="w-12 h-12 shadow-sm">
                    <AvatarImage src={card.avatarSrc} />
                    <AvatarFallback>
                      {card.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-800">
                      <a
                        href={`https://github.com/${card.userName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {card.userName}
                      </a>
                    </h1>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 px-4 pb-2 leading-relaxed">
                  {card.description}
                </p>

                {/* Star Rating */}
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-6 h-6 ${
                          i < card.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{card.rating}/5</span>
                </div>

                {/* Footer with Timestamp */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                  <Tooltip
                    closeDelay={50}
                    showArrow
                    classNames={{
                      base: [
                        // arrow color
                        "before:bg-neutral-400 dark:before:bg-white",
                      ],
                      content: [
                        "py-2 px-4 shadow-xl",
                        "text-black bg-white from-white to-neutral-400",
                      ],
                    }}
                    content={card.exactTime}
                    placement="right"
                  >
                    <span className="text-xs text-gray-400">
                      Posted on {card.timestamp}
                    </span>
                  </Tooltip>
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
