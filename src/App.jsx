import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { create } from "ipfs-http-client";
import SignatureCanvas from "react-signature-canvas";
import Web3 from "web3";
import classnames from "classnames";

let web3 = new Web3(window.ethereum);
const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

export const StyledButton = styled.button`
  padding: 8px;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  console.log(`blockchain`, blockchain);
  const data = useSelector((state) => state.data);
  console.log("data", data);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [NFTS, setNFTS] = useState([]);
  const elementRef = useRef();

  const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/";

  const fileRef = React.useRef(null);
  const nameRef = React.useRef(null);
  const descriptionRef = React.useRef(null);

  const mint = (_uri) => {
    blockchain.smartContract.methods
      .mint(blockchain.account, _uri)
      .send({ from: blockchain.account })
      .once("error", (err) => {
        console.log(err);
        setLoading(false);
        setStatus("Error");
      })
      .then((receipt) => {
        console.log(receipt);
        setLoading(false);
        clearCanvas();
        dispatch(fetchData(blockchain.account));
        setStatus("Successfully minting your NFT");
      });
  };

  const createMetaDataAndMint = async (
    _name,
    _des,
    _imgBuffer,
    _audioBuffer
  ) => {
    setLoading(true);
    setStatus("Uploading to IPFS");
    try {
      const addedImage = await ipfsClient.add(_imgBuffer);

      console.log("_audioBuffer", _audioBuffer);
      const addedAudio = await ipfsClient.add(_audioBuffer);
      console.log(addedAudio);

      const metaDataObj = {
        name: _name,
        description: _des,
        image: ipfsBaseUrl + addedImage.path,
        audio: ipfsBaseUrl + addedAudio.path,
      };

      const addedMetaData = await ipfsClient.add(JSON.stringify(metaDataObj));
      console.log(ipfsBaseUrl + addedMetaData.path);
      mint(ipfsBaseUrl + addedMetaData.path);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setStatus("Error");
    }
  };

  const startMintingProcess = async () => {
    createMetaDataAndMint(
      nameRef.current.value,
      descriptionRef.current.value,
      getImageData(),
      await getFileData()
    );
  };

  const getImageData = () => {
    const canvasEl = elementRef.current;
    let dataUrl = canvasEl.toDataURL("image/png");
    const buffer = Buffer(dataUrl.split(",")[1], "base64");
    return buffer;
  };

  const getFileData = async () => {
    const inputEl = fileRef.current;
    var files = inputEl.files;
    // console.log(files);
    var filesArr = Array.prototype.slice.call(files);
    // console.log(filesArr);
    const file = filesArr[0];
    // console.log(file)
    const buffer = Buffer.from(await file.arrayBuffer());
    // const buffer = new Uint8Array(await file.arrayBuffer())
    return buffer;
  };

  const fetchMetatDataForNFTS = () => {
    setNFTS([]);
    data.allTokens.forEach((nft) => {
      fetch(nft.uri)
        .then((response) => response.json())
        .then((metaData) => {
          setNFTS((prevState) => [
            ...prevState,
            { id: nft.id, metaData: metaData },
          ]);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };

  const clearCanvas = () => {
    const canvasEl = elementRef.current;
    canvasEl.clear();
    nameRef.current.value = "";
    descriptionRef.current.value = "";
  };

  useEffect(() => {
    dispatch(fetchData());
  }, []);

  useEffect(() => {
    console.log(NFTS);
  }, [NFTS]);

  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  }, [blockchain.smartContract, dispatch]);

  useEffect(() => {
    fetchMetatDataForNFTS();
  }, [data.allTokens]);

  const handleSubmission = (e) => {
    e.preventDefault();
    console.log(e);
  };

  const Header = ({}) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
    const toggleMenu = () => {
      setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    const ProfileMenu = ({ isOpen }) => {
      if (!isOpen) {
        return null;
      }
      return (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          tabIndex={-1}
        >
          <a
            href="#"
            className="block py-2 px-4 text-sm text-gray-700"
            role="menuitem"
            tabIndex={-1}
            id="user-menu-item-0"
          >
            Your Profile
          </a>

          <a
            href="#"
            className="block py-2 px-4 text-sm text-gray-700"
            role="menuitem"
            tabIndex={-1}
            id="user-menu-item-1"
          >
            Settings
          </a>

          <a
            href="#"
            className="block py-2 px-4 text-sm text-gray-700"
            role="menuitem"
            tabIndex={-1}
            id="user-menu-item-2"
          >
            Sign out
          </a>
        </div>
      );
    };

    return (
      <div className="bg-gradient-to-b from-black to-transparent pt-8 text-white">
        <header className="header">
          <div className="relative z-10 px-2 flex lg:px-0">
            <div className="flex-shrink-0 space-x-2 flex items-center">
              <img
                className="block h-6 w-auto"
                src="/assets/iconset/red/512.png"
                alt="TypeBeat Logo"
              />
              <p className="headline" className="font-black ">
                TypeBeat
              </p>
            </div>
          </div>

          <nav
            className="hidden lg:py-2 lg:flex lg:space-x-8"
            aria-label="Global"
          >
            <a
              href="#"
              className="py-2 px-3 inline-flex items-center"
              aria-current="page"
            >
              <p className=" " className="title3">
                Book a session
              </p>
            </a>

            <a href="#" className="py-2 px-3 inline-flex items-center">
              <p className=" title3">Find a beat</p>
            </a>

            <a href="#" className="py-2 px-3 inline-flex items-center">
              <p className="title3 nav--link nav--link__selected">
                Find stems & samples
              </p>
            </a>
          </nav>

          <div className="relative z-10 ml-4 flex items-center space-x-4">
            <a
              href="#"
              className="py-2 px-3 inline-flex items-center hidden sm:block"
            >
              <p className="title3"> Become a host</p>
            </a>
            <div className="flex-shrink-0 relative ml-4">
              <button
                onClick={toggleMenu}
                type="button"
                className="button button__secondary button__xs button__round"
              >
                <div
                  className="rounded-md p-2 inline-flex items-center justify-center text-secondary focus:outline-none"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open menu</span>

                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>
                <div
                  className="bg-gray-800 rounded-full flex text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8"
                    id="user-avatar"
                    src="https://ik.imagekit.io/83dpwdi5fkr/Frame_2x_ZtQJERqU08.png"
                  />
                </div>
              </button>
              <ProfileMenu isOpen={isProfileMenuOpen} />
            </div>
          </div>
        </header>
      </div>
    );
  };

  const NFT = ({ nft }) => {
    console.log(nft.metaData);
    return (
      <s.Container ai="center" style={{ padding: 16 }}>
      <div className="mb-8">
        <p className="title">
          {nft.metaData.name}
        </p>
        <p className="subtitle">
          {nft.metaData.description}
        </p>
        </div>
        <img className="rounded-full mb-8 mx-auto" alt={nft.metaData.name} src={nft.metaData.image} width={"66%"} />
        {nft?.metaData?.audio && (
          <figure className="mb-8 mx-auto">
            <audio controls controlsList="nodownload" className="" src={nft.metaData.audio}>
              Your browser does not support the
              <code>audio</code> element.
            </audio>
          </figure>
        )}
      </s.Container>
    );
  };

  const Gallery = () => {
    return data.loading ? (
      <>
        <s.SpacerSmall />
        <s.TextDescription style={{ textAlign: "center" }}>
          loading...
        </s.TextDescription>
      </>
    ) : (
      <section className="space-y-6 text-white">
        <p className="headline">Samples & Stems</p>
        <section className="grid">
          {NFTS.map((nft, index) => {
            return <NFT key={index} nft={nft} />;
          })}
        </section>
      </section>
    );
  };

  const Login = () => {
    return (
      <s.Container flex={1} ai={"center"} jc={"center"}>
        <p className="text-white title">Welcome to TypeBeat</p>
        <p className="text-white caption">Connect your wallet to get going.</p>
        <s.SpacerSmall />

        <button
          onClick={(e) => {
            e.preventDefault();
            dispatch(connect());
          }}
          className="button button__primary"
        >
          Connect
        </button>
        <s.SpacerSmall />
        {blockchain.errorMsg !== "" ? (
          <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
        ) : null}
      </s.Container>
    );
  };

  const Main = () => {
    return (
      <s.Container flex={1} ai={"center"} style={{ padding: 24 }}>
        <s.TextTitle style={{ textAlign: "center" }}>
          Welcome mint your signature
        </s.TextTitle>
        {loading ? (
          <>
            <s.SpacerSmall />
            <s.TextDescription style={{ textAlign: "center" }}>
              loading...
            </s.TextDescription>
          </>
        ) : null}
        {status !== "" ? (
          <>
            <s.SpacerSmall />
            <s.TextDescription style={{ textAlign: "center" }}>
              {status}
            </s.TextDescription>
          </>
        ) : null}
        <s.SpacerLarge />

        <s.SpacerLarge />
        {!loading && (
          <>
            <form onSubmit={handleSubmission}>
              <SignatureCanvas
                backgroundColor={"#FF385C"}
                canvasProps={{ width: 350, height: 350 }}
                ref={elementRef}
              />
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white"
                >
                  Name
                </label>
                <div className="mt-1">
                  <input
                    style={{
                      background: "none",
                      color: "white",
                    }}
                    id="name"
                    name="name"
                    type="text"
                    ref={nameRef}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neutral-900 focus:border-neutral-900 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white"
                >
                  description
                </label>
                <div className="mt-1">
                  <input
                    style={{
                      background: "none",
                      color: "white",
                    }}
                    id="description"
                    name="description"
                    type="text"
                    ref={descriptionRef}
                    required
                    className="appearance-none block text-white w-full px-3 py-2 border border-neutral-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neutral-900 focus:border-neutral-900 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <input
                  style={{ color: "white" }}
                  ref={fileRef}
                  type="file"
                  name="audio"
                />
              </div>
            </form>
            <s.Container fd={"row"} jc={"center"}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  startMintingProcess();
                }}
                className="button button__primary"
                type="submit"
              >
                Mint
              </button>
              <s.SpacerSmall />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  clearCanvas();
                }}
                className="button button__secondary"
                type="submit"
              >
                Clear
              </button>
            </s.Container>
          </>
        )}
        <Gallery />
        <s.SpacerLarge />
      </s.Container>
    );
  };

  const Form = () => {
    return <div></div>;
  };

  return (
    <>
      <s.Screen>
        {blockchain.account === "" || blockchain.smartContract === null ? (
          <Login />
        ) : (
          <>
            <Header />
            <Main />
          </>
        )}
      </s.Screen>
    </>
  );
}

export default App;
