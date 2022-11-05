import axios from "axios";
import { BigNumber } from "ethers";

const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}`;

export const generateCallData = async (params: any) => {
  const response = await axios.get(`${baseUrl}/api/submitRecord`, {
    params: params,
  });
  const { mintData } = response.data;
  return {
    mintData: mintData ? convertCallDataToIntegers(mintData) : null,
  };
};

// Helper
const convertCallDataToIntegers = (responseData: {
  a: Array<string>;
  b: Array<Array<string>>;
  c: Array<string>;
  Input: Array<string>;
}) => {
  const a = responseData.a.map((item: any) => BigNumber.from(item));
  // Loop through array in b and convert to BigNumber.from
  const b = responseData.b.map((item: any) => {
    return item.map((subItem: any) => BigNumber.from(subItem));
  });
  const c = responseData.c.map((item: any) => BigNumber.from(item));
  const inputs = responseData.Input.map((item: any) => parseInt(item));
  return { a, b, c, inputs };
};
