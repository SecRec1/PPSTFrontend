import React, { Component } from "react";
import ReactModal from "react-modal";
import axios from "axios";

import styles from "../style/modal.scss";

export default class BulkSubModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scanData: {}, // Object to store scanned items and their counts/details
      currentScan: "",
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleCheckOut = this.handleCheckOut.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keypress", this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener("keypress", this.handleKeyPress);
  }

  handleKeyPress(event) {
    // Capture barcode scan until Enter key is pressed
    if (event.key === "Enter") {
      const barcode = this.state.currentScan.trim();
      if (barcode) {
        // Fetch item details from backend for the scanned barcode
        axios
          .get(`http://192.168.1.231:8005/Item/${barcode}`)
          .then((response) => {
            const item = response.data; // Assuming this returns the full item details
            this.setState((prevState) => {
              const scanData = { ...prevState.scanData };
              if (scanData[barcode]) {
                scanData[barcode].count += 1; // Increment the count for the scanned item
              } else {
                scanData[barcode] = { ...item, count: 1 }; // Initialize new item with count
              }
              return { scanData, currentScan: "" };
            });
          })
          .catch((error) => {
            console.error(`Error fetching item for barcode ${barcode}:`, error);
          });
      }
    } else {
      // Append the character to currentScan
      this.setState((prevState) => ({
        currentScan: prevState.currentScan + event.key,
      }));
    }
  }

  handleCheckOut() {
    const { scanData } = this.state;

    // Create an array of promises to update the count for each barcode
    const updatePromises = Object.keys(scanData).map((barcode) => {
      const newCount = scanData[barcode].count;

      // Update the item count in the backend
      return axios
        .put(`http://192.168.1.231:8005/Item/${barcode}`, {
          count: scanData[barcode].currentCount - newCount,
        })
        .then(() => {
          console.log(`Updated ${barcode} with new count ${newCount}`);
        })
        .catch((error) => {
          console.error(`Error updating ${barcode}: `, error);
        });
    });

    // Wait for all the update promises to complete
    Promise.all(updatePromises).then(() => {
      // Optionally clear the scan data after check-out
      this.setState({ scanData: {} });
    });
  }

  render() {
    const { scanData } = this.state;

    return (
      <ReactModal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.props.closeModal}
        appElement={document.getElementById("root")}
      >
        <h2>Checking Out</h2>
        <input
          type="text"
          placeholder="Scan items here"
          value={this.state.currentScan}
          readOnly
        />
        <ul>
          {Object.entries(scanData).map(([barcode, item]) => (
            <li key={barcode}>
              <strong>{item.name}</strong> - Color {item.color},Size {item.size}
              <br />
              Scanned Count: {item.count}
            </li>
          ))}
        </ul>
        <button onClick={this.handleCheckOut}>Check-out</button>
      </ReactModal>
    );
  }
}
