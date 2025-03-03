import { PropertyPaneControlConfig } from "constants/PropertyControlConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import { FieldType } from "widgets/JSONFormWidget/constants";
import { HiddenFnParams, getSchemaItem, getStylesheetValue } from "../helper";

type ExtendedControlConfig = PropertyPaneControlConfig & {
  options?: {
    label: string;
    value: string;
  }[];
};

const PROPERTIES: Record<string, ExtendedControlConfig[]> = {
  general: [
    {
      propertyName: "defaultValue",
      label: "Default Selected",
      helpText: "Sets the default checked state of the field",
      controlType: "SWITCH",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      customJSControl: "JSON_FORM_COMPUTE_VALUE",
      validation: { type: ValidationTypes.BOOLEAN },
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.CHECKBOX),
      dependencies: ["schema", "sourceData"],
    },
    {
      propertyName: "alignWidget",
      helpText: "Sets the alignment of the field",
      label: "Alignment",
      controlType: "DROP_DOWN",
      options: [
        {
          label: "Left",
          value: "LEFT",
        },
        {
          label: "Right",
          value: "RIGHT",
        },
      ],
      isBindProperty: true,
      isTriggerProperty: false,
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.CHECKBOX),
      dependencies: ["schema"],
    },
  ],
  actions: [
    {
      helpText: "Triggers an action when the check state is changed",
      propertyName: "onCheckChange",
      label: "onCheckChange",
      controlType: "ACTION_SELECTOR",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.CHECKBOX),
      dependencies: ["schema"],
    },
  ],
  styles: [
    {
      propertyName: "accentColor",
      helpText: "Sets the accent color of the checkbox",
      label: "Accent Color",
      controlType: "COLOR_PICKER",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      getStylesheetValue,
      hidden: (...args: HiddenFnParams) =>
        getSchemaItem(...args).fieldTypeNotMatches(FieldType.CHECKBOX),
      dependencies: ["schema"],
    },
  ],
};

export default PROPERTIES;
