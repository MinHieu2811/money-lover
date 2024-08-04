import { NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { groupTransactionsByMonth } from "@/services/sheetData";
import getConfig from "next/config";
import { mappedDataArray } from "@/config-data";
import { format, parse } from "date-fns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as NextAuthOptions
    )) as Session | null;

    if (!session) {
      res.status(401);
      res.json({ error: "Unauthorized" });
      return;
    }

    const spreadsheetId = getConfig().serverRuntimeConfig.spreadsheetId || "";
    if (!spreadsheetId) {
      res.status(500);
      throw new Error("Spreadsheet ID not found");
    }

    const rows = await groupTransactionsByMonth(spreadsheetId);
    const mappedData = Object?.fromEntries(
      Object?.entries(rows)?.map(([key, value]) => {
        const valueMapped = value?.flatMap((item) => ({
          amount: item[mappedDataArray?.amount]
            ? item[mappedDataArray?.amount]
            : "",
          type: item[mappedDataArray?.type]
            ? item[mappedDataArray?.type]
            : "",
        }))
        const totalSpent = valueMapped?.reduce((acc, curr) => {
          return curr?.type == "outcome" ? acc + Number(curr.amount) : acc;
        }, 0)

        const totalTake = valueMapped?.reduce((acc, curr) => {
          return curr?.type == "income" ? acc + Number(curr.amount) : acc;
        }, 0)
        const dataMapped = {
          month: format(parse(key, "MMM/yyyy", new Date()), "MMMM"),
          spent: totalSpent,
          revenue: totalTake
        }
        return [
          key,
          dataMapped
        ];
      }) || []
    );
    res.status(200).json({
      dataChart: mappedData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error });
  }
}
