import { Button, Grid, GridItem, List, ListItem } from "@chakra-ui/react";
import NavBar from "./components/NavBar";
import WorkOrderList from "./components/WorkOrderList";
import { useState } from "react";

const App = () => {
  const [isList, setIsList] = useState(true);

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
      <GridItem area="main">{isList && <WorkOrderList />}</GridItem>
    </Grid>
  );
};

export default App;
