import React, { Component } from "react";
import moment from "moment";
import styles from "../style/app.scss";

export default class Header extends Component {
  render() {
    return (
      <div className="title">
        <h1>Swag Tracker</h1>
        <div>{moment().format("MMM DD yyyy hh:mm")}</div>
      </div>
    );
  }
}
