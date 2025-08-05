
import { Waypoints } from 'lucide-react';
import { auth } from '@/auth';
import { SignOut } from "@/components/auth/signout-button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
export default async function Header() {

  const session = await auth();

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-[40px] py-[16px]">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-gray-900 flex items-center text-[22px]">
            <Waypoints className="mr-1 " />前端路由配置系统
          </h1>
          <nav>
              <HoverCard>
                <HoverCardTrigger>
                  <img className="rounded-[50%] w-[32px] h-[32px]" src={session?.user?.image || ""} alt="用户头像" />
                </HoverCardTrigger>
                <HoverCardContent className='w-[100px]' align="end">
                  <SignOut />
                </HoverCardContent>
              </HoverCard>
          </nav>
        </div>
      </div>
    </header>
  );
} 