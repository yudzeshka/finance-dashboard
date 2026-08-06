import { useState } from "react";
import { Tabs, Select, Input, Button, Alert, Modal, Typography } from "antd";
import type { TabsProps } from "antd";
import { DownloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { Language, Currency } from "@/entities/settings";

export interface SettingsContainerProps {
  language: Language;
  currency: Currency;
  onLanguageChange: (lang: Language) => void;
  onCurrencyChange: (curr: Currency) => void;
  resettingPassword: boolean;
  passwordError: string | null;
  onResetPassword: (newPassword: string, confirmPassword: string) => void;
  exporting: boolean;
  clearing: boolean;
  onExportCsv: () => void;
  onClearAllData: () => void;
  t: (key: string) => string;
}

const languageOptions: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

const currencyOptions: { value: Currency; label: string }[] = [
  { value: "USD", label: "$ USD" },
  { value: "RUB", label: "₽ RUB" },
  { value: "EUR", label: "€ EUR" },
  { value: "BYN", label: "Br BYN" },
];

export function SettingsView(props: SettingsContainerProps) {
  const {
    language,
    currency,
    onLanguageChange,
    onCurrencyChange,
    resettingPassword,
    passwordError,
    onResetPassword,
    exporting,
    clearing,
    onExportCsv,
    onClearAllData,
    t,
  } = props;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleResetPassword = async () => {
    try {
      await onResetPassword(newPassword, confirmPassword);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // hook shows toast internally
    }
  };

  const handleClearData = async () => {
    await onClearAllData();
    setConfirmOpen(false);
    setConfirmText("");
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "appearance",
      label: t("settingsAppearance"),
      children: (
        <div className="settings-tabContent">
          <div className="aurora-card">
            <div className="settings-card__section">
              <div className="settings-row">
                <Typography.Text className="settings-row__label">
                  {t("settingsLanguage")}
                </Typography.Text>
                <Select
                  value={language}
                  onChange={onLanguageChange}
                  options={languageOptions}
                  style={{ width: 200 }}
                  className="aurora-focus-ring"
                />
              </div>
              <div className="settings-row">
                <Typography.Text className="settings-row__label">
                  {t("settingsCurrency")}
                </Typography.Text>
                <Select
                  value={currency}
                  onChange={onCurrencyChange}
                  options={currencyOptions}
                  style={{ width: 200 }}
                  className="aurora-focus-ring"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "security",
      label: t("settingsSecurity"),
      children: (
        <div className="settings-tabContent">
          <div className="aurora-card">
            <div className="settings-card__section">
              <Typography.Title level={5}>
                {t("settingsChangePassword")}
              </Typography.Title>
              <div className="settings-row settings-row--stacked">
                <Typography.Text className="settings-row__label">
                  {t("settingsNewPassword")}
                </Typography.Text>
                <Input.Password
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="settings-row settings-row--stacked">
                <Typography.Text className="settings-row__label">
                  {t("settingsConfirmPassword")}
                </Typography.Text>
                <Input.Password
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              {passwordError && (
                <Alert type="error" message={passwordError} showIcon />
              )}
              <Button
                type="primary"
                loading={resettingPassword}
                onClick={handleResetPassword}
              >
                {t("settingsSave")}
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "data",
      label: t("settingsData"),
      children: (
        <div className="settings-tabContent">
          <div className="aurora-card">
            <div className="settings-card__section">
              <Typography.Title level={5}>
                {t("settingsExport")}
              </Typography.Title>
              <Typography.Text type="secondary">
                {t("settingsExportDesc")}
              </Typography.Text>
              <Button
                icon={<DownloadOutlined />}
                loading={exporting}
                onClick={onExportCsv}
              >
                {t("settingsExportCsv")}
              </Button>
            </div>
          </div>
          <div className="settings-dangerCard">
            <div className="settings-dangerCard__header">
              <ExclamationCircleOutlined className="settings-dangerCard__icon" />
              <span className="settings-dangerCard__title">
                {t("settingsClearData")}
              </span>
            </div>
            <div className="settings-dangerCard__desc">
              {t("settingsClearDataDesc")}
            </div>
            <Button
              danger
              loading={clearing}
              onClick={() => setConfirmOpen(true)}
            >
              {t("settingsClearData")}
            </Button>
          </div>
          <Modal
            open={confirmOpen}
            onCancel={() => setConfirmOpen(false)}
            title={t("settingsClearData")}
            className="settings-modal"
            okText={t("settingsClearData")}
            okButtonProps={{
              danger: true,
              disabled: confirmText !== "ОЧИСТИТЬ",
            }}
            confirmLoading={clearing}
            onOk={handleClearData}
          >
            <Typography.Text>{t("settingsClearDataConfirm")}</Typography.Text>
            <Input
              className="settings-confirmInput"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ОЧИСТИТЬ"
            />
          </Modal>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-contentInner">
      <Tabs className="settings-tabs" defaultActiveKey="appearance" items={tabItems} />
    </div>
  );
}
