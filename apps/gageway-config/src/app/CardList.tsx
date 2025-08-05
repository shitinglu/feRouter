
import Link from 'next/link'
import CreateAppCard from './CreateAppCard'
import { getApplications } from '@/lib/actions/applications'
import { Button } from '@/components/ui/button'

export default async function CardList() {
  const cards = await getApplications()

  return (
    <main className="mx-auto w-[960px] mt-[60px]">
      <div className="flex flex-wrap gap-[20px]">
        {cards.map((card) => (
          <div
            key={card.id}
            className="w-[225px] bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {card.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{card.domain}</p>
              <p className="text-gray-600 text-sm leading-relaxed mb-2">
                {card.description || '暂无描述'}
              </p>
              <div className="text-xs text-gray-400 mb-4">
                路由: {card._count.routes} | 权限: {card._count.permissions}
              </div>
              
              <Link href={`/apps/${card.id}`}>
                <Button className="w-full">
                  进入管理
                </Button>
              </Link>
            </div>
          </div>
        ))}
        
        <CreateAppCard />
      </div>
    </main>
  );
} 

