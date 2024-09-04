import React, { Component } from "react";
import ReactModal from "react-modal";
import axios from "axios";

export default class BulkAddModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scanData: {}, // Object to store scanned items and their counts
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
        this.setState((prevState) => {
          const scanData = { ...prevState.scanData };
          if (scanData[barcode]) {
            scanData[barcode] += 1; // Increment the count for the scanned item
          } else {
            scanData[barcode] = 1; // Initialize count for a new scanned item
          }
          return { scanData, currentScan: "" };
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

    // Create an array of promises to get the current count for each barcode
    const updatePromises = Object.keys(scanData).map((barcode) => {
      // Get the current count for the barcode
      return axios
        .get(`http://192.168.1.231:8005/Item/${barcode}`)
        .then((response) => {
          const currentCount = response.data.count;
          const newCount = currentCount - scanData[barcode];

          // Update the count with the new value
          return axios
            .put(`http://192.168.1.231:8005/Item/${barcode}`, {
              count: newCount,
            })
            .then(() => {
              console.log(`Updated ${barcode} with new count ${newCount}`);
            });
        })
        .catch((error) => {
          console.error(`Error getting or updating ${barcode}: `, error);
        });
    });

    // Wait for all the update promises to complete
    Promise.all(updatePromises).then(() => {
      // Optionally clear the scan data after check-in
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
        <h2>Bulk Add Items</h2>
        <input
          type="text"
          placeholder="Scan items here"
          value={this.state.currentScan}
          readOnly
        />
        <ul>
          {Object.entries(scanData).map(([barcode, count]) => (
            <li key={barcode}>
              {barcode}: {count}
            </li>
          ))}
        </ul>
        <button onClick={this.handleCheckIn}>Check-In</button>
      </ReactModal>
    );
  }
}
