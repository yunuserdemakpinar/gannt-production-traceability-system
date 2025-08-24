import { Button, Grid, GridItem, List, ListItem } from "@chakra-ui/react";
import NavBar from "./components/NavBar";
import WorkOrderList from "./components/WorkOrderList";
import { useState } from "react";
import WorkOrderGannt from "./components/WorkOrderGannt";
import UpdateError from "./components/UpdateError";
import { Operation } from "./hooks/userOperations";
import UpdateOperationModal from "./components/UpdateOperationModal";

const App = () => {
  const [isList, setIsList] = useState(true);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateOperation, setUpdateOperation] = useState<Operation | null>(
    null
  );
  const [refreshFromApp, setRefreshFromApp] = useState(false);

  return (
    <Grid
      templateAreas={`"nav nav" "aside main"`}
      templateColumns={"200px 1fr"}
    >
      <GridItem area="nav">
        <NavBar />
      </GridItem>
      <GridItem area="aside">
        <List padding={2}>
          <ListItem marginBottom={2}>
            <Button
              width="100%"
              colorScheme="blue"
              variant={isList ? "outline" : "solid"}
              onClick={() => setIsList(true)}
            >
              List
            </Button>
          </ListItem>
          <ListItem>
            <Button
              width="100%"
              colorScheme="blue"
              variant={isList ? "solid" : "outline"}
              onClick={() => setIsList(false)}
            >
              Gannt
            </Button>
          </ListItem>
        </List>
      </GridItem>
      <GridItem area="main">
        {isList && <WorkOrderList />}
        {!isList && (
          <>
            <UpdateOperationModal
              isOpen={updateOperation ? true : false}
              onClose={() => setUpdateOperation(null)}
              operation={updateOperation}
              onUpdateError={(updateError) => setUpdateError(updateError)}
              onRefresh={() => setRefreshFromApp(!refreshFromApp)}
            />
            {updateError && (
              <UpdateError
                updateError={updateError}
                onClose={() => setUpdateError(null)}
              />
            )}
            <WorkOrderGannt
              onUpdateError={(updateError) => setUpdateError(updateError)}
              onUpdateOperation={(updateOperation) =>
                setUpdateOperation(updateOperation)
              }
              refreshFromApp={refreshFromApp}
            />
          </>
        )}
      </GridItem>
    </Grid>
  );
};

export default App;
