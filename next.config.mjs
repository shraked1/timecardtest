/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.gstatic.com'],
  },
  // Enable more detailed error reporting in development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;
