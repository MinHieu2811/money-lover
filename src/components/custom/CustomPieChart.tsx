import { memo } from "react";

type CustomPieChartProps = {
  totalSpent: number;
  totalBudget: number;
};

const CustomPieChart = ({ totalSpent, totalBudget }: CustomPieChartProps) => {
  return (
    <>
      <div className="flex justify-center items-center">
        <div
          className="pie"
          pie-data={(totalSpent / totalBudget) * 100}
          pie-width={"10px"}
          pie-color={"purple"}
        ></div>
      </div>
      <style>
        {`
        .pie {
  width: 150px;
  aspect-ratio: 1;
  position: relative;
  display: inline-grid;
  place-content: center;
  margin: 5px;
  font-size: 25px;
  font-weight: bold;
  font-family: sans-serif;
}
.pie:before {
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: 0;
  background: conic-gradient(red ${(totalSpent / totalBudget)}turn,#b1b0b0 0turn);
  -webkit-mask: radial-gradient(
    farthest-side,
    #0000 calc(99% - 10px),
    #000 calc(100% - 10px)
  );
  mask: radial-gradient(
    farthest-side,
    #0000 calc(99% - 10px),
    #000 calc(100% - 10px)
  );
}
.pie:after {
  --b: 10px;
  --c: "red";
  --p: 60;
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: calc(50% - var(--b)/2);
  background: var(--c);
  transform: rotate(calc(${(totalSpent / totalBudget)}*3.6deg)) translateY(calc(50% - 150px/2));
      `}
        `
      </style>
    </>
  );
};

const MemoPieChart = memo(CustomPieChart);

export { MemoPieChart };
