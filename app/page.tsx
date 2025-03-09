"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    router.push("/login");
  }, [router]);

  if (!isClient) return <></>; // Prevents mismatch

  return <div>Redirecting...</div>;
}
// export default function Home() {
//   return <h1>Welcome to Ride Radar!</h1>;
// }
