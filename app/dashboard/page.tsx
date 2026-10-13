import AppShell from '@/components/AppShell'
import DashboardClient from '@/components/DashboardClient'
import { getCurrentTenant } from '@/lib/tenant'
export const dynamic='force-dynamic'
export default async function Dashboard(){const {supabase,organization}=await getCurrentTenant();const {data}=await supabase.rpc('get_dashboard_summary',{p_org_id:organization.id});const summary=data||{today_count:0,confirmed_count:0,scheduled_count:0,revenue_cents:0,month_customers:0,upcoming:[]};return <AppShell title="Visão geral"><DashboardClient businessName={organization.name} slug={organization.slug} summary={summary}/></AppShell>}
