import { getServerSession, NextAuthOptions } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import { MemoPieChart } from "@/components/custom/CustomPieChart";

type Budget = {
    id?: string,
    category?: string,
    budget?: number,
    spent?: number
}

type MyBudgetProps = {
  listBudget: Budget[]
  totalSpent: number
  totalBudget: number
}

const MyBudget = ({totalBudget, totalSpent}: MyBudgetProps) => {
  return (
    <MemoPieChart totalBudget={totalBudget} totalSpent={totalSpent} />
  )
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
      `${baseURL}/api/google/budget/get`,
      {
        method: "GET",
        headers: {
          Cookie: context.req.headers.cookie || "",
        },
      }
    );

    const { budgetRes } = await recentTransaction?.json();

    const total = budgetRes?.reduce((acc: {totalSpent: number, totalBudget: number}, curr: Budget) => {
      return {
        totalSpent: acc.totalSpent + Number(curr?.spent || "0"),
        totalBudget: acc.totalBudget + Number(curr.budget || "0")
      }
    }, {
      totalSpent: 0,
      totalBudget: 0
    })

    return {
      props: {
        session,
        listBudget: budgetRes || [],
        totalSpent: total?.totalSpent || 0,
        totalBudget: total?.totalBudget || 0
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        session,
        listBudget: [],
        totalBudget: 0,
        totalSpent: 0
      },
    };
  }
}) satisfies GetServerSideProps<MyBudgetProps>;


export default MyBudget