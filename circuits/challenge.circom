pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/comparators.circom";

template Challenge () {
    signal input threshold;
    signal input rank;
    signal output out;

    component lte = LessEqThan(9);
    lte.in[0] <== threshold;
    lte.in[1] <== rank;
    lte.out === 1;

    out <== lte.out;
}

component main { public [threshold ]} = Challenge();

/* INPUT = {
    "threshold": "2",
    "rank": "3"
} */