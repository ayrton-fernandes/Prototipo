"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BaseResponseDTO } from "@/domain/types/base";
import { delegateService } from "@/services/delagateService";

export function useDelegatesList() {
  const [delegates, setDelegates] = useState<BaseResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDelegates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await delegateService.findAll();
      setDelegates(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDelegates();
  }, [fetchDelegates]);

  const filteredDelegates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return delegates;

    return delegates.filter((delegate) => {
      return (
        delegate.descName.toLowerCase().includes(term) ||
        delegate.codeName.toLowerCase().includes(term)
      );
    });
  }, [delegates, search]);

  return {
    delegates,
    filteredDelegates,
    loading,
    search,
    setSearch,
    refetch: fetchDelegates,
  };
}
