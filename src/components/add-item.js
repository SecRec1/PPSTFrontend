import React, { Component } from "react";
import axios from "axios";
import QRCode from "qrcode.react";

export default class AddForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventory: {},
      name: "",
      color: "",
      size: "",
      barcode: "",
      quantity: 0,
      currentQuantity: 0,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getInventory = this.getInventory.bind(this);
  }
  componentDidMount() {
    this.getInventory();
  }

  getInventory() {
    axios.get("http://127.0.0.1:8005/Items").then((response) => {
      this.setState({ inventory: response.data });
    });
  }
  handleSubmit(event) {
    event.preventDefault();

    const data = {
      barcode: this.state.barcode,
      name: this.state.name,
      color: this.state.color,
      size: this.state.size,
      count: this.state.quantity, // Use `count` to match the backend
    };

    axios
      .post("http://127.0.0.1:8005/Item", data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log(response);
        this.setState({
          name: "",
          color: "",
          size: "",
          barcode: "",
          quantity: 0,
        });
        this.getInventory();
      })
      .catch((error) => {
        console.log(error);
      });
      window.location.reload();
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }
  render() {
    return (
      <div>
        <h2>Add New Item</h2>
        <form onSubmit={this.handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            value={this.state.name}
            onChange={this.handleChange}
          />
          <input
            name="color"
            placeholder="Color"
            value={this.state.color}
            onChange={this.handleChange}
          />
          <input
            name="size"
            placeholder="Size"
            value={this.state.size}
            onChange={this.handleChange}
          />
          <input
            name="barcode"
            placeholder="Barcode:"
            value={this.state.barcode}
            onChange={this.handleChange}
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={this.state.quantity}
            onChange={this.handleChange}
          />
          <button type="submit">Check In</button>
        </form>
      </div>
    );
  }
}
