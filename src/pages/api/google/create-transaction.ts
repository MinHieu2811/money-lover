import { NextApiRequest, NextApiResponse } from "next";
import {
  fetchSheetData,
  insertRowAndAddTransaction,
} from "@/services/sheetData";
import {
  createNewTransactionRow,
} from "@/utils/sheetUtils";
import { config_data } from "@/config-data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { NextAuthOptions } from "next-auth";
import { format } from "date-fns";
import getConfig from "next/config";
import { calculateBudget } from "@/services/budgetData";

type Session = {
  accessToken: string;
};

type TransactionType = "income" | "outcome" | "debt";

const addTransaction = async ({
  spreadsheetId,
  date,
  category,
  amount,
  type,
  note,
}: {
  spreadsheetId: string;
  date: string;
  category: string;
  amount: string;
  type: TransactionType;
  note: string;
}) => {
  // Fetch existing sheet data
  let rows = await fetchSheetData(spreadsheetId);

  if (rows.length === 0) {
    // Initialize header row if it doesn't exist
    rows.push(["ID", "Date", "Type", "Amount", "Note"]);
  }

  const headerRow = rows[0];

  // Create new transaction row
  const newRow = createNewTransactionRow({
    headerRow,
    date,
    category,
    amount,
    type,
    note,
  });

  // Insert the new row and add the transaction
  await insertRowAndAddTransaction(spreadsheetId, newRow);

  return { message: "Transaction added successfully" };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    const { date, category, amount, note } = req.body;

    const [key, _value] =
      Object.entries(config_data?.categories)?.find(([key, value]) => {
        if (value.includes(category)) {
          return key;
        }
        return null;
      }) || [];
    const transactionType = (key as "income") || "income";

    if (!date || !category || !amount) {
      res?.status(400);
      throw new Error("Missing required fields");
    }
    const spreadsheetId = getConfig().serverRuntimeConfig.spreadsheetId || '';
    const response = await addTransaction({
      spreadsheetId: spreadsheetId || "",
      date: format(date, "dd/MMMM/yyyy"),
      category,
      amount,
      note,
      type: transactionType,
    });
    // await bree.start('calculateBudget');

    await calculateBudget(spreadsheetId, category, date)

    res.status(200).json(response);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500);
    throw new Error("Failed to add transaction");
  }
}
