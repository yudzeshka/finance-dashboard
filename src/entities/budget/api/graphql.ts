import { gql } from "@apollo/client";

export const GET_BUDGETS = gql`
  query GetBudgets {
    budgets {
      id
      category_id
      limit_usd
      category {
        id
        name
        icon
        type
      }
    }
  }
`;

export const INSERT_BUDGET_ONE = gql`
  mutation InsertBudgetOne($categoryId: uuid!, $limitUsd: numeric!) {
    insert_budgets_one(
      object: { category_id: $categoryId, limit_usd: $limitUsd }
    ) {
      id
      category_id
      limit_usd
      category {
        id
        name
        icon
        type
      }
    }
  }
`;

export const UPDATE_BUDGET_BY_PK = gql`
  mutation UpdateBudgetByPk($id: uuid!, $limitUsd: numeric!) {
    update_budgets_by_pk(
      pk_columns: { id: $id }
      _set: { limit_usd: $limitUsd }
    ) {
      id
      category_id
      limit_usd
      category {
        id
        name
        icon
        type
      }
    }
  }
`;

export const DELETE_BUDGET_BY_PK = gql`
  mutation DeleteBudgetByPk($id: uuid!) {
    delete_budgets_by_pk(id: $id) {
      id
    }
  }
`;
