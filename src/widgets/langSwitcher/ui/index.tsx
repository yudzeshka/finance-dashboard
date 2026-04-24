import { Select } from "antd";
import React, { type FC } from "react";

export type UIPropertyType = {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (code: string) => void;
};

export const UI: FC<UIPropertyType> = React.memo(
  ({ value, options, onChange }: UIPropertyType) => (
    <Select
      value={value}
      options={options}
      onChange={onChange}
      className="lang-switcher-select"
    />
  ),
);
