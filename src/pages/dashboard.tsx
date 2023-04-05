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
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { UserRole } from "@prisma/client";
import { api } from "../utils/api";
import { authOptions } from "../server/auth";
import { getDescriptionPreview } from "../utils/description";
import { getFormattedDateString } from "../utils/date";
import { getServerSession } from "next-auth";
import { useForm } from "@mantine/form";
import { useState } from "react";
import Head from "../components/Head";
import vodsPerPage from "../constants/vodsPerPage";
import type { GetServerSideProps, NextPage } from "next";

interface InsertVODFormPieceValues {
  readonly jsonURL: string;
  readonly mp4URL: string;
}

interface InsertVODFormValues {
  readonly streamDate: Date | null;
  readonly description: string;
  readonly pieces: InsertVODFormPieceValues[];
}

interface UpdateVODFormPieceValues {
  readonly jsonURL: string;
  readonly mp4URL: string;
}

interface UpdateVODFormValues {
  readonly streamDate: Date | null;
  readonly description: string;
  readonly pieces: UpdateVODFormPieceValues[];
}

const Dashboard: NextPage = () => {
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
  const [isAddingVOD, setIsAddingVOD] = useState(false);
  const insertVODForm = useForm<InsertVODFormValues>({
    initialValues: {
      streamDate: null,
      description: "",
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
  const updateVODForm = useForm<UpdateVODFormValues>({
    initialValues: {
      streamDate: null,
      description: "",
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
  const [vodIDToUpdate, setVODIDToUpdate] = useState<string | null>(null);
  const vodToUpdate =
    vodIDToUpdate !== null
      ? vods?.find((vod) => vod.id === vodIDToUpdate) ?? null
      : null;
  const updateVODMutation = api.vod.updateVOD.useMutation();
  const [vodIDToDelete, setVODIDToDelete] = useState<string | null>(null);
  const vodToDelete =
    vodIDToDelete !== null
      ? vods?.find((vod) => vod.id === vodIDToDelete) ?? null
      : null;
  const deleteVODMUtation = api.vod.deleteVOD.useMutation();
  return (
    <>
      <Head description="Admin dashboard for EvanMMO's content creation and game development site" />
      <Title id="videos" color="gray.0" mb="md">
        VODs
      </Title>
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
      {typeof vodsCount !== "undefined" && (
        <Pagination
          value={vodsPage}
          onChange={setVODsPage}
          mb="md"
          total={Math.ceil(vodsCount / vodsPerPage)}
          withEdges
        />
      )}
      {vods && typeof vodsCount !== "undefined" && (
        <SimpleGrid
          cols={4}
          spacing="md"
          breakpoints={[{ maxWidth: "sm", cols: 2 }]}
        >
          {vods.map((vod) => {
            return (
              <Card
                style={{ flexDirection: "column" }}
                display="flex"
                key={vod.id}
              >
                <Text size="lg" mb="sm">
                  {getFormattedDateString(vod.streamDate)}
                </Text>
                {getDescriptionPreview(vod.description)
                  .split("\n")
                  .map((line, key) => (
                    <Text key={key}>{line}</Text>
                  ))}
                <Box mt="auto">
                  <Button
                    mr="sm"
                    mt="sm"
                    onClick={() => {
                      updateVODForm.setValues({
                        streamDate: vod.streamDate,
                        description: vod.description,
                        pieces: vod.pieces.map((piece) => ({
                          jsonURL: piece.jsonURL || "",
                          mp4URL: piece.mp4URL,
                        })),
                      });
                      setVODIDToUpdate(vod.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    color="red"
                    mt="xs"
                    onClick={() => {
                      setVODIDToDelete(vod.id);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
      {typeof vodsCount !== "undefined" && (
        <Pagination
          value={vodsPage}
          onChange={setVODsPage}
          total={Math.ceil(vodsCount / vodsPerPage)}
          withEdges
          mt="sm"
        />
      )}
      <Modal
        opened={isAddingVOD}
        onClose={() => {
          setIsAddingVOD(false);
          insertVODForm.reset();
        }}
        title="Add VOD"
        fullScreen
      >
        {Object.keys(insertVODForm.errors).length > 0 && (
          <Text color="red" mb="xs">
            There are invalid field(s).
          </Text>
        )}
        <form
          onSubmit={insertVODForm.onSubmit((values) => {
            setIsAddingVOD(false);
            insertVODForm.reset();
            insertVODMutation
              .mutateAsync({
                streamDate: values.streamDate as Date,
                description: values.description,
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
                {...insertVODForm.getInputProps("streamDate")}
              />
              <Textarea
                label="Description"
                mb="sm"
                {...insertVODForm.getInputProps("description")}
              />
            </Tabs.Panel>
            <Tabs.Panel value="pieces" pt="xs">
              {insertVODForm.values.pieces.map((piece, index) => (
                <Box key={index} mb="sm">
                  <Text>Piece {index + 1}</Text>
                  <TextInput
                    withAsterisk
                    label="MP4 URL"
                    {...insertVODForm.getInputProps(`pieces.${index}.mp4URL`)}
                  />
                  <TextInput
                    label="JSON URL"
                    {...insertVODForm.getInputProps(`pieces.${index}.jsonURL`)}
                    mb="sm"
                  />
                  <Button
                    color="red"
                    onClick={() => {
                      insertVODForm.removeListItem("pieces", index);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              ))}
              <Button
                onClick={() => {
                  insertVODForm.insertListItem("pieces", {
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
      <Modal
        opened={vodToUpdate !== null}
        onClose={() => {
          setVODIDToUpdate(null);
          updateVODForm.reset();
        }}
        title="Edit VOD"
        fullScreen
      >
        {Object.keys(updateVODForm.errors).length > 0 && (
          <Text color="red" mb="xs">
            There are invalid field(s).
          </Text>
        )}
        <form
          onSubmit={updateVODForm.onSubmit((values) => {
            if (vodToUpdate !== null) {
              setVODIDToUpdate(null);
              updateVODForm.reset();
              updateVODMutation
                .mutateAsync({
                  id: vodToUpdate.id,
                  streamDate: values.streamDate as Date,
                  description: values.description,
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
            }
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
                {...updateVODForm.getInputProps("streamDate")}
              />
              <Textarea
                label="Description"
                mb="sm"
                {...updateVODForm.getInputProps("description")}
              />
            </Tabs.Panel>
            <Tabs.Panel value="pieces" pt="xs">
              {updateVODForm.values.pieces.map((piece, index) => (
                <Box key={index} mb="sm">
                  <Text>Piece {index + 1}</Text>
                  <TextInput
                    withAsterisk
                    label="MP4 URL"
                    {...updateVODForm.getInputProps(`pieces.${index}.mp4URL`)}
                  />
                  <TextInput
                    label="JSON URL"
                    {...updateVODForm.getInputProps(`pieces.${index}.jsonURL`)}
                    mb="sm"
                  />
                  <Button
                    color="red"
                    onClick={() => {
                      updateVODForm.removeListItem("pieces", index);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              ))}
              <Button
                onClick={() => {
                  updateVODForm.insertListItem("pieces", {
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
      <Modal
        opened={vodToDelete !== null}
        onClose={() => {
          setVODIDToDelete(null);
        }}
        title="Delete VOD"
      >
        {vodToDelete && (
          <>
            <Text>
              Are you sure that you would like delete VOD{" "}
              {getFormattedDateString(vodToDelete?.streamDate)}?
            </Text>
            <Button
              color="red"
              mr="sm"
              mt="sm"
              onClick={() => {
                deleteVODMUtation
                  .mutateAsync({ id: vodToDelete.id })
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
              }}
            >
              Delete
            </Button>
            <Button
              mt="xs"
              onClick={() => {
                setVODIDToDelete(null);
              }}
            >
              Cancel
            </Button>
          </>
        )}
      </Modal>
    </>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  return { props: {}, notFound: session?.user.role !== UserRole.ADMIN };
};
