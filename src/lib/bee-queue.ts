import Queue from "bee-queue";
import { google } from "googleapis";
import getConfig from "next/config";

const budgetQueue = new Queue("budgetQueue", {
  isWorker: true
});

budgetQueue.process(
  async (job: Queue.Job<any>, done: Queue.DoneCallback<unknown>) => {
    try {
      const { spreadsheetId, date, category } = job?.data;

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
      const monthKey = `${currentYear}-${currentMonth}`;

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
          row[2] === category
        );
      });

      const totalSpent = monthlyTransactions.reduce(
        (sum, row) => sum + parseFloat(row[4]),
        0
      );

      // Update the "Total Spent" column in the Budget sheet
      const budgetsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Budget!A:D",
      });

      const budgets = budgetsResponse.data.values || [];
      const budgetRowIndex = budgets.findIndex(
        (row) => row[0] === monthKey && row[1] === category
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

      done(null); // Indicate success
    } catch (error: any) {
      done(error); // Pass the error to the done function
    }
  }
);

export default budgetQueue;
