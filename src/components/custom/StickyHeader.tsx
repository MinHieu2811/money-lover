import Image from "next/image";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";

type StickyHeaderProps = {
  imgAva?: string;
  name?: string;
  email?: string;
};

export const StickyHeader = ({ imgAva, name, email }: StickyHeaderProps) => {
  return (
    <Sheet>
      <div className="sticky-header flex align-items-center justify-between border-b py-3 px-2">
        <SheetTrigger>
          <div className="content-center">
            <Image src="/menu.png" alt="menu" width={20} height={20} />
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
          <div className="border-b">
            <Link href="/create-transactions" className="flex items-center py-3 px-2">
              <Image src="/tab.png" alt="tab" width={20} height={20} />
              <span className="ml-2">Create Transactions</span>
            </Link>
          </div>
        </SheetContent>
      </div>
    </Sheet>
  );
};
