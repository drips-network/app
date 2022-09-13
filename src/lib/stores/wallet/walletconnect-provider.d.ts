// https://github.com/vitejs/vite/issues/7257#issuecomment-1079579892
declare module '@walletconnect/web3-provider/dist/umd/index.min.js' {
  import WalletConnectProvider from '@walletconnect/web3-provider/dist/esm/index';
  export default WalletConnectProvider;
}
