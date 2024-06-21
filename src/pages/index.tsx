import { Inter } from "next/font/google";
import { StickyHeader } from "@/components/custom/StickyHeader";
import { getServerSession, NextAuthOptions } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useSession } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data: session } = useSession();
  return (
    <main className={`min-h-screen ${inter.className}`}>
      <StickyHeader
        imgAva={session?.user?.image || ""}
        email={session?.user?.email || ""}
        name={session?.user?.name || ""}
      />
    </main>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions as NextAuthOptions
  );
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
}
