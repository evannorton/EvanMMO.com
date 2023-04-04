export const getDescriptionPreview = (description: string) => {
  let formattedDescription = description;
  const descriptionPreviewLength = 250;
  if (formattedDescription.length > descriptionPreviewLength) {
    formattedDescription = formattedDescription.substring(
      0,
      descriptionPreviewLength
    );
    const endCharacters = [".", ",", " ", "\n"];
    while (
      endCharacters.includes(
        formattedDescription.substring(formattedDescription.length - 1)
      )
    ) {
      formattedDescription = formattedDescription.substring(
        0,
        formattedDescription.length - 1
      );
    }
    formattedDescription += "...";
  }
  return formattedDescription;
};
