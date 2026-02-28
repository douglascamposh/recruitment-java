/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.AWS_EC2_URL}/:path*`,
      },
    ]
  },
};

export default nextConfig;
