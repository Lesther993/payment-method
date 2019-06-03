"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = {
    firebaseConfig: {
        credential: require("../../serviceAccountKey.json"),
        databaseURL: "https://johnalley-806c6.firebaseio.com"
    },
    server: {
        api: 'http://xchange.website/api/cointoken',
    },
    blockchain: {
        ETH: {
            nodeURL: 'http://localhost:8545',
            listenerTimer: 13 * 1000,
            securePlatformWallet: {
                address: '0x3ec195ce275e6cfdb16717651b16edb58b7a57b4',
                privateKey: 'f06e9140d88790204171d32ce1c0b8b6eb089367e8fd754ead07c33445e9cb21'
            },
        },
        LTC: {
            nodeURL: 'http://localhost:9332',
            listenerTimer: 2.5 * 60 * 1000,
            securePlatformWallet: {
                address: 'LR1nUdrTaQe2Qq74GdCUfGDmejNk4oMDd1',
                privateKey: '9e4076f04cc1fcbff030820ebdf4d4a5c4fdb276fba0ea02de5ea77e27367c1c'
            },
            network: {
                messagePrefix: '\x19Litecoin Signed Message:\n',
                bip32: {
                    public: 0x019da462,
                    private: 0x019d9cfe
                },
                pubKeyHash: 0x30,
                scriptHash: 0x32,
                wif: 0xb0
            }
        },
        BTC: {
            nodeURL: 'http://localhost:8332',
            listenerTimer: 10 * 60 * 1000,
            securePlatformWallet: {
                address: '1Azs841iccVqXDQi17AzaqQw5idwxUzsh',
                privateKey: '3455d339e133fdbe947e5e0a3a37f0f996de5fdf7a04d9e41eaf4396bb9191b7',
            },
            network: {
                messagePrefix: '\x18Bitcoin Signed Message:\n',
                bech32: 'bc',
                bip32: {
                    public: 0x0488b21e,
                    private: 0x0488ade4
                },
                pubKeyHash: 0x00,
                scriptHash: 0x05,
                wif: 0x80
            },
        },
        DASH: {
            nodeURL: 'http://localhost:9998',
            listenerTimer: 2.5 * 60 * 1000,
            securePlatformWallet: {
                address: 'XgmNF8BAmexqPuwNv8hx2mM3TBK2u3XK1q',
                privateKey: 'e70c35a52e13955768c53036a628eb5e0c62be6bb6552f3a928a6072d353f6cd'
            },
            network: {
                messagePrefix: '\x19Dash Signed Message:\n',
                bip32: {
                    public: 0x0488b21e,
                    private: 0x0488ade4
                },
                pubKeyHash: 0x4c,
                scriptHash: 0x10,
                wif: 0xcc
            }
        },
        ZEC: {
            nodeURL: 'http://localhost:8232',
            listenerTimer: 2.5 * 60 * 1000,
            securePlatformWallet: {
                address: 't1UcxwTiYYRcUXNkPyjzpTEPX5G6hkGePiE',
                privateKey: 'cb05dff12ae2abbf7939eefc45c251e2021e06ad26a3d8d0048575c1a2d2949c'
            },
            network: {
                messagePrefix: '\x19Zcash Signed Message:\n',
                bip32: {
                    public: 0x0488b21e,
                    private: 0x0488ade4
                },
                pubKeyHash: 0x1cb8,
                scriptHash: 0x1cbd,
                wif: 0x80
            }
        },
        DOGE: {
            nodeURL: 'http://localhost:22555',
            listenerTimer: 1 * 60 * 1000,
            securePlatformWallet: {
                address: 'DDEwLwbpA7yfmSzoNpaKm26kd4MfXoax2k',
                privateKey: 'fb45955befa014dedcb65ae4d38a95c0fd6e30b6e664bfa603916c559dad8cb8',
            },
            network: {
                messagePrefix: '\x18Dogecoin Signed Message:\n',
                bip32: {
                    public: 0x02facafd,
                    private: 0x02fac398
                },
                pubKeyHash: 0x1e,
                scriptHash: 0x16,
                wif: 0x9e
            }
        },
        BCH: {
            nodeURL: 'http://localhost:8332',
            securePlatformWallet: {
                address: 'qqwvgpn5uagskpwezs5ruwwmunrmnf0h0c8crhdsxc',
                privateKey: 'a6b0702b615f379445062c40df881ed35d8f5d2fa0b0207a19cb4241c261604d',
                legacyAddress: '13d6kSfFLgm9QXSVhgsX2EpvR3JHemrE6e'
            },
            network: {
                messagePrefix: '\x18Bitcoin Signed Message:\n',
                bech32: 'bc',
                bip32: {
                    public: 0x0488b21e,
                    private: 0x0488ade4
                },
                pubKeyHash: 0x00,
                scriptHash: 0x05,
                wif: 0x80
            },
        },
        PPC: {
            nodeURL: 'http://localhost:9902',
            listenerTimer: 10 * 60 * 1000,
            securePlatformWallet: {
                address: 'PK9vnEbxoupURwU2JHQb4B2LSTty71Hf97',
                privateKey: '35c8459295664d2bcc09001afcdd65ebde917f0321d2dc2c79bae7028affb376',
            },
            network: {
                messagePrefix: '\x18Peercoin Signed Message:\n',
                bip32: {
                    public: 0x0488b21e,
                    private: 0x0488ade4
                },
                pubKeyHash: 0x37,
                scriptHash: 0x75,
                wif: 0xb7
            }
        },
        XRP: {
            nodeURL: 'http://localhost:5005',
            socketURL: 'ws://localhost:6006',
            listenerTimer: 1 * 60 * 1000,
            securePlatformWallet: {
                address: 'rh2XpwHDPesuqDfRpHGN522GoF6YF1Zmvy',
                secret: 'shkLDh2AispMsctr7B6vPiNPA6inE',
            },
        }
    },
    tokens: [
        {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
            contractAddress: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'VeChain Token',
            symbol: 'VEN',
            decimals: 18,
            contractAddress: '0xD850942eF8811f2A866692A623011bDE52a462C1',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'OMGToken',
            symbol: 'OMG',
            decimals: 18,
            contractAddress: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
            contractABI: require("../../ABI.json")
        },
        {
            name: '0x Protocol Token',
            symbol: 'ZRX',
            decimals: 18,
            contractAddress: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Basic Attention Token',
            symbol: 'BAT',
            decimals: 18,
            contractAddress: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Pundi X Token',
            symbol: 'NPXS',
            decimals: 18,
            contractAddress: '0xA15C7Ebe1f07CaF6bFF097D8a589fb8AC49Ae5B3',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'ChainLink Token',
            symbol: 'LINK',
            decimals: 18,
            contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Aurora',
            symbol: 'AOA',
            decimals: 18,
            contractAddress: '0x9ab165D795019b6d8B3e971DdA91071421305e5a',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'TrueUSD',
            symbol: 'TUSD',
            decimals: 18,
            contractAddress: '0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'HoloToken',
            symbol: 'HOT',
            decimals: 18,
            contractAddress: '0x6c6EE5e31d828De241282B9606C8e98Ea48526E2',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Decentraland MANA',
            symbol: 'MANA',
            decimals: 18,
            contractAddress: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Status Network Token',
            symbol: 'SNT',
            decimals: 18,
            contractAddress: '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'HuobiToken',
            symbol: 'HT',
            decimals: 18,
            contractAddress: '0x6f259637dcD74C767781E37Bc6133cd6A68aa161',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'ODEM Token',
            symbol: 'ODEM',
            decimals: 18,
            contractAddress: '0xbf52F2ab39e26E0951d2a02b49B7702aBe30406a',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'IOSToken',
            symbol: 'IOST',
            decimals: 18,
            contractAddress: '0xFA1a856Cfa3409CFa145Fa4e20Eb270dF3EB21ab',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Walton Token',
            symbol: 'WTC',
            decimals: 18,
            contractAddress: '0xb7cB1C96dB6B22b0D3d9536E0108d062BD488F74',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Insight Chain',
            symbol: 'INB',
            decimals: 18,
            contractAddress: '0x17Aa18A4B64A55aBEd7FA543F2Ba4E91f2dcE482',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Nexo',
            symbol: 'NEXO',
            decimals: 18,
            contractAddress: '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Oyster Pearl',
            symbol: 'PRL',
            decimals: 18,
            contractAddress: '0x1844b21593262668B7248d0f57a220CaaBA46ab9',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Bancor Network Token',
            symbol: 'BNT',
            decimals: 18,
            contractAddress: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
            contractABI: require("../../ABI.json")
        },
        {
            name: 'Tether USD',
            symbol: 'USDT',
            decimals: 6,
            contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            contractABI: require("../../ABI.json")
        },
    ],
    contractABI: require("../../ABI.json")
};
