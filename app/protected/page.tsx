import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  // Redirect to root page which now handles authenticated users
  redirect("/");
}
