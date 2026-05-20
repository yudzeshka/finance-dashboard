import { gql } from "@apollo/client";

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions(order_by: { date: desc }) {
      id
      amount
      type
      category {
        id
        name
        icon
      }
      date
      description
    }
  }
`;

export const ADD_TRANSACTION = gql`
  mutation AddTransaction(
    $amount: numeric!
    $description: String
    $categoryId: uuid!
    $date: timestamptz!
    $type: transaction_type!
  ) {
    insert_transactions_one(
      object: {
        amount: $amount
        description: $description
        category_id: $categoryId
        date: $date
        type: $type
      }
    ) {
      id
      amount
      type
      category {
        id
        name
        icon
      }
      date
      description
    }
  }
`;

export const EDIT_TRANSACTION = gql`
  mutation EditTransaction(
    $id: uuid!
    $amount: numeric!
    $type: transaction_type!
    $categoryId: uuid!
    $date: timestamptz!
    $description: String
  ) {
    update_transactions_by_pk(
      pk_columns: { id: $id }
      _set: {
        amount: $amount
        type: $type
        category_id: $categoryId
        date: $date
        description: $description
      }
    ) {
      id
      amount
      type
      category {
        id
        name
        icon
      }
      date
      description
    }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: uuid!) {
    delete_transactions_by_pk(id: $id) {
      id
      amount
      type
      category {
        id
        name
        icon
      }
    }
  }
`;

