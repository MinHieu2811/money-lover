import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChartConfig, ChartContainer } from "../ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    // color: "#2563eb",
    theme: {
      light: "#2563eb",
      dark: "#dc2626",
    },
  },
  mobile: {
    label: "Mobile",
    // color: "#60a5fa",
    theme: {
      light: "#2563eb",
      dark: "#dc2626",
    },
  },
} satisfies ChartConfig;

type PlainObject = {
  [key: string]: any;
};

type SpentChartSectionProps = {
  chartData: Array<{ month: string; spent: number; revenue: number }>;
};

const SpentChartSection = ({ chartData }: SpentChartSectionProps) => {
  return (
    <>
      <Tabs defaultValue="outcome" className="w-full relative">
        <TabsList className={`w-full`}>
          <TabsTrigger value="income">Revenue</TabsTrigger>
          <TabsTrigger value="outcome">Spent</TabsTrigger>
        </TabsList>
        <TabsContent value="income" className="mt-0">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip content={<ChartTooltipContent hideIndicator indicator="line"/>} />
              <Bar
                dataKey="revenue"
                fill="var(--color-desktop)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </TabsContent>
        <TabsContent value="outcome" className="mt-0">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                separator="-"
                content={<ChartTooltipContent indicator="line" hideIndicator/>}
              />
              <Bar
                dataKey="spent"
                fill="var(--color-desktop)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default SpentChartSection;
