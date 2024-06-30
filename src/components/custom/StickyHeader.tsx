import Image from "next/image";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import {
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PlusSquare,
  SunIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";

type StickyHeaderProps = {
  imgAva?: string;
  name?: string;
  email?: string;
};

export const StickyHeader = ({ imgAva, name, email }: StickyHeaderProps) => {
  const { setTheme } = useTheme();
  return (
    <Sheet>
      <div className="sticky-header flex align-items-center justify-between border-b py-3 px-2">
        <SheetTrigger>
          <div className="content-center">
            <MenuIcon width={20} height={20} />
          </div>
        </SheetTrigger>
        <Image src="/salary.png" alt="salary" width={40} height={40} />
        <Avatar>
          <AvatarImage src={imgAva} width={20} height={20} />
        </Avatar>

        <SheetContent side="left" className="px-0 py-0">
          <SheetHeader className="flex-row items-center justify-start px-2 py-2 border-b-2">
            <Avatar className="mr-2 mt-2">
              <AvatarImage src={imgAva} width={20} height={20} />
            </Avatar>
            <div className="flex-col align-baseline">
              <SheetTitle className="text-left">{name}</SheetTitle>
              <SheetDescription className="text-left">{email}</SheetDescription>
            </div>
          </SheetHeader>
          <div className="relative h-full">
            <div className="border-b">
              <Link href="/" className="flex items-center py-3 px-2">
                <HomeIcon width={20} height={20} />
                <span className="ml-2">Home</span>
              </Link>
            </div>
            <div className="border-b">
              <Link
                href="/create-transactions"
                className="flex items-center py-3 px-2"
              >
                <PlusSquare width={20} height={20} />
                <span className="ml-2">Create new transactions</span>
              </Link>
            </div>
            <SheetFooter className="w-3/4 px-2 py-2 fixed bottom-0">
              <div className="flex items-center justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="destructive" onClick={() => signOut()}>
                  <LogOutIcon width={20} height={20} />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </div>
    </Sheet>
  );
};
