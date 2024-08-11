import { Inter } from "next/font/google";

import { StickyHeader } from "@/components/custom/StickyHeader";
import { createTransactionSchema } from "@/zod/transactions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { createBudgetSchema } from "@/zod";
import { config_data } from "@/config-data";

const inter = Inter({ subsets: ["latin"] });

type Budget = z.infer<typeof createBudgetSchema>;

const initialTransation: Budget = {
  amount: "0",
  category: "",
};

export default function Home() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const form = useForm<Budget>({
    defaultValues: initialTransation,
    resolver: zodResolver(createBudgetSchema),
    mode: "onSubmit",
  });
  const categories = form?.watch("category");

  const handleChooseCategories = (cate: string) => {
    form?.setValue("category", cate);
  };

  const handleSubmit = async (data: Budget) => {
    const toastId = toast.loading("Loading...");
    try {
      if (data?.amount === "0") {
        form.setError("amount", {
          type: "custom",
          message: "Amount is required",
        });
        return;
      }
      setLoading(true);
      await axios.post("/api/google/budget/create", data);
      form.reset();
      toast.success("Budget created successfully", {
        id: toastId,
      });
    } catch (error: any) {
      console.error(error);
      toast?.error(error?.message || "Something went wrong", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen ${inter.className}`}>
      <Sheet>
        <StickyHeader
          imgAva={session?.user?.image || ""}
          email={session?.user?.email || ""}
          name={session?.user?.name || ""}
        />
        <Form {...form}>
          <form
            className="px-2 py-0 mt-2"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              disabled={loading}
              control={form?.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <Button className="mr-2" type="button">
                        <Image
                          src="/dong.png"
                          alt="currency"
                          width={20}
                          height={20}
                        />
                        <span className="ml-2">VND</span>
                      </Button>
                      <Input {...field} placeholder="Amount" type="number" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!!categories?.length && (
              <FormField
                control={form?.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="mb-3">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Category" disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <SheetTrigger className="w-full mb-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <Image
                  src="/categories.png"
                  alt="Categories"
                  width={20}
                  height={20}
                />
                <span className="ml-2">Choose your Categories</span>
              </Button>
            </SheetTrigger>
            <Button
              type="submit"
              className="w-full"
              variant="default"
              disabled={loading}
            >
              Submit
            </Button>
          </form>
        </Form>
        {/* <CategoriesSheet handleChooseCategory={handleChooseCategories} /> */}
        <SheetContent
          side="right"
          className="px-0 py-0 w-full h-full overflow-y-scroll"
        >
          {config_data?.categories?.["outcome"]?.map((item, index) => (
            <div
              className="border-b-1 border-t-2"
              key={`income-${item}-${index}`}
            >
              <SheetClose className="w-full">
                <Button
                  className="w-full text-left"
                  variant="ghost"
                  onClick={() => handleChooseCategories(item)}
                >
                  {item}
                </Button>
              </SheetClose>
            </div>
          ))}
        </SheetContent>
      </Sheet>
    </main>
  );
}
