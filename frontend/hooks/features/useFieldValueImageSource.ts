"use client";

import { useEffect, useState } from "react";
import { fieldValueService } from "@/services/fieldValueService";

export const useFieldValueImageSource = (source: string): string => {
  const [resolvedSource, setResolvedSource] = useState("");

  useEffect(() => {
    const normalizedSource = source.trim();

    if (!normalizedSource) {
      setResolvedSource("");
      return;
    }

    if (!fieldValueService.isMediaUrl(normalizedSource)) {
      setResolvedSource(fieldValueService.resolveMediaUrl(normalizedSource));
      return;
    }

    setResolvedSource("");

    let isActive = true;
    let generatedObjectUrl: string | null = null;

    const readProtectedImage = async () => {
      try {
        const response = await fieldValueService.readMedia(normalizedSource);
        generatedObjectUrl = URL.createObjectURL(response.data);

        if (!isActive) {
          URL.revokeObjectURL(generatedObjectUrl);
          return;
        }

        setResolvedSource(generatedObjectUrl);
      } catch {
        if (isActive) {
          setResolvedSource(fieldValueService.resolveMediaUrl(normalizedSource));
        }
      }
    };

    void readProtectedImage();

    return () => {
      isActive = false;

      if (generatedObjectUrl) {
        URL.revokeObjectURL(generatedObjectUrl);
      }
    };
  }, [source]);

  return resolvedSource;
};
