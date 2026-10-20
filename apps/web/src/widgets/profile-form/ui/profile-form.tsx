import type { JSX } from "react";

import { ProfileFormChoice } from "./profile-form-choice";
import { ProfileFormFieldset } from "./profile-form-fieldset";
import { ProfileFormGeneralError } from "./profile-form-general-error";
import { ProfileFormGroup } from "./profile-form-group";
import { ProfileFormNumber } from "./profile-form-number";
import {
  ProfileFormShell,
  type ProfileFormShellProps,
} from "./profile-form-shell";
import { ProfileFormText } from "./profile-form-text";
import { ProfileFormWide } from "./profile-form-wide";

interface ProfileFormComponent {
  (props: ProfileFormShellProps): JSX.Element;
  Group: typeof ProfileFormGroup;
  Fieldset: typeof ProfileFormFieldset;
  Wide: typeof ProfileFormWide;
  GeneralError: typeof ProfileFormGeneralError;
  Text: typeof ProfileFormText;
  Number: typeof ProfileFormNumber;
  Choice: typeof ProfileFormChoice;
}

export const ProfileForm: ProfileFormComponent = Object.assign(
  ProfileFormShell,
  {
    Group: ProfileFormGroup,
    Fieldset: ProfileFormFieldset,
    Wide: ProfileFormWide,
    GeneralError: ProfileFormGeneralError,
    Text: ProfileFormText,
    Number: ProfileFormNumber,
    Choice: ProfileFormChoice,
  },
);
