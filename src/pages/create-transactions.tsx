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
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { CategoriesSheet } from "@/components/custom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import toast from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

type Transaction = z.infer<typeof createTransactionSchema>;

const initialTransation: Transaction = {
  amount: "0",
  category: "",
  note: "",
  type: "outcome",
  date: new Date(),
};

export default function Home() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const form = useForm<Transaction>({
    defaultValues: initialTransation,
    resolver: zodResolver(createTransactionSchema),
    mode: "onSubmit",
  });
  const categories = form?.watch("category");

  const handleChooseCategories = (cate: string) => {
    form?.setValue("category", cate);
  };

  const handleSubmit = async (data: Transaction) => {
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
      await axios.post("/api/google/create-transaction", data);
      form.reset();
      toast.success("Transaction created successfully", {
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
            <FormField
              disabled={loading}
              control={form?.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col mb-3">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={loading}
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field?.value ? (
                            format(field?.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field?.value}
                        onSelect={field?.onChange}
                        disabled={(date: Date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        className="w-full"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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

            <FormField
              disabled={loading}
              control={form?.control}
              name="note"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Note" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
        <CategoriesSheet handleChooseCategory={handleChooseCategories} />
      </Sheet>
    </main>
  );
}
