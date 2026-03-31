import api from "@/services/api/api";
import Response from "@/domain/types/response";
import { AuthResponse } from "@/domain/types/authResponse";

type RequestOtpPayload = {
  email: string;
  password: string;
};

type VerifyOtpPayload = {
  email: string;
  otpCode: string;
};

export const authService = {
  // Backward-compatible alias used by some older flows.
  login(payload: RequestOtpPayload) {
    return this.requestOtp(payload);
  },

  requestOtp(payload: RequestOtpPayload) {
    return api.post<unknown, Response<void>>("/auth/login/request-otp", payload);
  },

  verifyOtp(payload: VerifyOtpPayload) {
    return api.post<unknown, Response<AuthResponse>>("/auth/login/verify-otp", payload);
  },
};
