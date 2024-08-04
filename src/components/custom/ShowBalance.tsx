import React from "react";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

type ShowBalanceProps = {
  summaryAmount: number;
};

export const ShowBalance = ({ summaryAmount }: ShowBalanceProps) => {
  const [hide, setHide] = React.useState(false);
  return (
    <Card className="px-2 py-2">
      <CardTitle className="flex items-center">
        <span
          className={`${
            !hide
              ? Number(summaryAmount) > 0
                ? "text-green-500"
                : "text-red-500"
              : ""
          }`}
        >
          {hide ? (
            <>********* VND</>
          ) : (
            <>
              {Number(summaryAmount).toLocaleString().replaceAll(".", ",")} VND
            </>
          )}
        </span>
        <Button className="px-2" onClick={() => setHide(!hide)} variant="link">
          {hide ? (
            <EyeIcon width={16} height={16} />
          ) : (
            <EyeOffIcon width={16} height={16} />
          )}
        </Button>
      </CardTitle>
      <CardDescription>Your total balance</CardDescription>
    </Card>
  );
};
