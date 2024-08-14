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
import { SeparatorVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRouter } from "next/router";

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

const MyBudget = ({ totalBudget, totalSpent, listBudget }: MyBudgetProps) => {
  const { data: session } = useSession();
  const router = useRouter()
  return (
    <main className={`min-h-screen ${inter.className}`}>
      <StickyHeader
        imgAva={session?.user?.image || ""}
        email={session?.user?.email || ""}
        name={session?.user?.name || ""}
      />
      <div className="py-2 px-2">
        <Card className="mb-2">
          <CardContent className="mt-2">
            <div className="mb-1">
              <MemoPieChart totalBudget={totalBudget} totalSpent={totalSpent} />
            </div>
            <div className="flex justify-center items-center space-x-4">
              <div className="flex items-center mr-2">
                <div className="w-3 bg-[#2563eb] h-3 mr-2"></div>
                <p>Total spent</p>
              </div>
              <Separator orientation="vertical" />
              <div className="flex items-center ml-2">
                <div className="w-3 bg-[#d6d2d2] h-3 mr-2"></div>
                <p>Total spent</p>
              </div>
            </div>
            <CardDescription>
              <div className="flex items-center justify-evenly">
                <div className="flex flex-col items-center py-2">
                  <div className="text-lg">
                    {Number(totalBudget)?.toLocaleString()} VND
                  </div>
                  <div className="text-sm">Total Budget</div>
                </div>
                <Separator className="h-full w-1" orientation="vertical" />
                <div className="flex flex-col items-center py-2">
                  <div className="text-lg">
                    {Number(totalSpent)?.toLocaleString()} VND
                  </div>
                  <div className="text-sm">Total Spent</div>
                </div>
                <Separator className="h-full w-1" orientation="vertical" />
                <div className="flex flex-col items-center py-2">
                  <div className="text-lg">
                    {differenceInCalendarDays(
                      startOfMonth(addMonths(new Date(), 1)),
                      new Date()
                    )}
                  </div>
                  <div className="text-sm">days left</div>
                </div>
              </div>
            </CardDescription>
            <Button size="lg" className="w-full mt-2" onClick={() => router?.push('/budget/create-budget')}>
              Add new budget
            </Button>
          </CardContent>
        </Card>
        {listBudget?.length > 0 &&
          listBudget?.map((item, index) => (
            <Card key={index} className="mb-2 px-2 pt-1 pb-5">
              <CardHeader className="py-2 px-1">
                <div className="flex items-center justify-between">
                  <div className="text-base">{item?.category}</div>
                  <div className="flex flex-col items-end">
                    <div className="mb-2">
                      {Number(item?.budget)?.toLocaleString()} VND
                    </div>
                    <div className="text-sm">
                      Remain:{" "}
                      {(
                        Number(item?.budget) - Number(item?.spent)
                      )?.toLocaleString()}{" "}
                      VND
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardDescription>
                <Slider
                  defaultValue={[
                    (Number(item?.spent) / Number(item?.budget)) * 100,
                  ]}
                  max={100}
                  disabled
                  step={1}
                />
              </CardDescription>
            </Card>
          ))}
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
