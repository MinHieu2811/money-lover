import { google } from "googleapis";

type Session = {
  accessToken: string;
};

export const fetchSheetData = async (
  spreadsheetId: string,
  session: Session
): Promise<string[][]> => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session?.accessToken });

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
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session?.accessToken });

  const sheets = google?.sheets({ version: "v4", auth });

  await sheets?.spreadsheets?.values.update({
    spreadsheetId,
    range: "Sheet1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });
};
