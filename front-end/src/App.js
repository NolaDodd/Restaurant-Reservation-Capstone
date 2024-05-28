import React from "react";
import Layout from "./layout/Layout";
import RootRoutes from "./layout/RootRoutes";

/**
 * Defines the root application component.
 * @returns {JSX.Element}
 */
function App() {
  return (
    <div>
      <Layout>
        <RootRoutes />
      </Layout>
    </div>
  );
}

export default App;
