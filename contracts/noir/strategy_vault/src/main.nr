use std::hash::pedersen_hash;

// AgentArena - Strategy Commitment Proof
// Allows agent owners to commit to a strategy hash before a game starts.
// At the end of the game, they reveal their strategy struct, proving
// it matches the hash they committed to prior to the game,
// preventing mid-game AI prompt switching.

fn main(
    aggression: u8,         // Private: slider 0-100
    risk_tolerance: u8,     // Private: slider 0-100
    bluff_frequency: u8,    // Private: slider 0-100
    secret: Field,          // Private: blinding factor
    commitment: pub Field,  // Public: on-chain hash
) {
    let mut inputs: [Field; 4] = [0; 4];
    inputs[0] = aggression as Field;
    inputs[1] = risk_tolerance as Field;
    inputs[2] = bluff_frequency as Field;
    inputs[3] = secret;

    let calcd_hash = pedersen_hash(inputs);

    assert(calcd_hash == commitment);
}
