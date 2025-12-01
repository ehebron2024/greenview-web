import React from "react";

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { userId: string };
}) {
  const resolvedParams = await params;
  return (
    <div>
      <header style={{ padding: "20px", background: "#eee" }}>
        <h2>User Area for: {resolvedParams.userId}</h2>
      </header>
      <main>{children}</main>
    </div>
  );
}
