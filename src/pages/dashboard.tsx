import { UserRole } from "@prisma/client";
import { authOptions } from "../server/auth";
import { getServerSession } from "next-auth";
import type { GetServerSideProps, NextPage } from "next";

const Dashboard: NextPage = () => {
  return <>Dashboard</>;
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  return { props: {}, notFound: session?.user.role !== UserRole.ADMIN };
};
