import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Flex, Spin } from "antd";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export default function ProtectedRoute({
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{ width: "100%", height: "100%" }}
      >
        <Spin size="large" />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  return <Outlet />;
}
