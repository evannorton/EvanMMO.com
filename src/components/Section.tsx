import { Box } from "@mantine/core";

interface Props {
  readonly children: JSX.Element;
}

const Section: React.FC<Props> = ({ children }) => {
  return <Box mb="md">{children}</Box>;
};

export default Section;
