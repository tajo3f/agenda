import { notFound } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import PublicBooking from '@/components/PublicBooking'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{slug:string}> }){
 const {slug}=await params; const supabase=await createClient();
 const {data,error}=await supabase.rpc('get_public_booking_page',{p_slug:slug})
 if(error||!data?.organization) notFound()
 return <div className="bookingPage"><div className="container"><div className="bookingHead"><Logo/><Link href="/" className="btn sm">TAJO Agenda</Link></div><PublicBooking organization={data.organization} services={data.services||[]} professionals={data.professionals||[]}/></div></div>
}
