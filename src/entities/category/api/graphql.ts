import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories(order_by: { name: asc }) {
      id
      name
      icon
      type
      user_id
      key
    }
  }
`;

export const INSERT_CATEGORY = gql`
  mutation InsertCategory(
    $name: String!
    $icon: String!
    $type: transaction_type!
  ) {
    insert_categories_one(object: { name: $name, icon: $icon, type: $type }) {
      id
      name
      icon
      type
      user_id
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory(
    $id: uuid!
    $name: String!
    $icon: String!
    $type: transaction_type!
  ) {
    update_categories_by_pk(
      pk_columns: { id: $id }
      _set: { name: $name, icon: $icon, type: $type }
    ) {
      id
      name
      icon
      type
      user_id
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: uuid!) {
    delete_categories_by_pk(id: $id) {
      id
    }
  }
`;
