import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: "en",
    supportedLngs: ["en", "ru"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          // here we will place our translations...
          search: "Search",
          filters: "Filters",
          clear: "Clear",
          apply: "Apply",
          selectFilters: "Select Filters",
          category: "Category",
          selectCategory: "Select Category",
          type: "Type",
          selectType: "Select Type",
          amount: "Amount",
          date: "Date",
          startDate: "Start Date",
          tillNow: "Till Now",
          income: "Income",
          expense: "Expense",
          financeDashboard: "Finance Dashboard",
          dashboard: "Dashboard",
          reports: "Reports",
          settings: "Settings",
          transactions: "Transactions",
          trackIncomeAndExpenses: "Track income and expenses",
          addTransaction: "Add transaction",
          amountIsRequired: "Amount is required",
          description: "Description",
          descriptionIsRequired: "Description is required",
          categoryIsRequired: "Category is required",
          dateIsRequired: "Date is required",
          typeIsRequired: "Type is required",
          save: "Save",
          cancel: "Cancel",
          editTransaction: "Edit transaction",
          searchDescription: "Search description",
          transactionType: "Transaction type",
          total: "Total",
          actions: "Actions",
        },
      },
      ru: {
        translation: {
          // here we will place our translations...
          search: "Поиск",
          filters: "Фильтры",
          clear: "Очистить",
          apply: "Применить",
          selectFilters: "Выбрать фильтры",
          category: "Категория",
          selectCategory: "Выбрать категорию",
          type: "Тип",
          selectType: "Выбрать тип",
          amount: "Сумма",
          date: "Дата",
          startDate: "Начальная дата",
          tillNow: "До текущей даты",
          income: "Доход",
          expense: "Расход",
          financeDashboard: "Учет финансов",
          dashboard: "Главная",
          reports: "Отчеты",
          settings: "Настройки",
          transactions: "Транзакции",
          trackIncomeAndExpenses: "Отслеживать доходы и расходы",
          addTransaction: "Добавить транзакцию",
          amountIsRequired: "Сумма обязательна",
          description: "Описание",
          descriptionIsRequired: "Описание обязательно",
          category: "Категория",
          categoryIsRequired: "Категория обязательна",
          date: "Дата",
          dateIsRequired: "Дата обязательна",
          type: "Тип",
          typeIsRequired: "Тип обязательен",
          save: "Сохранить",
          cancel: "Отменить",
          editTransaction: "Редактировать транзакцию",
          searchDescription: "Поиск описания",
          transactionType: "Тип транзакции",
          total: "Итого",
          actions: "Действия",
        },
      },
    },
  });

export default i18n;
