# TypeBeat NFT Marketplace
Developed during Ethereum Developer Bootcamp.
Link to [Whitepaper](https://docs.google.com/document/d/1JRfE4wy4jBkEVg8bb1g9-23AAJ1Co7mIS5Qfja9s7eE/edit?usp=sharing)

## Steps to run this application

Clone this repo

Install the project
``` 
yarn add all
```

## Compile the contract

To compile the contract, just go

```
truffle compile --network mumbai
```

## Testing Contract

In a new terminal start a local blockchain using
```
truffle develop
```

To test:
```
truffle test --network develop
```

## Configuring Deployment

Now to deploy the NFT contract on the Ropsten Testnet.

First, make sure you get some ropsten testnet Ether.  You can get some here: https://faucet.dimensions.network/

Next, set up a ropsten provider. You can get one from https://alchemyapi.io or from https://infura.io/

It should look like: https://eth-ropsten.alchemyapi.io/v2/......

Next, configure network providers in *truffle-config.js*.
You must add your own *12 word account seed phrase* by creating a **.secret** file in the base folder.
<br>

## Deploy Contract

If everything is configured properly, you can now deploy. In your terminal, run the deploy command

```
truffle migrate --reset --network rinkeby
```

## Important

After testing please remove the **.json** files from *src/contracts/* before each newer contract deployment.