import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-300 mb-4">
          Venue Not Found
        </h2>
        <p className="text-gray-400 mb-8">
          The venue you're looking for doesn't exist or is not active.
        </p>
        <Link
          href="/"
          className="inline-block bg-yellow-400 text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
