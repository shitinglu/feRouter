import Header from './Header';
import CardList from './CardList';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CardList />
    </div>
  );
}
