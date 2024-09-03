import React, { Component } from "react";
import axios from "axios";
import QRCode from "qrcode.react";

export default class AddForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventory: {},
      gender: {},
      logo: "",
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
    axios.get("http://192.168.1.231:8005/Items").then((response) => {
      this.setState({ inventory: response.data });
    });
  }
  handleSubmit(event) {
    event.preventDefault();

    const data = {
      barcode: this.state.barcode,
      gender: this.state.gender,
      logo: this.state.logo, // Use `logo` to match the backend
      name: this.state.name,
      color: this.state.color,
      size: this.state.size,
      count: this.state.quantity, // Use `count` to match the backend
    };

    axios
      .post("http://192.168.1.231:8005/Item", data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log(response);
        this.setState({
          name: "",
          gender: neutral,
          logo: "",
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
          <label>Gender</label>
          <select
            name="gender"
            value={this.state.gender}
            onChange={this.handleChange}
          >
            <option value="neutral">Neutral</option>
            <option value="mens">Mens</option>
            <option value="womens">Womans</option>
          </select>
          <label>Name</label>
          <input
            name="name"
            value={this.state.name}
            onChange={this.handleChange}
          />
          <label>Color</label>
          <select
            name="color"
            value={this.state.color}
            onChange={this.handleChange}
          >
            <option value="">Black</option>
            <option value="">Blue</option>
            <option value="">Light Blue</option>
            <option value="">Green</option>
            <option value="">Yellow</option>
            <option value="">Red</option>
            <option value="">Rose</option>
            <option value="">Grey</option>
            <option value="">Brown</option>
            <option value="">Orange</option>
            <option value="">Tan</option>
            <option value="">White</option>
          </select>
          <label>Size</label>
          <select
            name="size"
            value={this.state.size}
            onChange={this.handleChange}
          >
            <option value="1">XXL</option>
            <option value="2">XL</option>
            <option value="3">L</option>
            <option value="4">M</option>
            <option value="5">S</option>
            <option value="6">YXL</option>
            <option value="7">4T</option>
            <option value="8">3T</option>
            <option value="9">2T</option>
          </select>
          <label>Logo</label>
          <select
            name="logo"
            value={this.state.logo}
            onChange={this.handleChange}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <label>Barcode</label>
          <input
            name="barcode"
            placeholder="Barcode:"
            value={this.state.barcode}
          />
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={this.state.quantity}
            onChange={this.handleChange}
          />
          <button type="submit">Check In</button>
        </form>
      </div>
    );
  }
}
