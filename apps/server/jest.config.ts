import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",

  roots: ["<rootDir>/tests"],

  testMatch: ["**/*.test.ts"],

  transform: {
    "^.+\\.tsx?$": "babel-jest",
  },

  moduleFileExtensions: ["ts", "js"],

  clearMocks: true,

  coverageDirectory: "coverage",
};

export default config;