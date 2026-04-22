"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BaseResponseDTO } from "@/domain/types/base";
import { domainStationService } from "@/services/domainStationService";

export function useStationsList() {
  const [stations, setStations] = useState<BaseResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await domainStationService.findAll();
      setStations(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const filteredStations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return stations;

    return stations.filter((station) => {
      return (
        station.descName.toLowerCase().includes(term) ||
        station.codeName.toLowerCase().includes(term)
      );
    });
  }, [stations, search]);

  return {
    stations,
    filteredStations,
    loading,
    search,
    setSearch,
    refetch: fetchStations,
  };
}
