import NextHead from "next/head";

interface Props {
  readonly description: string;
  readonly title?: string;
}

const Head: React.FC<Props> = ({ description, title }) => {
  const titlePieces = ["EvanMMO"];
  if (typeof title !== "undefined") {
    titlePieces.push(title);
  }
  return (
    <NextHead>
      <title>{titlePieces.join(" - ")}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.png" />
    </NextHead>
  );
};

export default Head;
