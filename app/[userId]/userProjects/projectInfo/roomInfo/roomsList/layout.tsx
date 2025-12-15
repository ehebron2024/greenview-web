import ProtectedSection from "@/components/ProtectedSection";

export default function RoomsListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedSection>
      <main style={{ padding: "20px" }}>{children}</main>
    </ProtectedSection>
  );
}
