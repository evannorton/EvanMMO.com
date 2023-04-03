import {
  Box,
  Button,
  Card,
  Loader,
  Modal,
  Pagination,
  SimpleGrid,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { UserRole } from "@prisma/client";
import { api } from "../utils/api";
import { authOptions } from "../server/auth";
import { getServerSession } from "next-auth";
import { useForm } from "@mantine/form";
import { useState } from "react";
import Head from "../components/Head";
import vodsPerPage from "../constants/vodsPerPage";
import type { GetServerSideProps, NextPage } from "next";

interface VODPieceCreationInput {
  readonly jsonURL: string;
  readonly mp4URL: string;
}

interface VODCreationFormValues {
  readonly streamDate: Date | null;
  readonly pieces: VODPieceCreationInput[];
}

const Dashboard: NextPage = () => {
  const [isAddingVOD, setIsAddingVOD] = useState(false);
  const vodForm = useForm<VODCreationFormValues>({
    initialValues: {
      streamDate: null,
      pieces: [],
    },
    validate: {
      streamDate: (value) =>
        value === null ? "You must specify a stream date" : null,
      pieces: {
        mp4URL: (value) =>
          value.length === 0 ? "You must specify an MP4 URL" : null,
      },
    },
  });
  const insertVODMutation = api.vod.insertVOD.useMutation();
  const [vodsPage, setVODsPage] = useState(1);
  const {
    data: vods,
    isLoading: isLoadingVODs,
    refetch: refetchVODs,
  } = api.vod.getAll.useQuery({
    page: vodsPage - 1,
  });
  const {
    data: vodsCount,
    isLoading: isLoadingVODsCount,
    refetch: refetchVODsCount,
  } = api.vod.getCount.useQuery();
  return (
    <>
      <Head description="Admin dashboard for EvanMMO's content creation and game development site" />
      <Title id="videos" color="gray.0" mb="md">
        VODs
      </Title>
      <Modal
        opened={isAddingVOD}
        onClose={() => {
          setIsAddingVOD(false);
        }}
        title="Add VOD"
        fullScreen
      >
        {Object.keys(vodForm.errors).length > 0 && (
          <Text color="red" mb="xs">
            There are invalid field(s).
          </Text>
        )}
        <form
          onSubmit={vodForm.onSubmit((values) => {
            setIsAddingVOD(false);
            vodForm.reset();
            insertVODMutation
              .mutateAsync({
                streamDate: values.streamDate as Date,
                pieces: values.pieces.map((piece) => ({
                  jsonURL: piece.jsonURL.length > 0 ? piece.jsonURL : null,
                  mp4URL: piece.mp4URL,
                })),
              })
              .then(() => {
                refetchVODs().catch((e) => {
                  throw e;
                });
                refetchVODsCount().catch((e) => {
                  throw e;
                });
              })
              .catch((e) => {
                throw e;
              });
          })}
        >
          <Tabs defaultValue="data" mb="lg">
            <Tabs.List>
              <Tabs.Tab value="data">Data</Tabs.Tab>
              <Tabs.Tab value="pieces">Pieces</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="data" pt="xs">
              <DateInput
                withAsterisk
                weekendDays={[]}
                label="Stream date"
                valueFormat="YYYY-MM-DD"
                mb="sm"
                firstDayOfWeek={0}
                {...vodForm.getInputProps("streamDate")}
              />
            </Tabs.Panel>
            <Tabs.Panel value="pieces" pt="xs">
              {vodForm.values.pieces.map((piece, index) => (
                <Box key={index} mb="sm">
                  <Text>Piece {index + 1}</Text>
                  <TextInput
                    withAsterisk
                    label="MP4 URL"
                    {...vodForm.getInputProps(`pieces.${index}.mp4URL`)}
                  />
                  <TextInput
                    label="JSON URL"
                    {...vodForm.getInputProps(`pieces.${index}.jsonURL`)}
                    mb="sm"
                  />
                  <Button
                    color="red"
                    onClick={() => {
                      vodForm.removeListItem("pieces", index);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              ))}
              <Button
                onClick={() => {
                  vodForm.insertListItem("pieces", {
                    jsonURL: "",
                    mp4URL: "",
                  });
                }}
              >
                Add piece
              </Button>
            </Tabs.Panel>
          </Tabs>
          <Button type="submit">Submit</Button>
        </form>
      </Modal>
      <Button
        display="block"
        onClick={() => {
          setIsAddingVOD(true);
        }}
        mb="md"
      >
        Add VOD
      </Button>
      {(isLoadingVODs || isLoadingVODsCount) && <Loader />}
      {vods && typeof vodsCount !== "undefined" && (
        <>
          <Pagination
            value={vodsPage}
            onChange={setVODsPage}
            mb="md"
            total={Math.ceil(vodsCount / vodsPerPage)}
            withEdges
          />
          <SimpleGrid
            cols={4}
            spacing="md"
            breakpoints={[{ maxWidth: "sm", cols: 2 }]}
          >
            {vods.map((vod) => (
              <Card key={vod.id}>
                <Text size="lg">
                  {vod.streamDate.getFullYear()}-
                  {`${vod.streamDate.getMonth() + 1}`.padStart(2, "0")}-
                  {`${vod.streamDate.getDate()}`.padStart(2, "0")}
                </Text>
                <Button mr="sm" mt="sm">
                  Edit
                </Button>
                <Button color="red" mt="xs">
                  Delete
                </Button>
              </Card>
            ))}
          </SimpleGrid>
          <Pagination
            value={vodsPage}
            onChange={setVODsPage}
            total={Math.ceil(vodsCount / vodsPerPage)}
            withEdges
            mt="sm"
          />
        </>
      )}
    </>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  return { props: {}, notFound: session?.user.role !== UserRole.ADMIN };
};
