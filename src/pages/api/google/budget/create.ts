import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { NextAuthOptions, Session } from "next-auth";
import { createSheet, getSheets } from "@/services/sheetConfig";
import { checkExistBudget, saveBudgetData } from "@/services/budgetData";
import getConfig from "next/config";
import { v4 as uuidv4 } from 'uuid';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = (await getServerSession(
    req,
    res,
    authOptions as NextAuthOptions
  )) as Session | null;

  if (!session) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const { amount, category } = req.body;

  const spreadsheetId = getConfig().serverRuntimeConfig.spreadsheetId || '';

  if (!amount || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if the budget sheet exists
    const sheets = await getSheets(spreadsheetId);
    const budgetSheet = sheets?.find(sheet => sheet.properties?.title === 'Budget');

    // Create the sheet if it doesn't exist
    if (!budgetSheet) {
      await createSheet(spreadsheetId, 'Budget');
    }

    const budgetExist = await checkExistBudget(spreadsheetId, category);

    if (budgetExist) {
      return res.status(400).json({ error: 'Budget already exists' });
    }

    // Save the budget data
    await saveBudgetData(spreadsheetId, [uuidv4(), category, amount, 0]);

    res.status(200).json({ message: 'Budget created successfully' });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

export default handler;