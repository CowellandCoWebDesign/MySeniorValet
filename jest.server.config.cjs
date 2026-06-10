module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/server'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        skipLibCheck: true,
        strict: false
      }
    }]
  },
  modulePathIgnorePatterns: [
    '<rootDir>/.pythonlibs/',
    '<rootDir>/.cache/',
    '<rootDir>/node_modules/.vite/'
  ],
  testTimeout: 30000
};
