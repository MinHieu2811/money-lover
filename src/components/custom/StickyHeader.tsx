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

        <SheetContent side="left">
          <SheetHeader className="flex items-center">
            <Avatar>
              <AvatarImage src={imgAva} width={20} height={20} />
            </Avatar>
            <div>
              <SheetTitle>{name}</SheetTitle>
              <SheetDescription>{email}</SheetDescription>
            </div>
          </SheetHeader>
        </SheetContent>
      </div>
    </Sheet>
  );
};
