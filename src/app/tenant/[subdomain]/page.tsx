import MainApp from '../../../components/MainApp';
import { fetchVenueData } from '../../../services/dataService';

// This is a Server Component that handles data fetching before rendering
export default async function TenantPage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;

  // Fetch data directly from Supabase via dataService
  const data = await fetchVenueData(subdomain);

  // If no tenant is found in DB, show a professional 404 Not Found screen
  if (!data) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg border border-gray-100">
                <div className="text-6xl mb-6">🏨</div>
                <h1 className="text-3xl font-serif text-gray-800 mb-3">Хотелът не е намерен</h1>
                <p className="text-gray-500 mb-8">
                    Съжаляваме, но не можем да открием конфигурация за поддомейн: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm text-gray-700 font-bold">{subdomain}</span>.
                </p>
                <div className="h-px w-full bg-gray-100 mb-8"></div>
                <a 
                    href="https://event4u.bg"
                    className="inline-block px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors"
                >
                    Към Началната Страница
                </a>
             </div>
        </div>
    );
  }

  // Pass the fetched data as INITIAL props to MainApp
  // This allows MainApp to render immediately without a client-side spinner
  return (
    <MainApp 
        initialSettings={data.settings} 
        initialRooms={data.rooms}
        initialServices={data.services}
        initialEventTypes={data.eventTypes}
        forceWizard={true} 
    />
  );
}