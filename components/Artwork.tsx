import React from "react";
import { AgeBucket, badgeText } from "./AgeToggle";

export default function Artwork({
  title,
  age,
  src,
  alt = "Story artwork",
}: {
  title: string;
  age: AgeBucket;
  src?: string | null;
  alt?: string;
}) {
  // If you later add real images, pass src; this graceful fallback keeps layout pretty.
  if (src) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white">
        <img src={src} alt={alt} className="w-full h-64 object-cover" />
        <span className="absolute top-2 left-2 text-xs font-medium bg-purple-600 text-white rounded-full px-2 py-0.5">
          {badgeText(age)}
        </span>
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden rounded-2xl h-64 w-full bg-gradient-to-br from-purple-100 via-violet-100 to-purple-200 flex items-center">
      <div className="absolute top-2 left-2 text-xs font-medium bg-purple-600 text-white rounded-full px-2 py-0.5">
        {badgeText(age)}
      </div>
      <div className="pl-6">
        <div className="text-purple-900/70 text-sm">Story artwork</div>
        <h3 className="text-2xl font-semibold text-purple-900">{title}</h3>
        <p className="max-w-lg text-purple-800/80 mt-1">
          A soft, kid-friendly illustration will appear here. (Using fallback while image generation is off.)
        </p>
      </div>
    </div>
  );
}