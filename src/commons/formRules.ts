import { FormValidationRules } from "ts-form-validation";
import { Application, Resource } from "../generated/client/src";

import strings from "../localization/strings";

/**
 * Interface for ResourceSettingsFrom.
 * Contains all fields used for resources and applications
 */
export interface ResourceSettingsForm extends Partial<Resource> {
  nameText?: string;
  title?: string;
  content?: string;
  applicationId?: string;
  applicationImage?: string;
  applicationIcon?: string;
  applicationIcons?: string;
  teaserText?: string;
  returnDelay?: string;
  bundleId?: string;
  autoplay?: boolean;
  loop?: boolean;
  slideTimeOnScreen?: string;
}

/**
 * Application form
 */
export interface ApplicationForm extends Partial<Application> {}

/**
 * Form validation rules for ApplicationForm
 */
export const applicationRules: FormValidationRules<ApplicationForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    }
  },
  validateForm: form => {
    const messages = {};

    return {
      ...form,
      messages
    };
  }
};

/**
 * Form validation rules for ResourceSettingsForm
 */
export const resourceRules: FormValidationRules<ResourceSettingsForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    orderNumber: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    slug: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    data: {
      required: false,
      trim: true
    }
  },
  validateForm: form => {
    const messages = {};
    return {
      ...form,
      messages
    };
  }
};