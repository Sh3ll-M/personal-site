/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/projects/example-project",
        destination: "/projects/personal-site",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
