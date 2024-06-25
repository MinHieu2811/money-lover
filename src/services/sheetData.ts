import { google } from "googleapis";

type Session = {
  accessToken: string;
};

export const fetchSheetData = async (
  spreadsheetId: string,
  session: Session
): Promise<string[][]> => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      client_id: process.env.CLIENT_ID,
      private_key: (process.env.PRIVATE_KEY || "").replace(/\\n/g, '\n')
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets'
    ]
  })
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
      private_key: (process.env.PRIVATE_KEY || "").replace(/\\n/g, '\n')
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets'
    ]
  })

  if(!spreadsheetId) {
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
