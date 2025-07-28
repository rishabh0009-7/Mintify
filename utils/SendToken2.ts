import {
    Connection,
    PublicKey,
    Transaction,
    LAMPORTS_PER_SOL
  } from '@solana/web3.js';


  import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAccount,
    TokenAccountNotFoundError
  } from '@solana/spl-token';
import { SimpleTokenInfo } from './SendToken';
  
export interface SimpleTokenInfo {
    mint: string;
    balance: number;
    decimals: number;
    symbol: string;
    name: string;
    rawBalance: string; 
  }
  


//   1- fetch all tokens owned by user 

export const async function fetchUserToken (connection :Connection
    Wallet.PublicKey:PublicKey 
):  Promise<SimpleTokenInfo[]>{
    try {

        const token = await connection.getParsedTokenAccountsByOwner(

            wallet.PublicKey,
            {
                programId :TOKEN_PROGRAM_ID
            }
            
        )

        const tokenInfo : SimpleTokenInfo[]=[]


        // process each token 

        for(const account of tokenAccount)





    } catch (error) {
        
    }

}