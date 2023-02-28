import {
    BaseRepository,
    Chain,
    ChainDecorator,
    Coin,
    GasFee,
    GasFeeSpeed,
    Msg,
    Response,
    Transaction,
    Balance
} from '@xdefi/chains-core';
import { providers } from 'ethers';
import 'reflect-metadata';
import { ChainMsg } from './msg';
import { some } from 'lodash';
import { PrivateKeySigner } from './signers';


@ChainDecorator('EthereumProvider', {
    deps: [PrivateKeySigner],
    providerType: 'EVM',
})
export class EvmProvider extends Chain.Provider {
    private rpcProvider: providers.StaticJsonRpcProvider;

    constructor(chainRepository: BaseRepository) {
        super(chainRepository);
        this.rpcProvider = new providers.StaticJsonRpcProvider(
            this.chainRepository.manifest.rpcURL
        );
    }

    createMsg(data: Msg.Data): Msg {
        return new ChainMsg(data);
    }

    async broadcast(msgs: Msg[]): Promise<Transaction[]> {
        if (some(msgs, (msg) => !msg.hasSignature)) {
            throw new Error('Some message do not have signature, sign it first');
        }

        const transactions = [];

        for (let msg of msgs) {
            const tx = await this.rpcProvider.sendTransaction(
                msg.signature as string
            );
            transactions.push(Transaction.fromData(tx));
        }

        return transactions;
    }

    async getTransactions(address: string, afterBlock?: number | string): Promise<Response<Transaction[], Transaction>> {
        return new Response(
            () => this.chainRepository.getTransactions({ address, afterBlock}),
            () => this.chainRepository.subscribeTransactions({ address })
        )
    }

    async estimateFee(msgs: Msg[], speed: GasFeeSpeed): Promise<Msg[]> {
        return this.chainRepository.estimateFee(msgs, speed);
    }

    async getBalance(address: string): Promise<Response<Coin[], Balance[]>> {
        return new Response(
            () => this.chainRepository.getBalance({ address }),
            () => this.chainRepository.subscribeBalance({ address })
        );
    }

    async gasFeeOptions(): Promise<GasFee> {
        return this.chainRepository.gasFeeOptions();
    }

    async getNonce(address: string): Promise<number> {
        return this.chainRepository.getNonce(address);
    }
}
