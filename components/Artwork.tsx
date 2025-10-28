import React, { useState, useEffect } from "react";
import { AgeBucket } from "../lib/bible/types";
import { badgeText } from "./AgeToggle";

export default function Artwork({
  title,
  age,
  alt = "Story artwork",
}: {
  title: string;
  age: AgeBucket;
  alt?: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateImage = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/art', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            age,
          }),
        });

        const data = await response.json();
        if (!data.placeholder) {
          // If we have a real image URL, set it
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setLoading(false);
      }
    };

    generateImage();
  }, [title, age]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl h-64 w-full bg-gradient-to-br from-purple-100 via-violet-100 to-purple-200 flex items-center justify-center">
        <div className="text-purple-900/70">Generating artwork...</div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white">
        <img src={imageUrl} alt={alt} className="w-full h-64 object-cover" />
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