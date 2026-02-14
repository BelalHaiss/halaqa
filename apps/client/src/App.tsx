import { RouterProvider } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { router } from "./router";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
