import { useEffect, useMemo, useState } from "react";
import i18n from "i18next";

import type { UIPropertyType } from "../ui";

export const useContainer = (): UIPropertyType => {
  const [lang, setLang] = useState(
    () => i18n.resolvedLanguage ?? i18n.language,
  );

  useEffect(() => {
    const handler = (next: string) => setLang(next);
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  const options = useMemo(
    () => [
      { value: "en", label: "English" },
      { value: "ru", label: "Русский" },
    ],
    [],
  );

  const onChange = (code: string) => {
    setLang(code);
    void i18n.changeLanguage(code);
  };

  return { value: lang, options, onChange };
};
