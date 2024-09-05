import React, { Component } from "react";
import axios from "axios";


export default class AddForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventory: {},
      gender: "",
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
    this.handleBarcode = this.handleBarcode.bind(this);
  }
  componentDidMount() {
    this.getInventory();
  }

  getInventory() {
    axios.get("http://192.168.1.231:8005/Items").then((response) => {
      this.setState({ inventory: response.data });
    });
  }

  handleBarcode() {
    const gender = this.state.gender.charAt(0).toUpperCase();
    const words = this.state.name.split(" ");
    const initials = words.map((word) => word.substring(0, 2).toUpperCase());
    const finalIni = initials.join("");
    const color = this.state.color;
    const sizeMap = {
        "XXL": 1,
        "XL": 2,
        "L": 3,
        "M": 4,
        "S": 5,
        "YXL": 6,
        "4T": 7,
        "3T": 8,
        "2T": 9
    };
    const sizeNumber = sizeMap[this.state.size] || 0; // Default to 0 if size is not in the map
    const barcode = gender + finalIni + color + sizeNumber;
    this.setState({ barcode: barcode });
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
          gender: "",
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
    this.setState({ [event.target.name]: event.target.value }, () => {
      this.handleBarcode();
    });
  }
  render() {
    return (
      <div className="add-new-item-container">
        <h2>Add New Item</h2>
        <form onSubmit={this.handleSubmit}>
          <label>Gender</label>
          <select
            name="gender"
            value={this.state.gender}
            onChange={this.handleChange}
          >
            <option>Select</option>
            <option value="Neutral">Neutral</option>
            <option value="Mens">Mens</option>
            <option value="Womens">Womans</option>
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
            <option>Pick</option>
            <option value="BK">Black</option>
            <option value="BL">Blue</option>
            <option value="LB">Light Blue</option>
            <option value="GN">Green</option>
            <option value="Y">Yellow</option>
            <option value="R">Red</option>
            <option value="RO">Rose</option>
            <option value="GY">Grey</option>
            <option value="BN">Brown</option>
            <option value="O">Orange</option>
            <option value="A">Almond</option>
            <option value="W">White</option>
            <option value="P">Pink</option>
          </select>
          <label>Size</label>
          <select
            name="size"
            value={this.state.size}
            onChange={this.handleChange}
          ><option>Pick</option>
            <option value="XXL">XXL</option>
            <option value="XL">XL</option>
            <option value="L">L</option>
            <option value="M">M</option>
            <option value="S">S</option>
            <option value="YXL">YXL</option>
            <option value="4T">4T</option>
            <option value="3T">3T</option>
            <option value="2T">2T</option>
          </select>
          <label>Logo</label>
          <select
            name="logo"
            value={this.state.logo}
            onChange={this.handleChange}
          >
            <option>Pick</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <label>Barcode</label>
          <input
            name="barcode"
            placeholder="Barcode:"
            value={this.state.barcode}
            readOnly
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
