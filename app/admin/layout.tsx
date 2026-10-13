import { requireSuperAdmin } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin()
  return children
}
