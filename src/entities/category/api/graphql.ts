import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories(order_by: { name: asc }) {
      id
      name
      icon
    }
  }
`;

