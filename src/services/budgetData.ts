import { google } from "googleapis";
import getConfig from "next/config";

const saveBudgetData = async (spreadsheetId: string, budgetData: string[]) => {
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

  const budgetsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Budget!A:D',
  });

  const budgets = budgetsResponse.data.values || [];
  const categoryExists = budgets.some(row => row[1] === budgetData[1]);

  if (categoryExists) {
    throw new Error('A budget with this category already exists');
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Budget!A:D',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [budgetData],
    },
  });
};

export {
  saveBudgetData,
};