import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  return (
    <div className="container h-screen flex justify-center items-center">
      <Card className="m-auto w-80">
      <CardHeader>
        <Image src="/salary.png" alt="Logo" width={100} height={100} className="m-auto"/>
        <CardTitle className="mt-2 mb-2 text-center">Welcome back!</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => signIn("google", {
          callbackUrl: `${window?.location?.origin}/`
        })} className="w-full">
          <Image src="/search.png" alt="Google icon" width={20} height={20} />
          <span className="ml-2">Sign in with Google</span>
        </Button>
      </CardContent>
    </Card>
    </div>
  );
};

export default LoginPage;
