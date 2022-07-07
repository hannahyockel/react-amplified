/* src/App.js */
import React, { useEffect, useState } from "react";
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { createTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import {
  defaultDarkModeOverride,
  ThemeProvider,
  Card,
  Text,
  useTheme,
  Grid,
  View,
  withAuthenticator,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Heading,
  TextField,
} from "@aws-amplify/ui-react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: "", description: "" };

function App({ signOut, user }) {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  // When the component loads, the useEffect hook is called and it invokes the fetchTodos function
  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  // Uses the Amplify API category to call the AppSync GraphQL API with the listTodos query
  // Once the data is returned, the items array is passed in to the setTodos function to update the local state
  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  // Uses the Amplify API category to call the AppSync GraphQL API with the createTodo mutation
  // A difference between the listTodos query and the createTodo mutation is that createTodo accepts an argument containing the variables needed for the mutation
  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createTodo, { input: todo }));
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }
  const [colorMode, setColorMode] = React.useState("system");
  const theme = {
    name: "my-theme",
    overrides: [defaultDarkModeOverride],
  };

  return (
    <>
      <ThemeProvider theme={theme} colorMode={colorMode}>
        <Card>
          <Grid
            columnGap="0.5rem"
            rowGap="0.5rem"
            templateColumns="1fr 1fr 1fr"
            templateRows="1fr 3fr 1fr"
          >
            <Card columnStart="1" columnEnd="-1">
              <Heading level={5}>Hello user {user.username}</Heading>
              <Button onClick={signOut}>Sign out</Button>
            </Card>

            <Card columnStart="1" columnEnd="2">
              <ToggleButtonGroup
                value={colorMode}
                isExclusive
                onChange={(value) => setColorMode(value)}
              >
                <ToggleButton value="light">Light</ToggleButton>
                <ToggleButton value="dark">Dark</ToggleButton>
                <ToggleButton value="system">System</ToggleButton>
              </ToggleButtonGroup>
              <Text>Current color mode: {colorMode}</Text>
            </Card>

            <Card columnStart="2" columnEnd="-1">
              <Heading level={2}>Todos</Heading>
              <TextField
                onChange={(event) => setInput("name", event.target.value)}
                value={formState.name}
                placeholder="Name"
              />
              <TextField
                onChange={(event) =>
                  setInput("description", event.target.value)
                }
                value={formState.description}
                placeholder="Description"
              />
              <Button onClick={addTodo}>Create Todo</Button>

              {todos.map((todo, index) => (
                <Card key={todo.id ? todo.id : index}>
                  <Text variation="info" as="p" width="33vw">
                    {todo.name}
                  </Text>
                  <Text
                    isTruncated={true}
                    variation="primary"
                    as="p"
                    width="33vw"
                  >
                    {todo.description}
                  </Text>
                  {/* <button style={styles.button} onClick={removeTodo}>delete</button> */}
                </Card>
              ))}
            </Card>

            <Card columnStart="2" columnEnd="-1">
              Footer
            </Card>
          </Grid>
        </Card>
      </ThemeProvider>
    </>
  );
}

// style={styles.input}
// const styles = {
//   container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20, fontFamily: 'Poppins' },
//   todo: {  marginBottom: 15 },
//   input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
//   todoName: { fontSize: 20, fontWeight: 'bold' },
//   todoDescription: { marginBottom: 0 },
//   button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
// }

export default withAuthenticator(App);
