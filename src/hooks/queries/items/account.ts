import api from "@/api/client";
import { changePassword, type ChangePasswordPayload } from "@/api/endpoints/account";
import { useMutation } from "@tanstack/react-query";

export function useChangePassword() {
  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(api, payload),
  });

  return {
    changePassword: mutation.mutateAsync,
    changePasswordIsPending: mutation.isPending,
  };
}
