npm run build:graphql
npm run build

E2E_FAKE_PINATA_HOST=fake-pinata PUBLIC_TESTNET_MOCK_PROVIDER_HOST=testnet VITE_TEST_MODE=true npm run build
E2E_FAKE_PINATA_HOST=fake-pinata PUBLIC_TESTNET_MOCK_PROVIDER_HOST=testnet npm run test:e2e
