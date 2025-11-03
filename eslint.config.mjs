import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // setState in effect를 경고로 변경 (외부 시스템 동기화는 정당한 사용)
      "react-hooks/set-state-in-effect": "warn",
      // 미사용 변수를 경고로 변경
      "@typescript-eslint/no-unused-vars": "warn",
      // React unescaped entities를 경고로 변경
      "react/no-unescaped-entities": "warn",
      // exhaustive-deps를 경고로 변경
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "dist/**",
    "electron/**",
  ]),
]);

export default eslintConfig;
