import { google } from "googleapis";
import getConfig from "next/config";

const saveBudgetData = async (spreadsheetId: string, budgetData: string[][]) => {
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

  const sheetName = 'Budget';
  const range = `${sheetName}!A1`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: {
      values: budgetData,
    },
  });
};

export {
  saveBudgetData,
};