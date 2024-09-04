import React, { Component } from "react";

import Header from "./header";
import InvList from "./inv";
import AddForm from "./add-items";
import AddBulk from "./add-bulk";

import styles from "../style/app.scss";

import pbstanding from "../../static/assets/images/pbstanding.png";
import pbthinking from "../../static/assets/images/pbthinking.png";
export default class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="title-wrapper">
          <img src={pbstanding} className="img-one" />
          <h1>Padlocks Pad</h1>
          <img src={pbthinking} className="img-two"/>
        </div>

        <div className="container">
          <div className="header">
            <Header />
          </div>
          <div className="container-two">
            <div className="inv-list">
              <InvList />
            </div>
            <div className="add-form">
              <AddForm />
              <AddBulk />

            </div>
          </div>
        </div>
      </div>
    );
  }
}
