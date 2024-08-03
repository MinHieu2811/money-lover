import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import NProgress from 'nprogress'

type AuthenWrapperProps = {
  children: React.ReactNode;
};

export const AuthenWrapper = ({ children }: AuthenWrapperProps) => {
  const {data: session} = useSession();
  const router = useRouter();
  useEffect(() => {
    router.events.on('routeChangeStart', () => {
      NProgress?.start()
    })

    router.events.on('routeChangeComplete', () => {
      NProgress.done(false)
    })

    router.events.on('beforeHistoryChange', url => {
      console.log('history changing to ', url)
    })

    return () => {
      router.events.off('routeChangeStart', () => {})
      router.events.off('routeChangeComplete', () => {})
    }
  }, [router])
  useEffect(() => {
    if (!session && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [session]);
  return <>{children}</>;
};
