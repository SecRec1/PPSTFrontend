import React, { Component } from "react";
import axios from "axios";

import styles from "../style/inv-list.scss";

export default class InvList extends Component {
  constructor() {
    super();
    this.state = {
      inventory: [],
      addQty: {}, // Quantity to add
      showAddModal: false, // Control modal visibility
      showEditModal: false, // Control modal visibility for editing item
      selectedItem: null, // Track selected item for addition
      editItem: {}, // Track selected item for editing
    };

    this.getInventory = this.getInventory.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.handleAddSubmit = this.handleAddSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleEditChange = this.handleEditChange.bind(this);
    this.handleEditSubmit = this.handleEditSubmit.bind(this);
    this.handleDelelteClick = this.handleDelelteClick.bind(this);
  }

  getInventory() {
    axios.get("http://192.168.1.231:8005/Items").then((response) => {
      this.setState({ inventory: response.data });
    });
  }

  componentDidMount() {
    this.getInventory();
  }

  handleAddClick(item) {
    this.setState({
      showAddModal: true,
      selectedItem: item,
      addQty: { [item.barcode]: "" }, // Initialize with empty quantity using barcode
    });
  }

  handleQuantityChange(event) {
    const { selectedItem } = this.state;
    this.setState({
      addQty: { [selectedItem.barcode]: event.target.value },
    });
  }

  handleAddSubmit() {
    const { selectedItem, addQty } = this.state;
    const newQuantity = parseInt(addQty[selectedItem.barcode], 10) || 0;

    // Assuming the backend expects a new quantity to be updated
    axios
      .put(`http://192.168.1.231:8005/Item/${selectedItem.barcode}`, {
        count: selectedItem.count + newQuantity,
      })
      .then(() => {
        this.setState({ showModal: false, selectedItem: null });
        this.getInventory(); // Refresh inventory after updating
      })
      .catch((error) => {
        console.log(error);
      });
  }
  handleEditClick(item) {
    this.setState({
      showEditModal: true,
      selectedItem: item,
      editItem: { ...item },
    });
  }
  handleEditChange(event) {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      editItem: {
        ...prevState.editItem,
        [name]: value,
      },
    }));
  }
  handleEditSubmit() {
    const { editItem } = this.state;

    axios
      .put(`http://192.168.1.231:8005/Item/${editItem.barcode}`, editItem)
      .then(() => {
        this.setState({ showEditModal: false, selectedItem: null });
        this.getInventory();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleCancel() {
    this.setState({
      showAddModal: false,
      showEditModal: false,
      selectedItem: null,
      addQty: {},
      editItem: {},
    });
  }

  handleDelelteClick(barcode) {
    axios
      .delete(`http://192.168.1.231:8005/Item/${barcode}`)
      .then(() => {
        this.getInventory();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    const {
      inventory,
      showAddModal,
      showEditModal,
      selectedItem,
      addQty,
      editItem,
    } = this.state;
    return (
      <div>
        <h2>Inventory</h2>
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Gender</th>
              <th>Item Name</th>
              <th>Color</th>
              <th>Size</th>
              <th>Logo</th>
              <th>Barcode</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.barcode}>
                <td>{item.id}</td>
                <td>{item.gender}</td>
                <td>{item.name}</td>
                <td>{item.color}</td>
                <td>{item.size}</td>
                <td>{item.logo}</td>
                <td>{item.barcode}</td>
                <td>{item.count}</td>
                <td>
                  <button onClick={() => this.handleAddClick(item)}>
                    Add/Sub
                  </button>
                  <button onClick={() => this.handleEditClick(item)}>
                    Edit
                  </button>
                  <button onClick={() => this.handleDelelteClick(item.barcode)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddModal && selectedItem && (
          <div className="modal">
            <div className="modal-content">
              <h3>Add Quantity for {selectedItem.name}</h3>
              <input
                type="number"
                value={addQty[selectedItem.barcode] || ""}
                onChange={this.handleQuantityChange}
                placeholder="Enter quantity"
              />
              <button onClick={this.handleAddSubmit}>OK</button>
              <button onClick={this.handleCancel}>Cancel</button>
            </div>
          </div>
        )}
        {showEditModal && editItem && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Item {editItem.name}</h3>

              <label>
                Gender:
                <select
                  name="gender"
                  value={editItem.gender || ""}
                  onChange={this.handleEditChange}
                >
                  <option value="neutral">Neutral</option>
                  <option value="mens">Mens</option>
                  <option value="womens">Womans</option>
                </select>
              </label>
              <label>
                Item Name:
                <input
                  type="text"
                  name="name"
                  value={editItem.name || ""}
                  onChange={this.handleEditChange}
                />
              </label>
              <label>
                Color:
                <select
                  name="color"
                  value={editItem.color || ""}
                  onChange={this.handleEditChange}
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
              </label>
              <label>
                Size:
                <select
                  name="size"
                  value={editItem.size || ""}
                  onChange={this.handleEditChange}
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
              </label>
              <label>
                Logo:
                <select
                  name="logo"
                  value={editItem.logo || ""}
                  onChange={this.handleEditChange}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label>
                Barcode:
                <input
                  type="text"
                  name="barcode"
                  value={editItem.barcode || ""}
                  onChange={this.handleEditChange}
                />
              </label>
              <label>
                Quantity:
                <input
                  type="number"
                  name="count"
                  value={editItem.count || ""}
                  onChange={this.handleEditChange}
                />
              </label>
              <button onClick={this.handleEditSubmit}>Save</button>
              <button onClick={this.handleCancel}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
