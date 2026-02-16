import { WebShell } from '@/components/layout/WebShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <WebShell>{children}</WebShell>;
}
