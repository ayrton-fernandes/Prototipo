"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { userService } from "@/services/userService";
import { UserListItem } from "@/domain/types/userManagement";

export function useUsersList() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [profileDescriptionByCode, setProfileDescriptionByCode] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResponse, profilesResponse] = await Promise.all([
        userService.findAll(),
        userService.findAllProfiles(),
      ]);

      setUsers(usersResponse.data);

      const nextMap = profilesResponse.data.reduce<Record<string, string>>((acc, profile) => {
        acc[profile.codeName] = profile.descName;
        return acc;
      }, {});
      setProfileDescriptionByCode(nextMap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
    });
  }, [users, search]);

  return {
    users,
    filteredUsers,
    loading,
    search,
    setSearch,
    profileDescriptionByCode,
    refetch: fetchUsers,
  };
}
