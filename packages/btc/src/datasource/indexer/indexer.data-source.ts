import {
  Asset,
  DataSource,
  Coin,
  GasFeeSpeed,
  Transaction,
  Injectable,
  Chain,
  TransactionsFilter,
  BalanceFilter,
  Balance,
} from '@xdefi/chains-core';
import { utils } from 'ethers';
import { Observable } from 'rxjs';
import BigNumber from 'bignumber.js';

import { BitcoinFees } from '../../types';
import { BitcoinChainMessage } from '../../bitcoinMessage';

import { getBalance, getStatus, getTransaction, getFees } from './queries';

@Injectable()
export class IndexerDataSource extends DataSource {
  constructor(manifest: Chain.Manifest) {
    super(manifest);
  }

  async getBalance(filter: BalanceFilter): Promise<Coin[]> {
    const { address } = filter;
    const {
      data: { bitcoin },
    } = await getBalance(address);

    return bitcoin.balances.reduce((result, balance) => {
      const { asset, amount } = balance;
      if (asset.id && asset.symbol && asset.name) {
        result.push(
          new Coin(
            new Asset({
              id: asset.id,
              chainId: this.manifest.chainId,
              name: asset.name,
              symbol: asset.symbol,
              icon: asset.image,
              native: !Boolean(asset.contract),
              address: asset.contract,
              price: asset.price?.amount,
              decimals: amount.scalingFactor,
            }),
            utils.formatUnits(amount.value, amount.scalingFactor)
          )
        );
      }
      return result;
    }, [] as Coin[]);
  }

  async subscribeBalance(
    _filter: BalanceFilter
  ): Promise<Observable<Balance[]>> {
    throw new Error('Method not implemented.');
  }

  private async getBlockRange(afterBlock: number | string) {
    const { data } = await getStatus();

    return {
      from: parseInt(`${afterBlock}`),
      to: data.bitcoin.status.lastBlock,
    };
  }

  async getTransactions(filter: TransactionsFilter): Promise<Transaction[]> {
    const { address, afterBlock } = filter;

    const blockRange =
      typeof afterBlock === 'number' || typeof afterBlock === 'string'
        ? await this.getBlockRange(afterBlock)
        : null;

    const { data } = await getTransaction(address, blockRange);

    return data.bitcoin.transactions.edges.map(({ node: transaction }) =>
      Transaction.fromData(transaction)
    );
  }

  async subscribeTransactions(
    _filter: TransactionsFilter
  ): Promise<Observable<Transaction>> {
    throw new Error('Method not implemented.');
  }

  async estimateFee(
    messages: BitcoinChainMessage[],
    speed: GasFeeSpeed
  ): Promise<BitcoinChainMessage[]> {
    const feeOptions = await this.gasFeeOptions();
    if (!feeOptions) return messages;
    return messages.map((message) =>
      message.setFees({
        fee: new BigNumber(feeOptions[speed]),
        maxFee: new BigNumber(feeOptions[GasFeeSpeed.high]),
      })
    );
  }

  async gasFeeOptions(): Promise<BitcoinFees> {
    const { data } = await getFees();
    const bitcoinFeeOptions = data.chains.find(
      ({ name }) => name === 'Bitcoin'
    );

    return bitcoinFeeOptions && bitcoinFeeOptions.fee.value
      ? JSON.parse(bitcoinFeeOptions.fee.value)
      : null;
  }

  async getNonce(_address: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
