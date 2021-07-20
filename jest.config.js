module.exports = {
    roots: ['<rootDir>/src'],
    collectCoverageFrom: ['src/Tree.jsx', 'src/TreeItem.jsx', 'src/useInternalState.js'],
    setupFilesAfterEnv: ['@testing-library/jest-dom', '@testing-library/jest-dom/extend-expect'],
    testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'],
    testEnvironment: 'jsdom',
    collectCoverage: true,
};
