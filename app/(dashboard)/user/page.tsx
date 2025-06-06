// By Kanghuan Xu, Junhui Huang
import { getCurrentUser } from "./session";
import { getOne, updateOne } from "./actions";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import { capitalizeFirstLetter } from "@/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
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

  // 3. Server action to update with validation and redirect (refresh)
  async function handleUpdate(formData: FormData) {
    "use server";
    if (!user) {
      throw new Error("User not found");
    }

    // Validate incoming name
    const rawName = formData.get("name");
    const name = typeof rawName === "string" ? rawName.trim() : "";
    if (!name) {
      throw new Error("Username cannot be empty.");
    }
    if (name.length > 16) {
      throw new Error("Username cannot exceed 16 characters.");
    }

    // Attempt update
    const updated = await updateOne(user.id.toString(), { name });
    if (!updated) {
      throw new Error("Update failed.");
    }

    // Refresh the page to pick up updated data
    redirect("/user");
  }

  // 4. Render form
  return (
    <PageContainer>
      <Box
        component="form"
        action={handleUpdate}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography>Your current username: {dbUser.name}</Typography>
        <Typography>Please enter your new username below</Typography>
        <TextField name="name" label="Name" defaultValue="" fullWidth />
        <Typography>Your Email: {dbUser.email}</Typography>
        <label>Your Role: {capitalizeFirstLetter(dbUser.role)}</label>
        <br />
        <Button type="submit" variant="contained">
          Save Changes
        </Button>
      </Box>

      {dbUser.role !== session?.user.role && (
        <Box
          sx={{
            border: "1px solid #ccc",
            mt: 4,
            p: 1,
            borderRadius: 1,
          }}
        >
          <Typography color="red">
            {`Your role is currently overridden by the environment variable to "${(
              session?.user.role as string
            ).toUpperCase()}", which is different from your current role in the database! There's nothing to worry about, but it might be a better idea to update your role in the database.`}
          </Typography>
          <Button
            variant="contained"
            color="warning"
            sx={{ mt: 1 }}
            fullWidth
            disabled
          >
            {`Override your role with "${session?.user.role}" permanently (Unavailable)`}
          </Button>
        </Box>
      )}
    </PageContainer>
  );
}
