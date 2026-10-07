module.exports = {
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': '@vue/vue2-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.txt$': '<rootDir>/tests/raw-text-transform.js',
  },
  // Same alias and raw-loader imports as the webpack build
  moduleNameMapper: {
    '^raw-loader!@/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/tests/unit/**/*.spec.js'],
  testEnvironment: 'jsdom',
}
