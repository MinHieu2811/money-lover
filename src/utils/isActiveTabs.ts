const allPath = ["/", "/budget/my-budget", "/create-transactions", "/budget/create-budget"];

export const isActiveTab = (theme: string, link: string) => {
  if (typeof window === "undefined") return "";
  const path = window?.location?.pathname;
  if (!path) return "";
  if (link === "/" && path === "/")
    return theme === "dark" ? "bg-slate-800" : "bg-slate-200";
  console.log(path === link, allPath.includes(path));
  return path === link && allPath.includes(path)
    ? theme === "dark"
      ? "bg-slate-800"
      : "bg-slate-200"
    : "";
};
