import { useSession } from "next-auth/react";
import { useEffect } from "react";

type AuthenWrapperProps = {
  children: React.ReactNode;
};

export const AuthenWrapper = ({ children }: AuthenWrapperProps) => {
  const {data: session} = useSession();
  useEffect(() => {
    if (!session && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [session]);
  return <>{children}</>;
};
