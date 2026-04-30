type ProfileLike = {
	codeName?: string | null;
	descName?: string | null;
};

type UserProfileSource = {
	profiles?: ProfileLike[];
	profileCodes?: Array<string | null | undefined>;
	role?: string | null;
};

const normalizeProfileCode = (value: string): string => value.trim().toUpperCase();

export const getUserProfileCodes = (user: UserProfileSource | null | undefined): string[] => {
	if (!user) {
		return [];
	}

	const profileCodes = [
		...(user.profileCodes ?? []),
		...(user.profiles ?? []).map((profile) => profile.codeName ?? profile.descName ?? ""),
		user.role ?? "",
	];

	return Array.from(
		new Set(
			profileCodes
				.map((code) => (typeof code === "string" ? code : String(code)))
				.map(normalizeProfileCode)
				.filter(Boolean)
		)
	);
};

export const hasAnyProfile = (user: UserProfileSource | null | undefined, profileCodes: string[]): boolean => {
	const normalizedUserProfiles = getUserProfileCodes(user);

	return profileCodes
		.map(normalizeProfileCode)
		.some((profileCode) => normalizedUserProfiles.includes(profileCode));
};
