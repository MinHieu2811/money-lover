import { NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import getConfig from "next/config";
import { getAllBudgetData } from "@/services/budgetData";

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

    const budgetRes = await getAllBudgetData(spreadsheetId);
    res.status(200).json(budgetRes);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error });
  }
}
