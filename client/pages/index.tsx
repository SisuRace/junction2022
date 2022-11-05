import { ConnectButton } from "@rainbow-me/rainbowkit";
import { utils } from "ethers";
import type { NextPage } from "next";
import Image from "next/image";
import React, { useCallback } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import sbtAbi from "../abi/SisuSBT.json";
import { generateCallData } from "../services/api";

const verifierContractAddress = "0xcdC246b61E04939017B35ff8480D1b224C6c0F09";

const sbtContractConfig = {
  address: "0x47E24647056b2f20856a5b0b1Bd5B542F0A0A552",
  abi: sbtAbi,
  onSuccess(data: any) {
    console.log("success", data);
  },
  onError(error: any) {
    console.log("error", error);
  },
};

const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [totalMinted, setTotalMinted] = React.useState(0);
  const [getHasSoul, setHasSoul] = React.useState(false);
  const { isConnected, address } = useAccount();

  const [getCallData, setCallData] = React.useState({});

  const [getScore, setScore] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [getVerificationAddress, setVerificationAddress] = React.useState("");
  const [getVerificationStatus, setVerificationStatus] = React.useState(null);
  // Mint SBT
  const { config: contractWriteConfig } = usePrepareContractWrite({
    ...sbtContractConfig,
    functionName: "mint",
    args: [getCallData.a, getCallData.b, getCallData.c, getCallData.inputs],
  });

  const {
    data: mintData,
    write: mint,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite(contractWriteConfig);

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });
  const isMinted = txSuccess;

  // Total Supply
  const { data: totalSupplyData } = useContractRead({
    ...sbtContractConfig,
    functionName: "totalSBT",
    watch: true,
  });

  // SBT Data
  const { data: sbtData } = useContractRead({
    ...sbtContractConfig,
    functionName: "getSBTData",
    watch: true,
    args: [address],
  });

  const { data: addressVerified } = useContractRead({
    ...sbtContractConfig,
    functionName: "validateAttribute",
    watch: true,
    args: [getVerificationAddress, verifierContractAddress],
  });

  // Check if user has SBT
  const { data: hasSoul } = useContractRead({
    ...sbtContractConfig,
    functionName: "hasSoul",
    watch: true,
    args: [address],
  });

  const { data: verifyingAddressHasSoul } = useContractRead({
    ...sbtContractConfig,
    functionName: "hasSoul",
    watch: true,
    args: [getVerificationAddress],
  });

  React.useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData.toNumber());
    }
  }, [totalSupplyData]);

  React.useEffect(() => {
    if (hasSoul) {
      setHasSoul(true);
    } else {
      setHasSoul(false);
    }
  }, [hasSoul]);

  React.useEffect(() => {
    if (addressVerified) {
      setVerificationStatus(true);
    }
  }, [getVerificationAddress]);

  function handleScoreChange(e: any) {
    setScore(e.target.value);
    setSubmitted(false);
  }
  function handleVerificationAddressChange(e: any) {
    setVerificationAddress(e.target.value);
    if (addressVerified) {
      setVerificationStatus(true);
    }
  }
  /** Event Handler */

  const getCallDataFromServer = useCallback(async () => {
    return generateCallData({ address: address, score: getScore });
  }, [getScore]);

  async function handleSubmitButtonClick() {
    // check if credit score is valid
    if (isNaN(parseInt(getScore))) {
      alert("Please enter a valid challenge score");
      return;
    }
    if (parseInt(getScore) > 1000) {
      alert("Challenge Score cannot be greater than 1000");
      return;
    }
    const { mintData } = await getCallDataFromServer();
    setSubmitted(true);
    // set state as a callback
    if (mintData) {
      setCallData(mintData);
    }
  }

  async function handleVerifyButtonClick() {
    // check if the input is a valid address
    if (!utils.isAddress(getVerificationAddress)) {
      setVerificationStatus(null);
      alert("Please enter a valid address");
      return;
    }
    // // check if the address has a SBT
    if (!verifyingAddressHasSoul) {
      setVerificationStatus(false);
      alert("Address does not have a SBT");
      return;
    }

    // check if the address has been verified
    if (addressVerified) {
      setVerificationStatus(true);
      return;
    } else if (!addressVerified) {
      setVerificationStatus(false);
      return;
    }
  }

  return (
    <div className="flex flex-col w-200">
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img
            src="/sisurace.png"
            alt="SisuRace Platform"
            className="max-w-sm max-h-min rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">Mint SBT in SisuRace!</h1>
            <p className="py-6">
              In SisuRace, users get ranked and honored by submitting challenge
              records, and those who get ranked will be able to mint SBTs based
              on zero-knowledge proofs, which are associated with the user's
              address and are non-transferable, and record their challenge
              scores, which can be decentralized and verified through smart
              contracts without revealing the original information.
            </p>
            <a className="btn btn-primary" href="#step1">
              Get Start
            </a>
          </div>
        </div>
      </div>
      <div className="bg-base-100 min-h-screen py-20" id="step1">
        <div className="flex-col lg:flex-row-reverse">
          <div className="grid grid-cols-3 gap-4">
            <div className="place-self-center">
              <ul className="steps steps-vertical">
                <li className="step step-primary">Login</li>
                <li className="step">Submit Record</li>
                <li className="step">Mint SBT</li>
                <li className="step">Verify SBT</li>
              </ul>
            </div>
            <div className="col-span-2">
              <h1>1. Login with your wallet address</h1>
              <p>
                Before you do anything, make sure you have some Goerli ETH, you
                can get some Testnet ETH from{" "}
                <a
                  className="link link-warning"
                  href="https://faucet.paradigm.xyz/"
                  target="_blank"
                >
                  faucet
                </a>
                .
              </p>
              <div className="my-20">
                <ConnectButton />
              </div>

              <a className="btn btn-success" href="#step2">
                Next Step
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className=" bg-base-200 min-h-screen py-20" id="step2">
        <div className="flex-col lg:flex-row-reverse">
          <div className="grid grid-cols-3 gap-4">
            <div className="place-self-center">
              <ul className="steps steps-vertical">
                <li className="step step-primary">Login</li>
                <li className="step step-primary">Submit Record</li>
                <li className="step">Mint SBT</li>
                <li className="step">Verify SBT</li>
              </ul>
            </div>
            <div>
              <h1>2. Submit your challenge record</h1>
              <p>
                <a
                  className="link link-warning"
                  target="_blank"
                  href="https://www.speedrun.com/minesweeper/full_game?h=Expert_No_RNG_Manipulation&x=vdoevokp"
                >
                  Minesweeper
                </a>{" "}
                is a classic single player game, the goal of the game is to find
                all the squares without mines to complete the game; if you press
                the squares with mines, the game fails. The game is rated by the
                completion time.
              </p>
              <div className="mt-10 mb-10">
                <form>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">
                        Enter your challenge score:
                      </span>
                    </label>
                    <label className="input-group input-group-sm">
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={getScore}
                        onChange={handleScoreChange}
                      />
                      <span>Seconds</span>
                    </label>
                  </div>
                </form>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleSubmitButtonClick()}
              >
                Submit
              </button>
              {submitted && getScore && (
                <p style={{ marginTop: 24, color: "#FF6257" }}>
                  Your challenge score: {getScore}.{" "}
                  {parseInt(getScore) < 200 && "You're able to mint a SBT."}
                </p>
              )}
              <div className="mt-20">
                <a className="btn btn-success" href="#step3">
                  Next Step
                </a>
              </div>
            </div>
            <div>
              <Image
                layout="responsive"
                src="/saolei.png"
                width="500"
                height="500"
                alt="Demo Challenge Game"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-base-100 min-h-screen py-20" id="step3">
        <div className="flex-col lg:flex-row-reverse">
          <div className="grid grid-cols-3 gap-4">
            <div className="place-self-center">
              <ul className="steps steps-vertical">
                <li className="step step-primary">Login</li>
                <li className="step step-primary">Submit Record</li>
                <li className="step step-primary">Mint SBT</li>
                <li className="step">Verify SBT</li>
              </ul>
            </div>
            <div className="col-span-2">
              <h1>
                3. If your challenge score is above 200 seconds, you are be able
                to mint SBT with zk proofs.
              </h1>
              <p className="pr-40">
                Your challenge record belongs to the value data, condensing the
                labor of individual creation, and you can mint SBT to record the
                challenge results on the chain for permanent preservation.
              </p>
              <h2 className="mt-10">{totalMinted} SBT minted so far! </h2>
              {mintError && (
                <p style={{ marginTop: 24, color: "#FF6257" }}>
                  Error: {mintError.message}
                </p>
              )}
              {txError && (
                <p style={{ marginTop: 24, color: "#FF6257" }}>
                  Error: {txError.message}
                </p>
              )}
              {mounted && isConnected && getHasSoul && (
                <div>
                  <p style={{ marginTop: 24, color: "#FF6257" }}>
                    You have already minted an SBT! <br />
                  </p>
                  <p>SBT details:</p>
                  <span className="block ">
                    {sbtData?.map((item, index) => {
                      return (
                        <a
                          target="_blank"
                          href="https://goerli.etherscan.io/address/0x51B543C4a9d38E747a3c1963b76E42d8Ad696ef4#readContract"
                          rel="noreferrer"
                        >
                          <p className="font-light break-all" key={index}>
                            {item.toString().slice(0, 50)}...
                          </p>
                        </a>
                      );
                    })}
                  </span>
                </div>
              )}

              {mounted && isConnected && !isMinted && (
                <button
                  style={{ marginTop: 24 }}
                  disabled={
                    !mint ||
                    isMintLoading ||
                    isMintStarted ||
                    parseInt(getScore) >= 200
                  }
                  className="btn btn-secondary"
                  data-mint-loading={isMintLoading}
                  data-mint-started={isMintStarted}
                  onClick={() => mint?.()}
                >
                  {isMintLoading && "Waiting for approval"}
                  {isMintStarted && "Minting..."}
                  {!isMintLoading && !isMintStarted && "Mint"}
                </button>
              )}
              <div className="mt-20">
                <a className="btn btn-success" href="#step4">
                  Next Step
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-base-200 min-h-screen py-20" id="step4">
        <div className="flex-col lg:flex-row-reverse">
          <div className="grid grid-cols-3 gap-4">
            <div className="place-self-center">
              <ul className="steps steps-vertical">
                <li className="step step-primary">Login</li>
                <li className="step step-primary">Submit Record</li>
                <li className="step step-primary">Mint SBT</li>
                <li className="step step-primary">Verify SBT</li>
              </ul>
            </div>
            <div>
              <h1>4. Verification of SBT</h1>
              <p className="pb-5">
                Input in any address to verify if their challenge score is above
                200s.
              </p>
              <form>
                <label
                  title="Try clicking again if its unverified"
                  className="font-light mt-5"
                >
                  Address to verify:
                </label>
                <input
                  type="text"
                  style={{ marginTop: 4 }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Input an address you want to verify"
                  required
                  value={getVerificationAddress}
                  onChange={handleVerificationAddressChange}
                />
              </form>
              <div style={{ padding: "12px 0px 12px 100px" }}>
                {mounted && isConnected && (
                  <button
                    style={{ marginTop: 4 }}
                    className="btn btn-primary"
                    onClick={handleVerifyButtonClick}
                  >
                    Verify
                  </button>
                )}
              </div>
              <div>
                {getVerificationStatus === true && (
                  <span>
                    <p>Address has a SBT with challenge score above 200s</p>
                  </span>
                )}
                {getVerificationStatus === false && (
                  <p>
                    Address does not have a SBT with challenge score above 200s
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
