import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Bundle Analyzer 설정
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */

  // Bundle Analyzer를 위해 Webpack 모드 강제 (WEBPACK_BUILD=true일 때)
  ...(process.env.WEBPACK_BUILD === "true" && {
    webpack(config) {
      return config;
    },
  }),
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
