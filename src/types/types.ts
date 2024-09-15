export type Token = {
  chunk: string;
  core: string;
  highlight: boolean;
  bright: boolean;
  endOfLine: boolean;
};

export type Data = {
  text1: {
    plain: string;
    tokenized: Token[];
  };
  text2: {
    plain: string;
    tokenized: Token[];
  };
};
