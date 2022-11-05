import * as snarkjs from "snarkjs";

const challengeWasm = "./lib/challenge.wasm";
const challengeZkey = "./lib/challenge.zkey";

export async function generateMintData(address, rank) {
  try {
    const inputSignal = {
      threshold: 2,
      rank: rank,
    };
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputSignal,
      challengeWasm,
      challengeZkey
    );
    const calldata = await snarkjs.groth16.exportSolidityCallData(
      proof,
      publicSignals
    );
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());
    console.log("ARGV", calldata);
    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = [];

    for (let i = 8; i < argv.length; i++) {
      Input.push(argv[i]);
    }

    return { a, b, c, Input };
  } catch (e) {
    console.log("Error occured while generateMintData");
    return null;
  }
}
