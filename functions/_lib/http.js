export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const readJson = async (request) => {
  try {
    return await request.json();
  } catch {
    return {};
  }
};
