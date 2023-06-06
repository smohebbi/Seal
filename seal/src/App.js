import React from "react";
import './App.css';
import {
  Switch,
  BrowserRouter as Router,
  Route,
  NavLink,
} from 'react-router-dom';

import { DocumentUpload } from "./components/documentUpload";
import { DocumentList } from "./components/documentList";
import { DocumentDownload } from "./components/documentDownload";
import { DocumentLink } from "./components/documentLink";

export default function App() {
  return (
    <Router>
      <div id="AppContainer">
        <nav>
          <ul>
            <li>
              <NavLink exact to="/">Upload Document</NavLink>
            </li>
            <li>
              <NavLink exact to="/documents">Documents</NavLink>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route exact path="/">
            <div className="tab">
              <DocumentUpload />
            </div>
          </Route>
          <Route path="/documents">
            <div className="tab">
              <DocumentList />
              <DocumentDownload />
              <DocumentLink />
            </div>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
