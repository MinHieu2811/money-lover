import { v4 as uuidv4 } from 'uuid';

type CreateNewTransactionRowProps = {
  headerRow: string[];
  date: string;
  category: string;
  amount: string;
  type?: TransactionType;
  note?: string;
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
  note
}: CreateNewTransactionRowProps) => {
  const newRow = Array(headerRow.length).fill('');
  newRow[0] = uuidv4(); // Generate a unique ID
  newRow[1] = date;
  newRow[2] = category;
  newRow[3] = amount;
  newRow[4] = note;
  if (type) {
    newRow[5] = type;
  }

  const categoryColumnIndex = getCategoryColumnIndex(headerRow, category);
  newRow[categoryColumnIndex || 0] = amount;
  return newRow;
};

export const getSummaryRowIndex = (rows: string[][]): number => {
  return rows.findIndex((row) => row[2] === `Summary`);
};

export const updateSummaryRow = (
  rows: string[][],
  headerRow: string[],
  date: string
): void => {
  let summaryRowIndex = getSummaryRowIndex(rows);
  if (summaryRowIndex === -1) {
    const newRow = Array(headerRow?.length + 1).fill(''); // +1 for total column
    newRow[0] = ''; // ID column is empty
    newRow[1] = date;
    newRow[2] = 'Summary';
    rows.push(newRow);
    summaryRowIndex = rows.length - 1;
  }

  let totalIncome = 0;
  let totalOutcome = 0;

  rows.forEach(row => {
    if (row[2] !== 'Summary' && row[5] === 'income') {
      totalIncome += parseFloat(row[3]);
    } else if (row[2] !== 'Summary' && row[5] === 'outcome') {
      totalOutcome += parseFloat(row[3]);
    }
  });

  const total = totalIncome - totalOutcome;
  rows[summaryRowIndex][headerRow?.length] = total.toString();
};
