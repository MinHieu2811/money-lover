import { getSummaryRowIndex, updateSummaryRow } from "@/utils/sheetUtils";
import { google } from "googleapis";
import getConfig from "next/config";
import { format, parse } from "date-fns";

export const fetchSheetData = async (
  spreadsheetId: string
): Promise<string[][]> => {
  const base64EncodedServiceAccount =
    getConfig().serverRuntimeConfig.googleServiceAccount;
  const decodedServiceAccount = Buffer.from(
    base64EncodedServiceAccount,
    "base64"
  ).toString("utf-8");
  const credentials = JSON.parse(decodedServiceAccount) || {};
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      client_id: credentials.client_id,
      private_key: credentials.private_key || "",
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
  // auth.setCredentials({ access_token: session?.accessToken });

  const sheets = google?.sheets({ version: "v4", auth });

  const getResponse = await sheets?.spreadsheets?.values.get({
    spreadsheetId,
    range: "Sheet1",
  });

  return getResponse?.data?.values || [];
};

export const updateSheetData = async (
  spreadsheetId: string,
  rows: string[][]
): Promise<void> => {
  const base64EncodedServiceAccount =
    getConfig().serverRuntimeConfig.googleServiceAccount;
  const decodedServiceAccount = Buffer.from(
    base64EncodedServiceAccount,
    "base64"
  ).toString("utf-8");
  const credentials = JSON.parse(decodedServiceAccount) || {};
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      client_id: credentials.client_id,
      private_key: credentials.private_key || "",
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  if (!spreadsheetId) {
    spreadsheetId = getConfig().serverRuntimeConfig.spreadsheetId || "";
  }

  const sheets = google?.sheets({ version: "v4", auth });

  await sheets?.spreadsheets?.values.update({
    spreadsheetId:
      spreadsheetId || getConfig().serverRuntimeConfig.spreadsheetId || "",
    range: "Sheet1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });
};

export const insertRowAndAddTransaction = async (
  spreadsheetId: string,
  newRow: string[]
): Promise<void> => {
  const base64EncodedServiceAccount =
    getConfig().serverRuntimeConfig.googleServiceAccount;
  const decodedServiceAccount = Buffer.from(
    base64EncodedServiceAccount,
    "base64"
  ).toString("utf-8");
  const credentials = JSON.parse(decodedServiceAccount) || {};
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      client_id: credentials.client_id,
      private_key: credentials.private_key || "",
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Get the existing sheet data
  const getResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1",
  });

  const rows = getResponse.data.values || [];
  const summaryRowIndex = getSummaryRowIndex(rows);

  if (summaryRowIndex === -1) {
    // Append a new row if summary row doesn't exist
    rows.push(newRow);
    updateSummaryRow(rows, rows[0], newRow[1]);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });
  } else {
    // Insert a new row above the summary row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: 0, // Assuming the first sheet
                dimension: "ROWS",
                startIndex: summaryRowIndex,
                endIndex: summaryRowIndex + 1,
              },
              inheritFromBefore: false,
            },
          },
        ],
      },
    });

    // Update the new row with the transaction data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${summaryRowIndex + 1}:Z${summaryRowIndex + 1}`, // Assuming columns go up to Z
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newRow],
      },
    });

    // Update the summary row
    updateSummaryRow([...(rows || []), newRow], rows[0], newRow[1]);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${summaryRowIndex + 2}:Z${summaryRowIndex + 2}`, // Assuming columns go up to Z
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rows[rows.length - 1]],
      },
    });
  }
};

const getTotalRows = async (spreadsheetId: string): Promise<number> => {
  const base64EncodedServiceAccount =
    getConfig().serverRuntimeConfig.googleServiceAccount;
  const decodedServiceAccount = Buffer.from(
    base64EncodedServiceAccount,
    "base64"
  ).toString("utf-8");
  const credentials = JSON.parse(decodedServiceAccount);
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      client_id: credentials.client_id,
      private_key: credentials.private_key || "",
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: [],
    includeGridData: false,
  });

  const sheet = response.data.sheets?.[0];

  if (!sheet) {
    throw new Error("Sheet not found");
  }

  return sheet.properties?.gridProperties?.rowCount || 0;
};

const getTotalRowsWithData = async (spreadsheetId: string): Promise<number> => {
  const base64EncodedServiceAccount =
    getConfig().serverRuntimeConfig.googleServiceAccount;
  const decodedServiceAccount = Buffer.from(
    base64EncodedServiceAccount,
    "base64"
  ).toString("utf-8");
  const credentials = JSON.parse(decodedServiceAccount);
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      client_id: credentials.client_id,
      private_key: credentials.private_key || "",
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!C:C", // Fetching the category column to determine the number of rows with data
  });

  return response.data.values?.length || 0;
};

export const fetchLastNRows = async (
  spreadsheetId: string,
  rowCount: number
): Promise<string[][]> => {
  const base64EncodedServiceAccount =
    getConfig().serverRuntimeConfig.googleServiceAccount;
  const decodedServiceAccount = Buffer.from(
    base64EncodedServiceAccount,
    "base64"
  ).toString("utf-8");
  const credentials = JSON.parse(decodedServiceAccount);
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials?.client_email || "",
      client_id: credentials?.client_id || "",
      private_key: credentials?.private_key || "",
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const totalRows = await getTotalRowsWithData(spreadsheetId);
  const startRow = rowCount > totalRows ? 0 : Math.max(totalRows - rowCount, 0);

  const getResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `Sheet1!A${startRow + 1}:Z${totalRows}`,
  });
  return getResponse.data.values || [];
};

export const groupTransactionsByMonth = async (
  spreadsheetId: string
): Promise<{ [month: string]: string[][] }> => {
  const allRows = await fetchSheetData(spreadsheetId);

  // Assuming the first row is the header and the first column is the date
  const header = allRows[0];
  const dateIndex = header.indexOf("Date");

  const transactionsByMonth: { [month: string]: string[][] } = {};

  const filteredAllRows = allRows?.filter(
    (item) => item[2] != "Summary" && item[1] != "Date"
  );

  filteredAllRows.forEach((row) => {
    // Skip header row
    const date = row[dateIndex];
    if (!date || date == "Date") return;

    const parsedDate = parse(date, "MM/dd/yyyy", new Date());
    const monthKey = format(parsedDate, "MMM/yyyy");

    if (!transactionsByMonth?.[monthKey]) {
      transactionsByMonth[monthKey] = [row]; // Include header in each month's data
    } else {
      transactionsByMonth[monthKey].push(row);
    }
  });

  return transactionsByMonth;
};
