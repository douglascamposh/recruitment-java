/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    proxyTimeout: 120000, // 2 minutes to allow Gemini LLM to finish processing the CV
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_AWS_EC2_URL}/:path*`,
      },
    ]
  },
};

export default nextConfig;
