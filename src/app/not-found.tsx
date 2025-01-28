import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
} 