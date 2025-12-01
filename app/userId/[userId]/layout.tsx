import React from "react";

export default function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { userId: string };
}) {
  return (
    <div>
      <header style={{ padding: "20px", background: "#eee" }}>
        <h2>User Area for: {params.userId}</h2>
      </header>
      <main>{children}</main>
    </div>
  );
}
