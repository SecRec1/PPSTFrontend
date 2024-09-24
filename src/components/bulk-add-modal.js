import React, { Component } from "react";
import ReactModal from "react-modal";
import axios from "axios";

import styles from "../style/modal.scss";

export default class BulkAddModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
      scanData: {}, // Object to store scanned items and their counts
      currentScan: "",
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleCheckIn = this.handleCheckIn.bind(this);
    
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

  handleCheckIn() {
    
    const { scanData } = this.state;
  
    // Check if scanData is not empty
    if (!scanData || Object.keys(scanData).length === 0) {
      console.error("No scan data available.");
      return;
    }
  
    // Create an array of promises to get the current count for each barcode
    const updatePromises = Object.keys(scanData).map((barcode) => {
      const scannedCount = scanData[barcode]; // Assume scanData[barcode] is the count
  
      if (scannedCount == null) {
        console.error(`Invalid scanned count for barcode ${barcode}`);
        return Promise.resolve(); // Return a resolved promise to continue with other items
      }
  
      return axios
        .get(`http://192.168.1.231:8005/Item/${barcode}`)
        .then((response) => {
          const currentCount = response.data?.count;
  
          if (currentCount == null) {
            console.error(`Invalid current count for barcode ${barcode}`);
            return;
          }
  
          const newCount = currentCount + scannedCount; // Add scanned count to current count
  
          return axios
            .put(`http://192.168.1.231:8005/Item/${barcode}`, {
              count: newCount,
            })
            .then(() => {
              console.log(`Updated ${barcode} with new count ${newCount}`);
            })
            .catch((error) => {
              console.error(`Error updating ${barcode}: `, error);
            });
        })
        .catch((error) => {
          console.error(`Error fetching current count for ${barcode}: `, error);
        });
    });
  
    Promise.all(updatePromises)
      .then(() => {
        this.setState({ scanData: {} });
        console.log("Check-in process completed successfully.");
      })
      .catch((error) => {
        console.error("Error during the check-in process:", error);
      })
      .finally(() => {
        window.location.reload(); // Reload after all updates (optional)
      });
  }
  
    
  

  

  render() {
    const { scanData } = this.state;

    return (
      <ReactModal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.props.closeModal}
        appElement={document.getElementById('root')}
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
