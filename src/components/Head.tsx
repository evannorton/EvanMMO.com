import NextHead from "next/head";

interface HeadProps {
  readonly description: string;
}

const Head: React.FC<HeadProps> = ({ description }) => {
  return (
    <NextHead>
      <title>EvanMMO</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.png" />
    </NextHead>
  );
};

export default Head;
