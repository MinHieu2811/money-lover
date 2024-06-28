import { getSummaryRowIndex, updateSummaryRow } from "@/utils/sheetUtils";
import { google } from "googleapis";

type Session = {
  accessToken: string;
};

export const fetchSheetData = async (
  spreadsheetId: string,
): Promise<string[][]> => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      private_key: (process.env.PRIVATE_KEY || "").replace(/\\n/g, "\n"),
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
  rows: string[][],
  session: Session
): Promise<void> => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      private_key: (process.env.PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  if (!spreadsheetId) {
    spreadsheetId = process.env.SPREADSHEET_ID || "";
  }

  const sheets = google?.sheets({ version: "v4", auth });

  await sheets?.spreadsheets?.values.update({
    spreadsheetId: spreadsheetId || process.env.SPREADSHEET_ID,
    range: "Sheet1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });
};

export const insertRowAndAddTransaction = async (
  spreadsheetId: string,
  newRow: string[],
): Promise<void> => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      private_key: (process.env.PRIVATE_KEY || "").replace(/\\n/g, "\n"),
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
    updateSummaryRow(rows, rows[0], newRow[1]);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${summaryRowIndex + 1}:Z${summaryRowIndex + 1}`, // Assuming columns go up to Z
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rows[summaryRowIndex]],
      },
    });
  }
};
