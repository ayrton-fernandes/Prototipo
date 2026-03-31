export interface BaseResponseDTO {
    id: number;
    descName: string;
    codeName: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BaseCreateDTO {
    descName: string;
}

export interface BaseUpdateDTO {
    descName?: string;
}
