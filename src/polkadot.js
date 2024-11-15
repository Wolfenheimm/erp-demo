import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

let api;

export async function connectToBlockchain() {
  if (!api) {
    const provider = new WsProvider('ws://127.0.0.1:9944'); // Replace with your node's WebSocket URL
    api = await ApiPromise.create({ provider });
  }
  return api;
}

// Call the inventory_insertion extrinsic
export async function callInventoryInsertion(senderSeed, item, cancellationToken) {
  const api = await connectToBlockchain();

  const keyring = new Keyring({ type: 'sr25519' });
  const sender = keyring.addFromUri(senderSeed); // Use seed phrase or mnemonic

  // Prepare the extrinsic
  const extrinsic = api.tx.inventory.inventoryInsertion(item);

  // Sign and send the transaction
  return new Promise((resolve, reject) => {
    extrinsic
      .signAndSend(sender, { nonce: -1 }, ({ status, events, dispatchError }) => {
        if (status.isInBlock) {
          console.log(`Transaction included at blockHash ${status.asInBlock}`);
          resolve(status.asInBlock.toHex());
        } else if (status.isFinalized) {
          console.log(`Transaction finalized at blockHash ${status.asFinalized}`);
        } else if (dispatchError) {
          if (dispatchError.isModule) {
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, name, section } = decoded;
            reject(new Error(`${section}.${name}: ${docs.join(' ')}`));
          } else {
            reject(dispatchError.toString());
          }
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}