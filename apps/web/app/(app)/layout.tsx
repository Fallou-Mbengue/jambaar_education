import { MobileShell } from '@/components/layout/MobileShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
