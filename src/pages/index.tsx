import { Inter } from "next/font/google";
import { StickyHeader } from "@/components/custom/StickyHeader";
import { getServerSession, NextAuthOptions, Session } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  session: Session | null;
  summaryAmount: number;
  transactions: string[][];
};

export default function IndexPage({
  summaryAmount,
  transactions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const [hide, setHide] = useState(false);
  return (
    <main className={`min-h-screen ${inter.className}`}>
      <StickyHeader
        imgAva={session?.user?.image || ""}
        email={session?.user?.email || ""}
        name={session?.user?.name || ""}
      />
      <div className="py-2 px-2">
        <Card className="px-2 py-2">
          <CardTitle className="flex items-center">
            <span
              className={`${
                !hide
                  ? Number(summaryAmount) > 0
                    ? "text-green-500"
                    : "text-red-500"
                  : ""
              }`}
            >
              {hide ? (
                <>*********</>
              ) : (
                <>{Number(summaryAmount)?.toLocaleString()} VND</>
              )}
            </span>
            <Button
              className="px-2"
              onClick={() => setHide(!hide)}
              variant="link"
            >
              {hide ? (
                <EyeIcon width={16} height={16} />
              ) : (
                <EyeOffIcon width={16} height={16} />
              )}
            </Button>
          </CardTitle>
          <CardDescription>Your total balance</CardDescription>
        </Card>
      </div>
    </main>
  );
}

export const getServerSideProps = (async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions as NextAuthOptions
  );
  try {
    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const baseURL =
      process?.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://money-lover-omega.vercel.app";

    const res = await fetch(`${baseURL}/api/google/get-transaction`, {
      method: "GET",
      headers: {
        Cookie: context.req.headers.cookie || "",
      },
    });
    const { summaryAmount, rows: transactions } = await res.json();
    return {
      props: {
        session,
        summaryAmount: summaryAmount || 0,
        transactions: transactions || [],
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        session,
        summaryAmount: 0,
        transactions: [],
      },
    };
  }
}) satisfies GetServerSideProps<Props>;
