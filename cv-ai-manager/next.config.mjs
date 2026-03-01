/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    console.log('Setting up API rewrites to:', process.env.NEXT_PUBLIC_AWS_EC2_URL);
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_AWS_EC2_URL}/:path*`,
      },
    ]
  },
};

export default nextConfig;
