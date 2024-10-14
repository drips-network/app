export const dripsAbi = [
  {
    inputs: [{ internalType: 'uint32', name: 'cycleSecs_', type: 'uint32' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'value',
        type: 'bytes',
      },
    ],
    name: 'AccountMetadataEmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'erc20',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amt',
        type: 'uint128',
      },
    ],
    name: 'Collectable',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'erc20',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'collected',
        type: 'uint128',
      },
    ],
    name: 'Collected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'driverId',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'oldDriverAddr',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newDriverAddr',
        type: 'address',
      },
    ],
    name: 'DriverAddressUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'driverId',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'driverAddr',
        type: 'address',
      },
    ],
    name: 'DriverRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'receiver',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'erc20',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amt',
        type: 'uint128',
      },
    ],
    name: 'Given',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'currentAdmin',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'NewAdminProposed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'pauser',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'pauser',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'admin',
        type: 'address',
      },
    ],
    name: 'PauserGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'pauser',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'admin',
        type: 'address',
      },
    ],
    name: 'PauserRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'erc20',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amt',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'receivableCycles',
        type: 'uint32',
      },
    ],
    name: 'ReceivedStreams',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'receiver',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'erc20',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amt',
        type: 'uint128',
      },
    ],
    name: 'Split',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'receiversHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'weight',
        type: 'uint32',
      },
    ],
    name: 'SplitsReceiverSeen',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'receiversHash',
        type: 'bytes32',
      },
    ],
    name: 'SplitsSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'erc20',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'senderId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'amt',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'bytes32[]',
        name: 'streamsHistoryHashes',
        type: 'bytes32[]',
      },
    ],
    name: 'SqueezedStreams',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'receiversHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'StreamConfig',
        name: 'config',
        type: 'uint256',
      },
    ],
    name: 'StreamReceiverSeen',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'accountId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'erc20',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'receiversHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'streamsHistoryHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'balance',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'maxEnd',
        type: 'uint32',
      },
    ],
    name: 'StreamsSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'pauser',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'erc20',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amt',
        type: 'uint256',
      },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
  {
    inputs: [],
    name: 'AMT_PER_SEC_EXTRA_DECIMALS',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'AMT_PER_SEC_MULTIPLIER',
    outputs: [{ internalType: 'uint160', name: '', type: 'uint160' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DRIVER_ID_OFFSET',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_SPLITS_RECEIVERS',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_STREAMS_RECEIVERS',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_TOTAL_BALANCE',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'TOTAL_SPLITS_WEIGHT',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'admin',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'allPausers',
    outputs: [
      {
        internalType: 'address[]',
        name: 'pausersList',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
      {
        components: [
          { internalType: 'uint256', name: 'accountId', type: 'uint256' },
          {
            internalType: 'StreamConfig',
            name: 'config',
            type: 'uint256',
          },
        ],
        internalType: 'struct StreamReceiver[]',
        name: 'currReceivers',
        type: 'tuple[]',
      },
      { internalType: 'uint32', name: 'timestamp', type: 'uint32' },
    ],
    name: 'balanceAt',
    outputs: [{ internalType: 'uint128', name: 'balance', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract IERC20', name: 'erc20', type: 'address' }],
    name: 'balances',
    outputs: [
      {
        internalType: 'uint128',
        name: 'streamsBalance',
        type: 'uint128',
      },
      { internalType: 'uint128', name: 'splitsBalance', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
    ],
    name: 'collect',
    outputs: [{ internalType: 'uint128', name: 'amt', type: 'uint128' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
    ],
    name: 'collectable',
    outputs: [{ internalType: 'uint128', name: 'amt', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cycleSecs',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'driverId', type: 'uint32' }],
    name: 'driverAddress',
    outputs: [{ internalType: 'address', name: 'driverAddr', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      {
        components: [
          { internalType: 'bytes32', name: 'key', type: 'bytes32' },
          { internalType: 'bytes', name: 'value', type: 'bytes' },
        ],
        internalType: 'struct AccountMetadata[]',
        name: 'accountMetadata',
        type: 'tuple[]',
      },
    ],
    name: 'emitAccountMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'uint256', name: 'receiver', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
      { internalType: 'uint128', name: 'amt', type: 'uint128' },
    ],
    name: 'give',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'pauser', type: 'address' }],
    name: 'grantPauser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'accountId', type: 'uint256' },
          { internalType: 'uint32', name: 'weight', type: 'uint32' },
        ],
        internalType: 'struct SplitsReceiver[]',
        name: 'receivers',
        type: 'tuple[]',
      },
    ],
    name: 'hashSplits',
    outputs: [{ internalType: 'bytes32', name: 'receiversHash', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'accountId', type: 'uint256' },
          {
            internalType: 'StreamConfig',
            name: 'config',
            type: 'uint256',
          },
        ],
        internalType: 'struct StreamReceiver[]',
        name: 'receivers',
        type: 'tuple[]',
      },
    ],
    name: 'hashStreams',
    outputs: [{ internalType: 'bytes32', name: 'streamsHash', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'oldStreamsHistoryHash',
        type: 'bytes32',
      },
      { internalType: 'bytes32', name: 'streamsHash', type: 'bytes32' },
      { internalType: 'uint32', name: 'updateTime', type: 'uint32' },
      { internalType: 'uint32', name: 'maxEnd', type: 'uint32' },
    ],
    name: 'hashStreamsHistory',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'streamsHistoryHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isPaused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'pauser', type: 'address' }],
    name: 'isPauser',
    outputs: [{ internalType: 'bool', name: 'isAddrPauser', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minAmtPerSec',
    outputs: [{ internalType: 'uint160', name: '', type: 'uint160' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextDriverId',
    outputs: [{ internalType: 'uint32', name: 'driverId', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newAdmin', type: 'address' }],
    name: 'proposeNewAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposedAdmin',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
    ],
    name: 'receivableStreamsCycles',
    outputs: [{ internalType: 'uint32', name: 'cycles', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
      { internalType: 'uint32', name: 'maxCycles', type: 'uint32' },
    ],
    name: 'receiveStreams',
    outputs: [{ internalType: 'uint128', name: 'receivedAmt', type: 'uint128' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
      { internalType: 'uint32', name: 'maxCycles', type: 'uint32' },
    ],
    name: 'receiveStreamsResult',
    outputs: [{ internalType: 'uint128', name: 'receivableAmt', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'driverAddr', type: 'address' }],
    name: 'registerDriver',
    outputs: [{ internalType: 'uint32', name: 'driverId', type: 'uint32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'pauser', type: 'address' }],
    name: 'revokePauser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'accountId', type: 'uint256' },
          { internalType: 'uint32', name: 'weight', type: 'uint32' },
        ],
        internalType: 'struct SplitsReceiver[]',
        name: 'receivers',
        type: 'tuple[]',
      },
    ],
    name: 'setSplits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
      {
        components: [
          { internalType: 'uint256', name: 'accountId', type: 'uint256' },
          {
            internalType: 'StreamConfig',
            name: 'config',
            type: 'uint256',
          },
        ],
        internalType: 'struct StreamReceiver[]',
        name: 'currReceivers',
        type: 'tuple[]',
      },
      { internalType: 'int128', name: 'balanceDelta', type: 'int128' },
      {
        components: [
          { internalType: 'uint256', name: 'accountId', type: 'uint256' },
          {
            internalType: 'StreamConfig',
            name: 'config',
            type: 'uint256',
          },
        ],
        internalType: 'struct StreamReceiver[]',
        name: 'newReceivers',
        type: 'tuple[]',
      },
      { internalType: 'uint32', name: 'maxEndHint1', type: 'uint32' },
      { internalType: 'uint32', name: 'maxEndHint2', type: 'uint32' },
    ],
    name: 'setStreams',
    outputs: [{ internalType: 'int128', name: 'realBalanceDelta', type: 'int128' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
      {
        components: [
          { internalType: 'uint256', name: 'accountId', type: 'uint256' },
          { internalType: 'uint32', name: 'weight', type: 'uint32' },
        ],
        internalType: 'struct SplitsReceiver[]',
        name: 'currReceivers',
        type: 'tuple[]',
      },
    ],
    name: 'split',
    outputs: [
      {
        internalType: 'uint128',
        name: 'collectableAmt',
        type: 'uint128',
      },
      { internalType: 'uint128', name: 'splitAmt', type: 'uint128' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'accountId', type: 'uint256' },
          { internalType: 'uint32', name: 'weight', type: 'uint32' },
        ],
        internalType: 'struct SplitsReceiver[]',
        name: 'currReceivers',
        type: 'tuple[]',
      },
      { internalType: 'uint128', name: 'amount', type: 'uint128' },
    ],
    name: 'splitResult',
    outputs: [
      {
        internalType: 'uint128',
        name: 'collectableAmt',
        type: 'uint128',
      },
      { internalType: 'uint128', name: 'splitAmt', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'accountId', type: 'uint256' }],
    name: 'splitsHash',
    outputs: [{ internalType: 'bytes32', name: 'currSplitsHash', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
    ],
    name: 'splittable',
    outputs: [{ internalType: 'uint128', name: 'amt', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
      { internalType: 'uint256', name: 'senderId', type: 'uint256' },
      { internalType: 'bytes32', name: 'historyHash', type: 'bytes32' },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'streamsHash',
            type: 'bytes32',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'accountId',
                type: 'uint256',
              },
              {
                internalType: 'StreamConfig',
                name: 'config',
                type: 'uint256',
              },
            ],
            internalType: 'struct StreamReceiver[]',
            name: 'receivers',
            type: 'tuple[]',
          },
          { internalType: 'uint32', name: 'updateTime', type: 'uint32' },
          { internalType: 'uint32', name: 'maxEnd', type: 'uint32' },
        ],
        internalType: 'struct StreamsHistory[]',
        name: 'streamsHistory',
        type: 'tuple[]',
      },
    ],
    name: 'squeezeStreams',
    outputs: [{ internalType: 'uint128', name: 'amt', type: 'uint128' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
      { internalType: 'uint256', name: 'senderId', type: 'uint256' },
      { internalType: 'bytes32', name: 'historyHash', type: 'bytes32' },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'streamsHash',
            type: 'bytes32',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'accountId',
                type: 'uint256',
              },
              {
                internalType: 'StreamConfig',
                name: 'config',
                type: 'uint256',
              },
            ],
            internalType: 'struct StreamReceiver[]',
            name: 'receivers',
            type: 'tuple[]',
          },
          { internalType: 'uint32', name: 'updateTime', type: 'uint32' },
          { internalType: 'uint32', name: 'maxEnd', type: 'uint32' },
        ],
        internalType: 'struct StreamsHistory[]',
        name: 'streamsHistory',
        type: 'tuple[]',
      },
    ],
    name: 'squeezeStreamsResult',
    outputs: [{ internalType: 'uint128', name: 'amt', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'accountId', type: 'uint256' },
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
    ],
    name: 'streamsState',
    outputs: [
      { internalType: 'bytes32', name: 'streamsHash', type: 'bytes32' },
      {
        internalType: 'bytes32',
        name: 'streamsHistoryHash',
        type: 'bytes32',
      },
      { internalType: 'uint32', name: 'updateTime', type: 'uint32' },
      { internalType: 'uint128', name: 'balance', type: 'uint128' },
      { internalType: 'uint32', name: 'maxEnd', type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: 'driverId', type: 'uint32' },
      { internalType: 'address', name: 'newDriverAddr', type: 'address' },
    ],
    name: 'updateDriverAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IERC20', name: 'erc20', type: 'address' },
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'uint256', name: 'amt', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export type DripsAbi = typeof dripsAbi;
