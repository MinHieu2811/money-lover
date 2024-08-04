import { Inter } from "next/font/google";
import { StickyHeader } from "@/components/custom/StickyHeader";
import { getServerSession, NextAuthOptions, Session } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { EyeIcon, EyeOffIcon, PlusSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mappedDataArray } from "@/config-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { ShowBalance } from "@/components/custom/ShowBalance";
import SpentChartSection from "@/components/custom/SpentChart";

const inter = Inter({ subsets: ["latin"] });

type Transaction = {
  id: string;
  category: string;
  amount: string;
  date: string;
  note: string;
  type?: "income" | "outcome";
};

type PlainObject = {
  [key: string]: any;
};

type Props = {
  session: Session | null;
  summaryAmount: number;
  transactions: Transaction[];
  dataChart: PlainObject;
};


export default function IndexPage({
  summaryAmount,
  transactions,
  dataChart,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  return (
    <main className={`min-h-screen ${inter.className}`}>
      <StickyHeader
        imgAva={session?.user?.image || ""}
        email={session?.user?.email || ""}
        name={session?.user?.name || ""}
      />
      <div className="py-2 px-2">
        <ShowBalance summaryAmount={summaryAmount} />
        <div className="mt-2 mb-2 flex items-center justify-end">
          <Button variant="default">
            <Link
              href="/create-transactions"
              className="flex items-center py-3 px-2"
            >
              <PlusSquare width={16} height={16} />
              <span className="ml-2">Create New Transaction</span>
            </Link>
          </Button>
        </div>
        <Card className="px-2 py-2 mt-2">
          <SpentChartSection chartData={Object.values(dataChart || {})} />
        </Card>
        <Card className="px-2 py-2 mt-3">
          <CardTitle className="text-xl mb-2">Recent Transactions</CardTitle>
          <CardContent className="px-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction: Transaction) => (
                  <TableRow key={transaction?.id} className="">
                    <TableCell className="font-medium px-2">
                      {transaction?.date}
                    </TableCell>
                    <TableCell className="px-2">
                      {transaction?.category}
                    </TableCell>
                    <TableCell className="text-right px-2">
                      {Number(transaction?.amount)
                        ?.toLocaleString()
                        .replaceAll(".", ",")}{" "}
                      VND
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
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

    const recentTransaction = await fetch(
      `${baseURL}/api/google/get-recent-transaction`,
      {
        method: "GET",
        headers: {
          Cookie: context.req.headers.cookie || "",
        },
      }
    );
    const dataChartRes = await fetch(`${baseURL}/api/google/get-data-chart`, {
      method: "GET",
      headers: {
        Cookie: context.req.headers.cookie || "",
      },
    });

    const { dataChart } = await dataChartRes.json();

    const { summaryAmount, rows: transactions } =
      await recentTransaction.json();

    const mappedTransactions: Transaction[] = (transactions || [])
      ?.map((transaction: string[]) => ({
        id: transaction[mappedDataArray?.id]
          ? transaction[mappedDataArray?.id]
          : "",
        category: transaction[mappedDataArray?.category]
          ? transaction[mappedDataArray?.category]
          : "",
        amount: transaction[mappedDataArray?.amount]
          ? transaction[mappedDataArray?.amount]
          : "",
        date: transaction[mappedDataArray?.date]
          ? transaction[mappedDataArray?.date]
          : "",
        note: transaction[mappedDataArray?.note]
          ? transaction[mappedDataArray?.note]
          : "",
        type: transaction[mappedDataArray?.type],
      }))
      ?.filter(
        (transaction: Transaction) =>
          transaction?.category?.toLocaleLowerCase() !== "summary"
      )
      ?.sort((a: Transaction, b: Transaction) => {
        const dateA = new Date(a?.date);
        const dateB = new Date(b?.date);
        return dateB?.getTime() - dateA?.getTime();
      });
    return {
      props: {
        session,
        summaryAmount: Number(summaryAmount),
        transactions: mappedTransactions || [],
        dataChart: dataChart,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        session,
        summaryAmount: 0,
        transactions: [],
        dataChart: {},
      },
    };
  }
}) satisfies GetServerSideProps<Props>;
