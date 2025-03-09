import nextTranspileModules from "next-transpile-modules";

const withTM = nextTranspileModules(["react-leaflet"]);

const nextConfig = withTM({
  reactStrictMode: true,
  output: "standalone",  // ✅ Ensures correct build output
  pageExtensions: ["tsx", "ts"],  // ✅ Ensures Next.js recognizes TypeScript files
});

export default nextConfig;
