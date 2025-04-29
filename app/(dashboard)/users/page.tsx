// By Kanghuan Xu
import { getCurrentUser } from "../users/session";
import { getOne, updateOne } from "../users/actions";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
} from "@mui/material";

export default async function SettingsPage() {
  // 1. Must be signed in
  const user = await getCurrentUser();
  console.log("Signed-in user.id =", user?.id);

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">Please sign in to view your settings.</Alert>
      </Container>
    );
  }

  // 2. Load their DB record
  const dbUser = await getOne(user.id.toString());
  if (!dbUser) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading your profile.</Alert>
      </Container>
    );
  }

  // 3. Server action to update
  async function handleUpdate(formData: FormData) {
    "use server";
    if (!user) throw new Error("User not found");
    const updated = await updateOne(user.id.toString(), {
      name: formData.get("name") as string,
    });
    if (!updated) throw new Error("Update failed");
  }

  // 4. Render form
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Settings
      </Typography>

      <Box
        component="form"
        action={handleUpdate}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          name="name"
          label="Name"
          defaultValue={dbUser.name}
          fullWidth
        />
        <label>Your Email: {dbUser.email}</label>
        <label>Your Role: {dbUser.role}</label>
        <br />
        <Button type="submit" variant="contained">
          Save Changes
        </Button>
      </Box>
    </Container>
  );
}
