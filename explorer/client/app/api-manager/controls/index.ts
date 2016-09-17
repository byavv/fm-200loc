import { ToggleGroup } from './toggleGroup';
import { DynamicForm2 } from './dynamicForm2';
import { OptionInput } from './optionInput';
import { PluginSettings } from './pluginSettingsForm';

export * from './toggleGroup';
export * from './pluginSettingsForm';
export * from './dynamicForm2';

export var API_MANAGER_CONTROLS = [
    ToggleGroup, OptionInput, DynamicForm2, PluginSettings
];