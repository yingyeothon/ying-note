import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Note from "./components/Note";

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <p>Ying, note.</p>
        <Switch>
          <Route path="/note/:noteId">
            <Note />
          </Route>
          <Route path="/dev/note/:noteId">
            <Note />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
