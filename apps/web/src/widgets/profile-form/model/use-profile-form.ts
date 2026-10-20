import { useContext } from "react";

import {
  ProfileFormContext,
  type ProfileFormContextValue,
} from "./profile-form-context";

export function useProfileForm(): ProfileFormContextValue {
  const context = useContext(ProfileFormContext);

  if (context === null) {
    throw new Error("ProfileForm components must be used within <ProfileForm>");
  }

  return context;
}
