import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { NextAuthOptions, Session } from "next-auth";
import { createSheet, getSheets } from "@/services/sheetConfig";
import { saveBudgetData } from "@/services/budgetData";
import getConfig from "next/config";
import { createBudgetSchema } from "@/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

type Budget = z.infer<typeof createBudgetSchema>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as NextAuthOptions
    )) as Session | null;

    if (!session) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    const { budgetData } = req.body;
    const { category, amount } = budgetData as Budget;
    const spreadsheetId = getConfig().serverRuntimeConfig.spreadsheetId || "";

    if (!spreadsheetId || !budgetData) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Check if the budget sheet exists
    const sheets = await getSheets(spreadsheetId);
    const budgetSheet = sheets?.find(
      (sheet) => sheet.properties?.title === "Budget"
    );

    // Create the sheet if it doesn't exist
    if (!budgetSheet) {
      await createSheet(spreadsheetId, "Budget");
    }

    const payload = [uuidv4(), category, amount, '0'];

    // Save the budget data
    await saveBudgetData(spreadsheetId, payload);

    res.status(200).json({ message: "Budget created successfully" });
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ error: "Failed to create budget" });
  }
};

export default handler;
