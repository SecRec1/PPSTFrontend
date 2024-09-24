import React, { Component } from "react";
import ReactModal from "react-modal";
import axios from "axios";

import styles from "../style/modal.scss";

export default class BulkSubModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scanData: [], // Object to store scanned items and their counts/details
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
          .get(`https://swagtracker-back-1f5ac96bc9ed.herokuapp.com/Item/${barcode}`)
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
    const updatePromises = Object.keys(scanData).map(async (barcode) => {
      let currentCount = scanData[barcode].currentCount || null; // Ensure currentCount is valid
      const newCount = scanData[barcode].count || 0; // Ensure count is valid
  
      // If currentCount is null, fetch it from the backend
      if (currentCount === null) {
        try {
          const response = await axios.get(`https://swagtracker-back-1f5ac96bc9ed.herokuapp.com/Item/${barcode}`);
          currentCount = response.data.count; // Assuming the backend sends the count field
          console.log(`Fetched current count for ${barcode}: ${currentCount}`);
        } catch (error) {
          console.error(`Error fetching current count for ${barcode}: `, error);
          return; // Stop further execution if fetching fails
        }
      }
  
      // Check if newCount is valid
      if (newCount <= 0 || isNaN(newCount)) {
        console.error(`Invalid count for ${barcode}`);
        return;
      }
  
      const updatedCount = currentCount - newCount; // Calculate the updated count
  
      console.log(`Updating barcode ${barcode}:`);
      console.log(`Current count: ${currentCount}, Scanned count: ${newCount}, Updated count: ${updatedCount}`);
  
      // Ensure updatedCount is valid
      if (isNaN(updatedCount) || updatedCount < 0) {
        console.error(`Invalid updated count for ${barcode}`);
        return;
      }
  
      // Update the item count in the backend
      try {
        await axios.put(`https://swagtracker-back-1f5ac96bc9ed.herokuapp.com/Item/${barcode}`, {
          count: updatedCount,
        });
        console.log(`Successfully updated ${barcode} with count ${updatedCount}`);
      } catch (error) {
        console.error(`Error updating ${barcode}: `, error);
      }
    });
  
    // Wait for all the update promises to complete
    Promise.all(updatePromises).then(() => {
      // Optionally clear the scan data after check-out
      this.setState({ scanData: {} });
    });
    window.location.reload();
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
              <strong>{item.name}</strong> - Color:{item.color}, Size:{item.size}
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
