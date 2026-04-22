import api from "@/services/api/api";
import {
  FieldValueMediaResponse,
  FieldValueMediaUploadPayload,
  FieldValuePayload,
  FieldValueResponse,
  FieldValueUpdatePayload,
} from "@/domain/types/fieldValue";

const baseUrl = "/operations";
const MEDIA_ROUTE_REGEX = /\/operations\/\d+\/targets\/\d+\/info-entries\/\d+\/field-values\/\d+\/media(?:\?.*)?$/i;

type FieldValueRequestPayload = {
  templateFieldId?: number;
  customFieldId?: number;
  groupInstanceId?: string;
  valueContent: string;
};

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    try {
      return new URL(value, "http://localhost");
    } catch {
      return null;
    }
  }
};

const getApiBasePath = (): string => {
  const rawBaseUrl = api.defaults.baseURL;

  if (!rawBaseUrl || rawBaseUrl.trim().length === 0) {
    return "";
  }

  const parsedBaseUrl = parseUrl(rawBaseUrl.trim());

  if (!parsedBaseUrl) {
    return "";
  }

  const normalizedPath = parsedBaseUrl.pathname.replace(/\/$/, "");
  return normalizedPath === "/" ? "" : normalizedPath;
};

const stripApiBasePath = (pathValue: string): string => {
  const normalizedPath = pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
  const apiBasePath = getApiBasePath();

  if (apiBasePath && normalizedPath.startsWith(`${apiBasePath}/`)) {
    return normalizedPath.slice(apiBasePath.length);
  }

  if (apiBasePath && normalizedPath === apiBasePath) {
    return "/";
  }

  if (normalizedPath.startsWith("/api/")) {
    return normalizedPath.slice(4);
  }

  if (normalizedPath === "/api") {
    return "/";
  }

  return normalizedPath;
};

const toMediaApiPath = (mediaUrl: string): string => {
  const normalizedMediaUrl = mediaUrl.trim();

  if (!normalizedMediaUrl) {
    return "";
  }

  const parsedMediaUrl = parseUrl(normalizedMediaUrl);
  const pathWithQuery = parsedMediaUrl
    ? `${parsedMediaUrl.pathname}${parsedMediaUrl.search}`
    : normalizedMediaUrl;

  return stripApiBasePath(pathWithQuery);
};

const toMediaPublicUrl = (mediaUrl: string): string => {
  const normalizedMediaUrl = mediaUrl.trim();

  if (!normalizedMediaUrl) {
    return "";
  }

  const normalizedLower = normalizedMediaUrl.toLowerCase();

  if (
    normalizedLower.startsWith("data:") ||
    normalizedLower.startsWith("blob:") ||
    normalizedLower.startsWith("http://") ||
    normalizedLower.startsWith("https://")
  ) {
    return normalizedMediaUrl;
  }

  if (!normalizedMediaUrl.startsWith("/")) {
    return normalizedMediaUrl;
  }

  const rawBaseUrl = api.defaults.baseURL;

  if (!rawBaseUrl || rawBaseUrl.trim().length === 0) {
    return normalizedMediaUrl;
  }

  const parsedBaseUrl = parseUrl(rawBaseUrl.trim());

  if (!parsedBaseUrl) {
    return normalizedMediaUrl;
  }

  return `${parsedBaseUrl.origin}${normalizedMediaUrl}`;
};

const buildMediaUploadFormData = (payload: FieldValueMediaUploadPayload): FormData => {
  const referencePayload = buildFieldReferencePayload(payload.templateFieldId, payload.customFieldId);
  const formData = new FormData();
  formData.append("file", payload.file);

  if (referencePayload.templateFieldId != null) {
    formData.append("templateFieldId", String(referencePayload.templateFieldId));
  }

  if (referencePayload.customFieldId != null) {
    formData.append("customFieldId", String(referencePayload.customFieldId));
  }

  const normalizedGroupInstanceId = normalizeNullableString(payload.groupInstanceId);

  if (normalizedGroupInstanceId) {
    formData.append("groupInstanceId", normalizedGroupInstanceId);
  }

  return formData;
};

const normalizeNullableString = (value: string | null | undefined): string | undefined => {
  if (value == null) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const buildFieldReferencePayload = (templateFieldId: number | null | undefined, customFieldId: number | null | undefined) => {
  const hasTemplateField = templateFieldId != null;
  const hasCustomField = customFieldId != null;

  if (hasTemplateField === hasCustomField) {
    throw new Error("Payload inválido: informe apenas templateFieldId ou customFieldId.");
  }

  if (hasTemplateField) {
    return { templateFieldId: Number(templateFieldId), customFieldId: undefined };
  }

  return { templateFieldId: undefined, customFieldId: Number(customFieldId) };
};

const buildFieldValueRequestPayload = (payload: FieldValuePayload | FieldValueUpdatePayload): FieldValueRequestPayload => {
  const referencePayload = buildFieldReferencePayload(payload.templateFieldId, payload.customFieldId);

  return {
    ...referencePayload,
    groupInstanceId: normalizeNullableString(payload.groupInstanceId),
    valueContent: payload.valueContent,
  };
};

export const fieldValueService = {
  create(operationId: number, targetId: number, entryId: number, payload: FieldValuePayload) {
    return api.post<void>(
      `${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values`,
      buildFieldValueRequestPayload(payload)
    );
  },

  findAll(operationId: number, targetId: number, entryId: number) {
    return api.get<FieldValueResponse[]>(`${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values`);
  },

  update(operationId: number, targetId: number, entryId: number, fieldValueId: number, payload: FieldValueUpdatePayload) {
    return api.patch<void>(
      `${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values/${fieldValueId}`,
      buildFieldValueRequestPayload(payload)
    );
  },

  delete(operationId: number, targetId: number, entryId: number, fieldValueId: number) {
    return api.delete<void>(`${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values/${fieldValueId}`);
  },

  uploadMedia(operationId: number, targetId: number, entryId: number, payload: FieldValueMediaUploadPayload) {
    const formData = buildMediaUploadFormData(payload);

    return api.post<FieldValueMediaResponse>(
      `${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values/media`,
      formData
    );
  },

  replaceMedia(operationId: number, targetId: number, entryId: number, fieldValueId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return api.patch<FieldValueMediaResponse>(
      `${baseUrl}/${operationId}/targets/${targetId}/info-entries/${entryId}/field-values/${fieldValueId}/media`,
      formData
    );
  },

  readMedia(mediaUrl: string) {
    const mediaPath = toMediaApiPath(mediaUrl);

    if (!mediaPath || !MEDIA_ROUTE_REGEX.test(mediaPath)) {
      throw new Error("Rota de mídia inválida para leitura autenticada.");
    }

    return api.get<Blob>(mediaPath, { responseType: "blob" });
  },

  isMediaUrl(mediaUrl: string) {
    const mediaPath = toMediaApiPath(mediaUrl);
    return MEDIA_ROUTE_REGEX.test(mediaPath);
  },

  resolveMediaUrl(mediaUrl: string) {
    return toMediaPublicUrl(mediaUrl);
  },
};
