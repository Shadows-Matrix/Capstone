import { userRepository } from "@/repositories/user.repository";

export const userService = {
  getProfile(userId: string) {
    return userRepository.findById(userId);
  },

  // NOTE: account creation lives in otpService.completeSignup so that a
  // user row is only ever created after the email OTP is verified.
};