export async function fixId(data) {
  if (!data) return {};
  return { ...data, id: data._id.toString() };
}

export async function fixIdArray(arrayData) {
  if (!arrayData || arrayData.length === 0) return [];
  const fixArrayData = await arrayData.map((data) => ({
    ...data,
    id: data._id.toString(),
  }));
  return fixArrayData;
}
