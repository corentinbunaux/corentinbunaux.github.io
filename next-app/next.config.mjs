/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/next-app",
    output: "export",  // <=== enables static exports
    reactStrictMode: true,
};

export default nextConfig;
