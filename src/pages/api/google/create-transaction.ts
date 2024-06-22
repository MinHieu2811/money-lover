import { NextApiRequest, NextApiResponse } from "next";
import { fetchSheetData, updateSheetData } from "@/services/sheetData";
import { createNewTransactionRow, updateSummaryRow } from "@/utils/sheetUtils";
import { config_data } from "@/config-data";
import { getServerSession } from "next-auth";

type Session = {
  accessToken: string;
};

type TransactionType = "income" | "outcome" | "debt";

const addTransaction = async (
  spreadsheetId: string,
  date: string,
  category: string,
  amount: string,
  session: Session,
  type: TransactionType
) => {
  let rows = await fetchSheetData(spreadsheetId, session);

  if (rows.length === 0) {
    rows.push(["ID", "Date", "Type"]);
  }

  const headerRow = rows[0];

  const newRow = createNewTransactionRow({
    headerRow,
    date,
    category,
    amount,
    type,
  });
  rows.push(newRow);

  if (type === "income" || type === "outcome") {
    updateSummaryRow(rows, headerRow, date, category, amount, type);
  }

  await updateSheetData(spreadsheetId, rows, session);

  return { message: "Transaction added successfully" };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = (await getServerSession()) as Session | null;
    console.log(session);

    if (!session) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    const { date, category, amount } = req.body;

    const [key, _value] =
      Object.entries(config_data?.categories)?.find(([key, value]) => {
        if (value.includes(category)) {
          return key;
        }
        return null;
      }) || [];
    const transactionType = (key as "income") || "income";

    if (!date || !category || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const response = await addTransaction(
      spreadsheetId || "",
      date,
      category,
      amount,
      session,
      transactionType
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Failed to add transaction" });
  }
};

export default handler;
