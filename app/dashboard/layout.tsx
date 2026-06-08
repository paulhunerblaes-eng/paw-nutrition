import { SubscriptionGate } from "../_components/SubscriptionGate";
import { DashboardSidebar } from "./_components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 bg-slate-50 p-4 md:p-8">
        <SubscriptionGate>{children}</SubscriptionGate>
      </main>
    </div>
  );
}
