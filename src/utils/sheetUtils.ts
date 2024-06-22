type CreateNewTransactionRowProps = {
  headerRow: string[];
  date: string;
  category: string;
  amount: string;
};

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
}: CreateNewTransactionRowProps) => {
  const newRow = Array(headerRow?.length).fill("");
  newRow[0] = date;
  const categoryColumnIndex = getCategoryColumnIndex(headerRow, category);
  newRow[categoryColumnIndex || 0] = amount;
  return newRow;
};

export const getSummaryRowIndex = (rows: string[][], date: string): number => {
  return rows.findIndex((row) => row[0] === `${date} Summary`);
};

export const updateSummaryRow = (
  rows: string[][],
  headerRow: string[],
  date: string,
  category: string,
  amount: string
): void => {
  let summaryRowIndex = getSummaryRowIndex(rows, date);
  if (summaryRowIndex === -1) {
    const newRow = createNewTransactionRow({
      headerRow,
      date: `${date} Summary`,
      category,
      amount,
    });
    rows.push(newRow);
  } else {
    const categoryColumnIndex = getCategoryColumnIndex(headerRow, category);
    rows[summaryRowIndex][categoryColumnIndex || 0] = `${
      (parseFloat(rows[summaryRowIndex][categoryColumnIndex || 0]) || 0) +
      parseFloat(amount)
    }`;
  }
};
