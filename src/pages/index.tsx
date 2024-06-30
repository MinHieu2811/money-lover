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
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

type Transaction = {
  id: string;
  category: string;
  amount: string;
  date: string;
  note: string;
};

type Props = {
  session: Session | null;
  summaryAmount: number;
  transactions: Transaction[];
};

export default function IndexPage({
  summaryAmount,
  transactions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const [hide, setHide] = useState(false);
  console.log(transactions);
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
        <div className="mt-2 mb-2 flex items-center justify-end">
          <Button variant="default">
            <Link
              href="/create-transactions"
              className="flex items-center py-3 px-2"
            >
              <PlusSquare width={16} height={16} color="white"/>
              <span className="ml-2">Create New Transaction</span>
            </Link>
          </Button>
        </div>
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
                  <TableRow
                    key={transaction?.id}
                    className={`hover:bg-gray-100 ${
                      transaction?.date === "Summary" ? "bg-gray-200" : ""
                    }`}
                  >
                    <TableCell className="font-medium px-2">
                      {transaction?.date}
                    </TableCell>
                    <TableCell className="px-2">
                      {transaction?.category}
                    </TableCell>
                    <TableCell className="text-right px-2">
                      {Number(transaction?.amount)?.toLocaleString()} VND
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

    const res = await fetch(`${baseURL}/api/google/get-transaction`, {
      method: "GET",
      headers: {
        Cookie: context.req.headers.cookie || "",
      },
    });
    const { summaryAmount, rows: transactions } = await res.json();

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
      }))
      ?.filter(
        (transaction: Transaction) =>
          transaction?.category?.toLocaleLowerCase() !== "summary"
      )?.sort((a: Transaction, b: Transaction) => {
        const dateA = new Date(a?.date);
        const dateB = new Date(b?.date);
        return dateB?.getTime() - dateA?.getTime()
      })

    const addTotalRes: Transaction[] = [
      ...(mappedTransactions || []),
      {
        id: "" + Math.random(),
        category: "",
        amount: summaryAmount,
        date: "Summary",
        note: "",
      },
    ];
    return {
      props: {
        session,
        summaryAmount: Number(summaryAmount) || 0,
        transactions: addTotalRes || [],
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
