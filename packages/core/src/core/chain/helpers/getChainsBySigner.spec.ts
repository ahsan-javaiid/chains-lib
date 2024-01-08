import { DiContainer } from '../../../common/di';
import * as Chain from '../../chain';
import { Coin } from '../../coin';
import { Msg, MsgData } from '../../msg';
import * as Signer from '../../signer';
import { Transaction, TransactionData } from '../../transaction';
import { getChainsBySigner } from '../../chain/helpers';
import { ChainDecorator, SignerDecorator } from '../../decorators';
import { FeeOptions } from '../../fee';
import { Balance, FeeData, Response } from '../../../core';

const createChainProvider = () => {
  return class extends Chain.Provider {
    get manifest(): Chain.Manifest {
      return {} as Chain.Manifest;
    }

    getBalance(): Promise<Response<Coin[], Balance[]>> {
      throw new Error('Method not implemented.');
    }

    getTransactions(_address: string, _afterBlock?: number): Promise<Response<Transaction[], any>> {
      throw new Error('Method not implemented.');
    }

    estimateFee(_msgs: Msg[]): Promise<FeeData[]> {
      throw new Error('Method not implemented.');
    }

    broadcast(_msgs: Msg[]): Promise<Transaction[]> {
      throw new Error('Method not implemented.');
    }

    createMsg(_data: MsgData): Msg {
      throw new Error('Method not implemented.');
    }

    gasFeeOptions(): Promise<FeeOptions> {
      throw new Error('Method not implemented.');
    }

    getNonce(_address: string): Promise<number> {
      throw new Error('Method not implemented.');
    }

    getNFTBalance(_address: string): Promise<any> {
      throw new Error('Method not implemented.');
    }

    getTransaction(_txHash: string): Promise<TransactionData | null> {
      throw new Error('Method not implemented.');
    }
  };
};

describe('getChainsBySigner', () => {
  beforeEach(() => {
    DiContainer.unbindAll();
  });

  it('should return 0 chains', () => {
    expect(getChainsBySigner(Signer.SignerType.LEDGER)).toHaveLength(0);
  });

  // it('should return 2 chains for LEDGER', () => {
  //   const firstSigner = SignerDecorator(Signer.SignerType.LEDGER)(class {});
  //   ChainDecorator('firstChainProvider', { deps: [firstSigner] })(createChainProvider());

  //   const secondSigner = SignerDecorator(Signer.SignerType.LEDGER)(class {});
  //   ChainDecorator('secondChainProvider', { deps: [secondSigner] })(createChainProvider());

  //   expect(getChainsBySigner(Signer.SignerType.LEDGER)).toHaveLength(2);
  // });

  // it('should return 1 chain for LEDGER and 1 for TREZOR', () => {
  //   const firstSigner = SignerDecorator(Signer.SignerType.LEDGER)(class {});
  //   ChainDecorator('firstChainProvider', { deps: [firstSigner] })(createChainProvider());

  //   const secondSigner = SignerDecorator(Signer.SignerType.TREZOR)(class {});
  //   ChainDecorator('secondChainProvider', { deps: [secondSigner] })(createChainProvider());

  //   expect(getChainsBySigner(Signer.SignerType.LEDGER)).toHaveLength(1);
  //   expect(getChainsBySigner(Signer.SignerType.TREZOR)).toHaveLength(1);
  // });
});
