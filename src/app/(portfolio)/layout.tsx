import { readData } from '@/lib/store';
import type { PortfolioData } from '@/types/portfolio';
import SiteShell from '@/components/site/SiteShell';

export const dynamic = 'force-dynamic';

export default async function PortfolioLayout({ children }: { children: React.ReactNode }) {
  const data = await readData<PortfolioData | null>('portfolio', null);
  return <SiteShell commands={data?.terminalCommands ?? []}>{children}</SiteShell>;
}
