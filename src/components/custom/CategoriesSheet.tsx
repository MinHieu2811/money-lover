import { Button } from "../ui/button";
import { SheetClose, SheetContent } from "../ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { config_data } from "@/config-data";

type CategoriesSheetProps = {
  handleChooseCategory: (category: string) => void;
};

export const CategoriesSheet = ({
  handleChooseCategory,
}: CategoriesSheetProps) => {
  return (
    <>
      <SheetContent
        side="right"
        className="px-0 py-0 w-full h-full overflow-y-scroll"
      >
        <Tabs defaultValue="income" className="w-full relative">
          <TabsList className={`w-full mt-[50px]`}>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="outcome">Outcome</TabsTrigger>
            <TabsTrigger value="debt">Debt</TabsTrigger>
          </TabsList>
          <TabsContent value="income" className="mt-0">
            {config_data?.categories?.["income"]?.map((item, index) => (
              <div
                className="border-b-1 border-t-2"
                key={`income-${item}-${index}`}
              >
                <SheetClose className="w-full">
                  <Button
                    className="w-full text-left"
                    variant="ghost"
                    onClick={() => handleChooseCategory(item)}
                  >
                    {item}
                  </Button>
                </SheetClose>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="outcome" className="mt-0">
            {config_data?.categories?.["outcome"]?.map((item, index) => (
              <div
                className="border-b-1 border-t-2"
                key={`income-${item}-${index}`}
              >
                <SheetClose className="w-full">
                  <Button
                    className="w-full text-left"
                    variant="ghost"
                    onClick={() => handleChooseCategory(item)}
                  >
                    {item}
                  </Button>
                </SheetClose>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="debt" className="mt-0">
            {config_data?.categories?.["debt"]?.map((item, index) => (
              <div
                className="border-b-1 border-t-2"
                key={`income-${item}-${index}`}
              >
                <SheetClose className="w-full">
                  <Button
                    className="w-full text-left"
                    variant="ghost"
                    onClick={() => handleChooseCategory(item)}
                  >
                    {item}
                  </Button>
                </SheetClose>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </>
  );
};
