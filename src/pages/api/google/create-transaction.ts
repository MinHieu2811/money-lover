import { NextApiRequest, NextApiResponse } from "next";
import { fetchSheetData, updateSheetData } from "@/services/sheetData";
import { createNewTransactionRow, getSummaryRowIndex, updateSummaryRow } from "@/utils/sheetUtils";
import { config_data } from "@/config-data";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { NextAuthOptions } from "next-auth";
import { format } from "date-fns";

type Session = {
  accessToken: string;
};

type TransactionType = "income" | "outcome" | "debt";

const addTransaction = async ({
  session,
  spreadsheetId,
  date,
  category,
  amount,
  type,
  note
}: {
  spreadsheetId: string;
  date: string;
  category: string;
  amount: string;
  session: Session;
  type: TransactionType;
  note?: string;
}) => {
  let rows = await fetchSheetData(spreadsheetId, session);

  if (rows.length === 0) {
    rows.push(["ID", "Date", "Category", "Amount", "Note", "Type"]);
  }

  const headerRow = rows[0];

  const newRow = createNewTransactionRow({
    headerRow,
    date,
    category,
    amount,
    type,
    note: note || "",
  });
  rows.push(newRow);

  if (type === "income" || type === "outcome") {
    updateSummaryRow(rows, headerRow, category, amount, type);
  }

  const summaryRowIndex = getSummaryRowIndex(rows);

  if (summaryRowIndex === -1) {
    // If no summary row exists, add the new transaction normally
    rows.push(newRow);
  } else {
    // Insert the new transaction above the summary row
    rows.splice(summaryRowIndex, 0, newRow);
  }

  await updateSheetData(spreadsheetId, rows, session);

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
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const response = await addTransaction({
      spreadsheetId: spreadsheetId || "",
      date: format(date, "dd/MMMM/yyyy HH:mm"),
      category,
      amount,
      session,
      note,
      type: transactionType,
    });
    res.status(200).json(response);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500);
    throw new Error("Failed to add transaction");
  }
}
