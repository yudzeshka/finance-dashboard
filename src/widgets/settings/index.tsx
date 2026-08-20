import { useSettingsContainer } from "./container";
import { SettingsView } from "./ui";

function SettingsContainer() {
  const props = useSettingsContainer();
  return <SettingsView {...props} />;
}

export const SettingsWidget = { Widget: SettingsContainer };
