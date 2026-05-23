import { useState } from "react";
import { isAuthenticated } from "@/api/client";
import { LoginPage } from "@/pages/LoginPage";
import { FormPage } from "@/pages/FormPage";

function App() {
  const [authed, setAuthed] = useState(isAuthenticated);

  return authed ? (
    <FormPage onLogout={() => setAuthed(false)} />
  ) : (
    <LoginPage onLogin={() => setAuthed(true)} />
  );
}

export default App;
