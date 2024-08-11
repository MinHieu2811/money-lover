import { google } from "googleapis";
import getConfig from "next/config";

const saveBudgetData = async (
  spreadsheetId: string,
  budgetData: string[]
) => {
  try {
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

    const sheetName = "Budget";
    const range = `${sheetName}!A1`;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [budgetData],
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const checkExistBudget = async (spreadsheetId: string, category: string) => {
  try {
    const data = await getAllBudgetData(spreadsheetId);
    return data?.budgetRes?.some((item) => item.category === category);
  } catch (error) {
    console.error(error);
  }
};

const calculateBudget = async (
  spreadsheetId: string,
  category: string,
  date: string
) => {
  try {
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

    const currentMonth = new Date(date).getMonth() + 1;
    const currentYear = new Date(date).getFullYear();

    // Fetch all transactions for the current month and category
    const transactionsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A:F",
    });

    const transactions = transactionsResponse.data.values || [];
    const monthlyTransactions = transactions.filter((row) => {
      const rowDate = new Date(row[1]);
      return (
        rowDate.getFullYear() === currentYear &&
        rowDate.getMonth() + 1 === currentMonth &&
        row[2]?.toLowerCase() === category?.toLowerCase()
      );
    });

    const totalSpent = monthlyTransactions.reduce(
      (sum, row) => sum + parseFloat(row[3]),
      0
    );

    // Update the "Total Spent" column in the Budget sheet
    const budgetsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Budget!A:D",
    });

    const budgets = budgetsResponse.data.values || [];
    const budgetRowIndex = budgets.findIndex(
      (row) => row[1]?.toLowerCase() === category?.toLowerCase()
    );

    if (budgetRowIndex !== -1) {
      budgets[budgetRowIndex][3] = totalSpent;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Budget!A${budgetRowIndex + 1}:D${budgetRowIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [budgets[budgetRowIndex]],
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const getAllBudgetData = async (spreadsheetId: string) => {
  try {
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
      range: "Budget!A:D",
    });

    const budgetRes = (budgetsResponse?.data?.values || [])?.map((item) => {
      return {
        id: item?.[0],
        category: item?.[1],
        budget: item?.[2],
        spent: item?.[3],
      };
    });

    return {
      budgetRes,
    };
  } catch (error) {
    console.error(error);
  }
};

export { saveBudgetData, calculateBudget, getAllBudgetData, checkExistBudget };
