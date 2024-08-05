import { google } from "googleapis";
import getConfig from "next/config";

// Function to get the list of sheets
const getSheets = async (spreadsheetId: string) => {
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

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  return response.data.sheets;
};

// Function to create a new sheet
const createSheet = async (spreadsheetId: string, sheetName: string) => {
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

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  });
};

export {
  getSheets,
  createSheet,
};