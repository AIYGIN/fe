import { defineConfig } from "orval";

export default defineConfig({
  bffApi: {
    input: {
      target: "http://localhost:3001/docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./src/apis/generated/api.ts",
      schemas: "./src/apis/generated/model",
      client: "fetch",
      mock: true,
      override: {
        mutator: {
          path: "./src/apis/request.ts",
          name: "request",
        },
      },
    },
  },
});
