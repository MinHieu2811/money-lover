import { getServerSession, NextAuthOptions } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import { MemoPieChart } from "@/components/custom/CustomPieChart";
import { useSession } from "next-auth/react";
import { Inter } from "next/font/google";
import { StickyHeader } from "@/components/custom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { addMonths, differenceInCalendarDays, startOfMonth } from "date-fns";

type Budget = {
  id?: string;
  category?: string;
  budget?: number;
  spent?: number;
};

type MyBudgetProps = {
  listBudget: Budget[];
  totalSpent: number;
  totalBudget: number;
};

const inter = Inter({ subsets: ["latin"] });

const MyBudget = ({ totalBudget, totalSpent }: MyBudgetProps) => {
  const { data: session } = useSession();
  return (
    <main className={`min-h-screen ${inter.className}`}>
      <StickyHeader
        imgAva={session?.user?.image || ""}
        email={session?.user?.email || ""}
        name={session?.user?.name || ""}
      />
      <div className="py-2 px-2">
        <Card className="">
          <CardHeader>
            <CardTitle className="text-2xl mb-1 text-center">
              My Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemoPieChart totalBudget={totalBudget} totalSpent={totalSpent} />
          </CardContent>
          <CardDescription>
            <div className="flex items-center flex-col">
              <Separator />
              <div className="flex flex-col items-center py-2">
                <div className="text-lg">
                  {Number(totalBudget)?.toLocaleString()} VND
                </div>
                <div className="text-lg">Total Budget</div>
              </div>
              <Separator />
              <div className="flex flex-col items-center py-2">
                <div className="text-lg">
                  {Number(totalSpent)?.toLocaleString()} VND
                </div>
                <div className="text-lg">Total Spent</div>
              </div>
              <Separator />
              <div className="flex flex-col items-center py-2">
                <div className="text-lg">
                  {differenceInCalendarDays(
                    startOfMonth(addMonths(new Date(), 1)),
                    new Date()
                  )}
                </div>
                <div className="text-lg">days left</div>
              </div>
            </div>
          </CardDescription>
        </Card>
      </div>
    </main>
  );
};

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

    const recentTransaction = await fetch(`${baseURL}/api/google/budget/get`, {
      method: "GET",
      headers: {
        Cookie: context.req.headers.cookie || "",
      },
    });

    const { budgetRes } = await recentTransaction?.json();

    const total = budgetRes?.reduce(
      (acc: { totalSpent: number; totalBudget: number }, curr: Budget) => {
        return {
          totalSpent: acc.totalSpent + Number(curr?.spent || "0"),
          totalBudget: acc.totalBudget + Number(curr.budget || "0"),
        };
      },
      {
        totalSpent: 0,
        totalBudget: 0,
      }
    );

    return {
      props: {
        session,
        listBudget: budgetRes || [],
        totalSpent: total?.totalSpent || 0,
        totalBudget: total?.totalBudget || 0,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        session,
        listBudget: [],
        totalBudget: 0,
        totalSpent: 0,
      },
    };
  }
}) satisfies GetServerSideProps<MyBudgetProps>;

export default MyBudget;
