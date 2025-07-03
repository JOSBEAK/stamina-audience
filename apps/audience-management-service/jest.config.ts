export default {
  displayName: 'audience-management-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/audience-management-service',
  coverageReporters: ['text', 'html'],
  testMatch: ['<rootDir>/src/**/?(*.)+(spec|test).[jt]s'],
  moduleNameMapper: {
    '^@stamina-project/(.*)$': '<rootDir>/../../libs/$1/src',
  },
};
