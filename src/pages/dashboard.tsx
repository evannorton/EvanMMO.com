import {
  Box,
  Button,
  Card,
  Loader,
  Modal,
  Pagination,
  Popover,
  SimpleGrid,
  Slider,
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
import EmojiPicker, { Theme } from "emoji-picker-react";
import Head from "../components/Head";
import vodsPerPage from "../constants/vodsPerPage";
import type { EmojiClickData } from "emoji-picker-react";
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

interface InsertSoundboardSoundFormValues {
  readonly name: string;
  readonly url: string;
}

interface UpdateSoundboardSoundFormValues {
  readonly name: string;
  readonly url: string;
}

const DashboardPage: NextPage = () => {
  const {
    data: soundboardSounds,
    isLoading: isLoadingSoundboardSounds,
    refetch: refetchSoundboardSounds,
  } = api.soundboard.getSoundboardSounds.useQuery();
  const [isAddingSoundboardSound, setIsAddingSoundboardSound] = useState(false);
  const insertSoundboardSoundForm = useForm<InsertSoundboardSoundFormValues>({
    initialValues: {
      name: "",
      url: "",
    },
    validate: {
      name: (value) => (value.length === 0 ? "You must specify a name" : null),
      url: (value) => (value.length === 0 ? "You must specify a URL" : null),
    },
  });
  const updateSoundboardSoundForm = useForm<UpdateSoundboardSoundFormValues>({
    initialValues: {
      name: "",
      url: "",
    },
    validate: {
      name: (value) => (value.length === 0 ? "You must specify a name" : null),
      url: (value) => (value.length === 0 ? "You must specify a URL" : null),
    },
  });
  const insertSoundboardSoundMutation =
    api.soundboard.insertSoundboardSound.useMutation();
  const updateSoundEmojiMutation =
    api.soundboard.updateSoundboardSoundEmoji.useMutation();
  const updateSoundVolumeMutation =
    api.soundboard.updateSoundboardSoundVolume.useMutation();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<string | null>(null);
  const [volumePopoverOpen, setVolumePopoverOpen] = useState<string | null>(
    null
  );
  const [tempSoundVolumes, setTempSoundVolumes] = useState<
    Record<string, number>
  >({});
  const [soundboardSoundIDToUpdate, setSoundboardSoundIDToUpdate] = useState<
    string | null
  >(null);
  const soundboardSoundToUpdate =
    soundboardSoundIDToUpdate !== null
      ? soundboardSounds?.find(
          (sound) => sound.id === soundboardSoundIDToUpdate
        ) ?? null
      : null;
  const updateSoundboardSoundMutation =
    api.soundboard.updateSoundboardSound.useMutation();
  const [soundboardSoundIDToDelete, setSoundboardSoundIDToDelete] = useState<
    string | null
  >(null);
  const soundboardSoundToDelete =
    soundboardSoundIDToDelete !== null
      ? soundboardSounds?.find(
          (sound) => sound.id === soundboardSoundIDToDelete
        ) ?? null
      : null;
  const deleteSoundboardSoundMutation =
    api.soundboard.deleteSoundboardSound.useMutation();

  const [vodsPage, setVODsPage] = useState(1);
  const {
    data: vods,
    isLoading: isLoadingVODs,
    refetch: refetchVODs,
  } = api.vod.getVODs.useQuery({
    page: vodsPage - 1,
  });
  const {
    data: vodsCount,
    isLoading: isLoadingVODsCount,
    refetch: refetchVODsCount,
  } = api.vod.getVODsCount.useQuery();
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
      <Title order={2} color="gray.0" mb="md">
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
      {typeof vodsCount !== "undefined" && (
        <Pagination
          value={vodsPage}
          onChange={setVODsPage}
          mb="md"
          total={Math.ceil(vodsCount / vodsPerPage)}
          withEdges
        />
      )}
      {(isLoadingVODs || isLoadingVODsCount) && <Loader />}
      {vods && typeof vodsCount !== "undefined" && (
        <SimpleGrid
          cols={4}
          spacing="sm"
          breakpoints={[{ maxWidth: "sm", cols: 2 }]}
        >
          {vods.map((vod) => {
            return (
              <Card
                sx={{ flexDirection: "column", borderRadius: "0.5rem" }}
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
                      const diff =
                        vod.streamDate.getTimezoneOffset() * 60 * 1000;
                      updateVODForm.setValues({
                        streamDate: new Date(vod.streamDate.getTime() + diff),
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
      <Title order={2} color="gray.0" mt="xl" mb="md">
        Soundboard
      </Title>
      <Button
        display="block"
        onClick={() => {
          setIsAddingSoundboardSound(true);
        }}
        mb="md"
      >
        Add Sound
      </Button>
      {isLoadingSoundboardSounds && <Loader />}
      {soundboardSounds && (
        <SimpleGrid
          cols={4}
          spacing="sm"
          breakpoints={[{ maxWidth: "sm", cols: 2 }]}
          mb="xl"
        >
          {soundboardSounds.map((sound) => {
            const soundVolume = sound?.soundVolume ?? 100;
            const currentDisplayVolume =
              tempSoundVolumes[sound.id] ?? soundVolume;

            return (
              <Card
                style={{ overflow: "visible" }}
                sx={{ flexDirection: "column", borderRadius: "0.5rem" }}
                display="flex"
                key={sound.id}
              >
                <Text size="lg" mb="sm">
                  {sound.emoji && `${sound.emoji} `}
                  {sound.name}
                </Text>
                <Box mt="auto">
                  <Button
                    mr="sm"
                    mt="sm"
                    onClick={() => {
                      const audio = new Audio(sound.url);
                      audio.volume = soundVolume / 100;
                      audio.play().catch((e) => {
                        console.error("Error playing sound:", e);
                      });
                    }}
                  >
                    Play
                  </Button>
                  <Button
                    mr="sm"
                    mt="sm"
                    onClick={() => {
                      updateSoundboardSoundForm.setValues({
                        name: sound.name,
                        url: sound.url,
                      });
                      setSoundboardSoundIDToUpdate(sound.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Popover
                    opened={emojiPickerOpen === sound.id}
                    onClose={() => setEmojiPickerOpen(null)}
                    position="bottom"
                    withArrow
                    width={350}
                  >
                    <Popover.Target>
                      <Button
                        mr="sm"
                        mt="sm"
                        variant="outline"
                        onClick={() =>
                          setEmojiPickerOpen(
                            emojiPickerOpen === sound.id ? null : sound.id
                          )
                        }
                        style={{ minWidth: "auto", padding: "8px 12px" }}
                      >
                        {sound.emoji || "😀"}
                      </Button>
                    </Popover.Target>
                    <Popover.Dropdown
                      style={{ height: "400px", overflow: "hidden" }}
                    >
                      <EmojiPicker
                        theme={Theme.DARK}
                        onEmojiClick={(emojiData: EmojiClickData) => {
                          updateSoundEmojiMutation
                            .mutateAsync({
                              id: sound.id,
                              emoji: emojiData.emoji,
                            })
                            .then(() => {
                              refetchSoundboardSounds().catch((e) => {
                                throw e;
                              });
                              setEmojiPickerOpen(null);
                            })
                            .catch((e) => {
                              throw e;
                            });
                        }}
                        width={320}
                        height={380}
                      />
                    </Popover.Dropdown>
                  </Popover>
                  <Popover
                    opened={volumePopoverOpen === sound.id}
                    onClose={() => setVolumePopoverOpen(null)}
                    position="bottom"
                    withArrow
                    width={200}
                  >
                    <Popover.Target>
                      <Button
                        mr="sm"
                        mt="sm"
                        variant="outline"
                        onClick={() =>
                          setVolumePopoverOpen(
                            volumePopoverOpen === sound.id ? null : sound.id
                          )
                        }
                        style={{ minWidth: "auto", padding: "8px 12px" }}
                      >
                        🔊
                      </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <div style={{ padding: "8px" }}>
                        <Text size="sm" mb="xs" color="gray.0">
                          Sound Volume: {currentDisplayVolume}%
                        </Text>
                        <Slider
                          value={currentDisplayVolume}
                          onChange={(newVolume) => {
                            setTempSoundVolumes((prev) => ({
                              ...prev,
                              [sound.id]: newVolume,
                            }));
                          }}
                          onChangeEnd={(newVolume) => {
                            updateSoundVolumeMutation
                              .mutateAsync({
                                id: sound.id,
                                soundVolume: newVolume,
                              })
                              .then(() => {
                                return refetchSoundboardSounds();
                              })
                              .then(() => {
                                setTempSoundVolumes((prev) => {
                                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                  const { [sound.id]: _, ...rest } = prev;
                                  return rest;
                                });
                              })
                              .catch((e: unknown) => {
                                throw e;
                              });
                          }}
                          min={0}
                          max={100}
                          step={1}
                          style={{ width: "100%" }}
                          size="sm"
                          color="blue"
                        />
                      </div>
                    </Popover.Dropdown>
                  </Popover>
                  <Button
                    color="red"
                    mt="xs"
                    onClick={() => {
                      setSoundboardSoundIDToDelete(sound.id);
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
            const diff =
              (values.streamDate as Date).getTimezoneOffset() * 60 * 1000;
            insertVODMutation
              .mutateAsync({
                streamDate: new Date(
                  (values.streamDate as Date).getTime() - diff
                ),
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

      {/* Soundboard Modals */}
      <Modal
        opened={isAddingSoundboardSound}
        onClose={() => {
          setIsAddingSoundboardSound(false);
          insertSoundboardSoundForm.reset();
        }}
        title="Add Sound"
      >
        {Object.keys(insertSoundboardSoundForm.errors).length > 0 && (
          <Text color="red" mb="xs">
            There are invalid field(s).
          </Text>
        )}
        <form
          onSubmit={insertSoundboardSoundForm.onSubmit((values) => {
            setIsAddingSoundboardSound(false);
            insertSoundboardSoundForm.reset();
            insertSoundboardSoundMutation
              .mutateAsync({
                name: values.name,
                url: values.url,
              })
              .then(() => {
                refetchSoundboardSounds().catch((e) => {
                  throw e;
                });
              })
              .catch((e) => {
                throw e;
              });
          })}
        >
          <TextInput
            withAsterisk
            label="Name"
            mb="sm"
            {...insertSoundboardSoundForm.getInputProps("name")}
          />
          <TextInput
            withAsterisk
            label="URL"
            mb="sm"
            {...insertSoundboardSoundForm.getInputProps("url")}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Modal>

      <Modal
        opened={soundboardSoundToUpdate !== null}
        onClose={() => {
          setSoundboardSoundIDToUpdate(null);
          updateSoundboardSoundForm.reset();
        }}
        title="Edit Sound"
      >
        {Object.keys(updateSoundboardSoundForm.errors).length > 0 && (
          <Text color="red" mb="xs">
            There are invalid field(s).
          </Text>
        )}
        <form
          onSubmit={updateSoundboardSoundForm.onSubmit((values) => {
            if (soundboardSoundToUpdate !== null) {
              setSoundboardSoundIDToUpdate(null);
              updateSoundboardSoundForm.reset();
              updateSoundboardSoundMutation
                .mutateAsync({
                  id: soundboardSoundToUpdate.id,
                  name: values.name,
                  url: values.url,
                })
                .then(() => {
                  refetchSoundboardSounds().catch((e) => {
                    throw e;
                  });
                })
                .catch((e) => {
                  throw e;
                });
            }
          })}
        >
          <TextInput
            withAsterisk
            label="Name"
            mb="sm"
            {...updateSoundboardSoundForm.getInputProps("name")}
          />
          <TextInput
            withAsterisk
            label="URL"
            mb="sm"
            {...updateSoundboardSoundForm.getInputProps("url")}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Modal>

      <Modal
        opened={soundboardSoundToDelete !== null}
        onClose={() => {
          setSoundboardSoundIDToDelete(null);
        }}
        title="Delete Sound"
      >
        {soundboardSoundToDelete && (
          <>
            <Text>
              Are you sure that you would like to delete sound{" "}
              {soundboardSoundToDelete?.name}?
            </Text>
            <Button
              color="red"
              mr="sm"
              mt="sm"
              onClick={() => {
                deleteSoundboardSoundMutation
                  .mutateAsync({ id: soundboardSoundToDelete.id })
                  .then(() => {
                    refetchSoundboardSounds().catch((e) => {
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
                setSoundboardSoundIDToDelete(null);
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

export default DashboardPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  return {
    props: {},
    notFound: session?.user.role !== UserRole.ADMIN,
  };
};
