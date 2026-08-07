// Small helper so every authenticated axios call doesn't have to
// re-build the Authorization header by hand.
export const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});
