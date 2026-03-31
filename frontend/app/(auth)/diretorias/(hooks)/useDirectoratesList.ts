"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BaseResponseDTO } from "@/domain/types/base";
import { directorateService } from "@/services/directorateService";

export function useDirectoratesList() {
  const [directorates, setDirectorates] = useState<BaseResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDirectorates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await directorateService.findAll();
      setDirectorates(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectorates();
  }, [fetchDirectorates]);

  const filteredDirectorates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return directorates;

    return directorates.filter((directorate) => {
      return (
        directorate.descName.toLowerCase().includes(term) ||
        directorate.codeName.toLowerCase().includes(term)
      );
    });
  }, [directorates, search]);

  return {
    directorates,
    filteredDirectorates,
    loading,
    search,
    setSearch,
    refetch: fetchDirectorates,
  };
}
