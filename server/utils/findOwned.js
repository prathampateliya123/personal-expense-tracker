export const findOwnedDocument = async (
  Model,
  id,
  userId,
  {
    key = "document",
    notFoundMessage = "Not found",
    forbiddenMessage = "Not authorized",
  } = {}
) => {
  const document = await Model.findById(id);

  if (!document) {
    return {
      [key]: null,
      status: 404,
      message: notFoundMessage,
    };
  }

  if (document.userId.toString() !== userId.toString()) {
    return {
      [key]: null,
      status: 403,
      message: forbiddenMessage,
    };
  }

  return { [key]: document, status: null, message: null };
};
