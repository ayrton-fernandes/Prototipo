"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BaseResponseDTO } from "@/domain/types/base";
import { domainDepartmentService } from "@/services/domainDepartmentService";

export function useDepartmentsList() {
  const [departments, setDepartments] = useState<BaseResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await domainDepartmentService.findAll();
      setDepartments(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filteredDepartments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return departments;

    return departments.filter((department) => {
      return (
        department.descName.toLowerCase().includes(term) ||
        department.codeName.toLowerCase().includes(term)
      );
    });
  }, [departments, search]);

  return {
    departments,
    filteredDepartments,
    loading,
    search,
    setSearch,
    refetch: fetchDepartments,
  };
}
