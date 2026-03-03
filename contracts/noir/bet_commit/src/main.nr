use std::hash::pedersen_hash;

// AgentArena - ZK Bet Commitment Circuit
// Proves knowledge of (amount, position, secret) that hashes to public `commitment`
// without revealing the actual values on-chain.

fn main(
    amount: u64,           // Private: bet size
    position: u8,          // Private: 0 for Agent A, 1 for Agent B
    secret: Field,         // Private: blinding factor to prevent brute force
    commitment: pub Field, // Public: the hash stored on-chain
) {
    // We construct an array of the inputs to hash
    let mut inputs: [Field; 3] = [0; 3];
    inputs[0] = amount as Field;
    inputs[1] = position as Field;
    inputs[2] = secret;

    // Use Pedersen hash for efficient SNARK friendly hashing
    let calculated_hash = pedersen_hash(inputs);

    // Assert that the calculated hash matches the public commitment
    assert(calculated_hash == commitment);
}
