"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BaseResponseDTO } from "@/domain/types/base";
import { domainCourtService } from "@/services/domainCourtService";

export function useCourtsList() {
  const [courts, setCourts] = useState<BaseResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCourts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await domainCourtService.findAll();
      setCourts(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const filteredCourts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return courts;

    return courts.filter((court) => {
      return (
        court.descName.toLowerCase().includes(term) ||
        court.codeName.toLowerCase().includes(term)
      );
    });
  }, [courts, search]);

  return {
    courts,
    filteredCourts,
    loading,
    search,
    setSearch,
    refetch: fetchCourts,
  };
}
