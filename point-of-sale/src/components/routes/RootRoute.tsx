import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { PublicKey } from '@solana/web3.js';
import React, { FC, useMemo } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { DEVNET_ENDPOINT } from '../../utils/constants';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { FullscreenProvider } from '../contexts/FullscreenProvider';
import { PaymentProvider } from '../contexts/PaymentProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import { TransactionsProvider } from '../contexts/TransactionsProvider';
import { SolanaPayLogo } from '../images/SolanaPayLogo';
import { SOLIcon } from '../images/SOLIcon';
import * as css from './RootRoute.module.pcss';

import { MAINNET_ENDPOINT, MAINNET_USDC_MINT } from '../../utils/constants';
import { USDCIcon } from '../images/USDCIcon';

export const RootRoute: FC = () => {
    // If you're testing without a phone, set this to true to allow a browser-based wallet connection to be used
    const connectWallet = false;
    const wallets = useMemo(
        () => (connectWallet ? [new PhantomWalletAdapter(), new TorusWalletAdapter()] : []),
        [connectWallet]
    );

    const [params] = useSearchParams();
    const { recipient, label } = useMemo(() => {
        let recipient: PublicKey | undefined, label: string | undefined;

        const recipientParam = params.get('recipient');
        const labelParam = params.get('label');
        if (recipientParam && labelParam) {
            try {
                recipient = new PublicKey(recipientParam);
                label = labelParam;
            } catch (error) {
                console.error(error);
            }
        }

        return { recipient, label };
    }, [params]);

    return (
        <ThemeProvider>
            <FullscreenProvider>
                {recipient && label ? (
                    <ConnectionProvider endpoint={MAINNET_ENDPOINT}>
                        <WalletProvider wallets={wallets} autoConnect={connectWallet}>
                            <WalletModalProvider>
                                <ConfigProvider
                                    recipient={recipient}
                                    label={label}
                                    splToken={MAINNET_USDC_MINT}
                                    symbol="USDC"
                                    icon={<USDCIcon />}
                                    decimals={6}
                                    minDecimals={2}
                                    connectWallet={connectWallet}
                                >
                                    <TransactionsProvider>
                                        <PaymentProvider>
                                            <Outlet />
                                        </PaymentProvider>
                                    </TransactionsProvider>
                                </ConfigProvider>
                            </WalletModalProvider>
                        </WalletProvider>
                    </ConnectionProvider>
                ) : (
                    <div className={css.logo}>
                        <SolanaPayLogo width={240} height={88} />
                    </div>
                )}
            </FullscreenProvider>
        </ThemeProvider>
    );
};
