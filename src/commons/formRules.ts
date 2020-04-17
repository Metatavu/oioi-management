import { FormValidationRules, Form, initForm, validateForm, MessageType } from "ts-form-validation";
import { Application, ApplicationToJSON, ApplicationFromJSON, KeyValueProperty, Resource } from "../generated/client/src";

import strings from "../localization/strings";

export interface ResourceSettingsForm extends Partial<Resource> {
  nameText?: string;
  title?: string;
  content?: string;
}

export interface CombinedForm extends Partial<Application>, Partial<Resource> {
  applicationImage?: string;
  applicationIcon?: string;
  applicationIcons?: string[];
  teaserText?: string;
  returnDelay?: string;
}

export const combinedRules: FormValidationRules<CombinedForm> = {
    fields: {
      name: {
        required: true,
        trim: true,
        requiredText: strings.requiredField
      },
      order_number: {
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

export const resourceRules: FormValidationRules<ResourceSettingsForm> = {
  fields: {
    name: {
      required: true,
      trim: true,
      requiredText: strings.requiredField
    },
    order_number: {
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
    },
    nameText: {
      required: false,
      trim: true
    },
    title: {
      required: false,
      trim: true
    },
    content: {
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