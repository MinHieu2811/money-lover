import { memo } from "react";

type CustomPieChartProps = {
  totalSpent: number;
  totalBudget: number;
};

const CustomPieChart = ({ totalSpent, totalBudget }: CustomPieChartProps) => {
  return (
    <>
      <div className="flex justify-center items-center">
        <div className="pie animate"></div>
      </div>
      {typeof window !== "undefined" && (
        <style>
          {`
        @property --p{
  syntax: '<number>';
  inherits: true;
  initial-value: 1;
}

.pie {
  --p:${(totalSpent / totalBudget) * 100};
  --b:15px;
  --c: ${(totalSpent / totalBudget) * 100 < 100 ? "#2563eb" : "red"};
  --w:200px;

  width: var(--w);
  aspect-ratio: 1;
  position: relative;
  display: inline-grid;
  margin: 5px;
  place-content: center;
  font-size: 25px;
  font-weight: bold;
  font-family: sans-serif;
}
.pie:before,
.pie:after {
  content: "";
  position: absolute;
  border-radius: 50%;
}
.pie:before {
  inset: 0;
  background:
    radial-gradient(farthest-side,var(--c) 98%,#0000) top/var(--b) var(--b) no-repeat,
    conic-gradient(var(--c) calc(var(--p)*1%),#d6d2d2 0);
  -webkit-mask: radial-gradient(farthest-side,#0000 calc(99% - var(--b)),#000 calc(100% - var(--b)));
          mask: radial-gradient(farthest-side,#0000 calc(99% - var(--b)),#000 calc(100% - var(--b)));
}
.pie:after {
  inset: calc(50% - var(--b)/2);
  background: var(--c);
  transform: rotate(calc(var(--p)*3.6deg)) translateY(calc(50% - var(--w)/2));
}
.animate {
  animation: p 1s 0.5s both;
}
.no-round:before {
  background-size: 0 0, auto;
}
.no-round:after {
  content: none;
}
@keyframes p{
  from{--p:0}
}

      `}
          `
        </style>
      )}
    </>
  );
};

const MemoPieChart = memo(CustomPieChart);

export { MemoPieChart };
