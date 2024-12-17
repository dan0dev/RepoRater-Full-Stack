import { UrlPreviewProps } from "@/types";
import { Link2 } from "lucide-react";
import Image from "next/image";

export function UrlPreview({ preview, url }: UrlPreviewProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-b border-dotted border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
    >
      <div className="flex items-start gap-4 p-4">
        {preview.image ? (
          <div className="relative w-24 h-24">
            <Image
              src={preview.image}
              alt={preview.title}
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
            <Link2 className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">
              {preview.title}
            </h4>
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {preview.description}
          </p>
          <p className="mt-2 text-xs text-gray-400 truncate">{url}</p>
        </div>
      </div>
    </a>
  );
}
