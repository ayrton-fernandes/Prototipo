import { DomainProfile } from "@/domain/types/userManagement";
import api from "./api/api";

const baseUrl = "/profiles";


export const domainProfileService = {

  findAll() {
    return api.get<DomainProfile[]>(`${baseUrl}`);
  }
};