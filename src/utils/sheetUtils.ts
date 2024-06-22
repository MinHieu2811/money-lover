import { v4 as uuidv4 } from 'uuid';

type CreateNewTransactionRowProps = {
  headerRow: string[];
  date: string;
  category: string;
  amount: string;
  type?: TransactionType;
};

export type TransactionType = "income" | "outcome" | "debt";

export const getCategoryColumnIndex = (
  headerRow?: string[],
  category?: string
) => {
  if (!!headerRow?.length || !category) return -1;
  let index = headerRow?.indexOf(category || "");
  if (index === -1) {
    headerRow?.push(category);
    index = (headerRow?.length || 0) - 1;
  }
  return index;
};

export const createNewTransactionRow = ({
  headerRow,
  date,
  category,
  amount,
  type,
}: CreateNewTransactionRowProps) => {
  const newRow = Array(headerRow?.length).fill("");
  newRow[0] = uuidv4()
  newRow[0] = date;
  newRow[1] = type || "";
  const categoryColumnIndex = getCategoryColumnIndex(headerRow, category);
  newRow[categoryColumnIndex || 0] = amount;
  return newRow;
};

export const getSummaryRowIndex = (rows: string[][]): number => {
  return rows.findIndex((row) => row[0] === `Summary`);
};

export const updateSummaryRow = (
  rows: string[][],
  headerRow: string[],
  date: string,
  category: string,
  amount: string,
  type: TransactionType
): void => {
  let summaryRowIndex = getSummaryRowIndex(rows);
  if (summaryRowIndex === -1) {
    const newRow = createNewTransactionRow({
      headerRow,
      date: `Summary`,
      category,
      amount,
    });
    rows.push(newRow);
    return
  }
  const categoryColumnIndex = getCategoryColumnIndex(headerRow, category);
  const currentAmount = parseFloat(rows[summaryRowIndex || 0][categoryColumnIndex || 0]) || 0;

  if (type === 'income') {
    rows[summaryRowIndex || 0][categoryColumnIndex || 0] = (currentAmount + parseFloat(amount)).toString();
  } else if (type === 'outcome') {
    rows[summaryRowIndex || 0][categoryColumnIndex || 0] = (currentAmount - parseFloat(amount)).toString();
  }
};
