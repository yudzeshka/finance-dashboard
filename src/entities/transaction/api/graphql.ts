import { gql } from "@apollo/client";

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
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
    $amount: Float!
    $description: String
    $category: String
    $date: String
    $type: TransactionType!
  ) {
    addTransaction(
      amount: $amount
      description: $description
      category: $category
      date: $date
      type: $type
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
    $id: ID!
    $amount: Float!
    $type: TransactionType!
    $category: String
    $date: String
    $description: String
  ) {
    editTransaction(
      id: $id
      amount: $amount
      type: $type
      category: $category
      date: $date
      description: $description
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
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id) {
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

