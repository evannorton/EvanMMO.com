import {
  Box,
  Button,
  Modal,
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
  return (
    <>
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
            insertVODMutation.mutate({
              streamDate: values.streamDate as Date,
              pieces: values.pieces.map((piece) => ({
                jsonURL: piece.jsonURL.length > 0 ? piece.jsonURL : null,
                mp4URL: piece.mp4URL,
              })),
            });
          })}
        >
          <Tabs defaultValue="data" mb="md">
            <Tabs.List>
              <Tabs.Tab value="data">Data</Tabs.Tab>
              <Tabs.Tab value="pieces">Pieces</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="data" pt="xs">
              <DateInput
                withAsterisk
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
        onClick={() => {
          setIsAddingVOD(true);
        }}
      >
        Add VOD
      </Button>
    </>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  return { props: {}, notFound: session?.user.role !== UserRole.ADMIN };
};
