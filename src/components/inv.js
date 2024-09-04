
import React, { Component } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Barcode from "react-barcode";
import { renderToStaticMarkup } from "react-dom/server";
import styles from "../style/inv-list.scss";

export default class InvList extends Component {
  constructor() {
    super();
    this.state = {
      inventory: [],
      addQty: {},
      showAddModal: false,
      showEditModal: false,
      selectedItem: null,
      editItem: {},
      filter: "all",
      showGenderSelect: false,
      showItemNameInput: false,
      showSizeSelect: false,
      showBarcodeInput: false,
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
    this.handlePrintBarcode = this.handlePrintBarcode.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  getInventory() {
    axios.get("http://192.168.1.231:8005/Items").then((response) => {
      this.setState({ inventory: response.data });
    });
  }

  componentDidMount() {
    this.getInventory();
  }

  handleFilterChange(event) {
    const filter = event.target.value;
    this.setState({
      filter,
      showGenderSelect: filter === "gender",
      showItemNameInput: filter === "item name",
      showSizeSelect: filter === "size",
      showBarcodeInput: filter === "barcode",
    });
  }

  handleAddClick(item) {
    this.setState({
      showAddModal: true,
      selectedItem: item,
      addQty: { [item.barcode]: "" },
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

    axios
      .put(`http://192.168.1.231:8005/Item/${selectedItem.barcode}`, {
        count: selectedItem.count + newQuantity,
      })
      .then(() => {
        this.setState({ showAddModal: false, selectedItem: null });
        this.getInventory();
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
      printBarcode: null,
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

  handlePrintBarcode(barcode) {
    const barcodeElement = document.createElement("div");
    document.body.appendChild(barcodeElement);

    ReactDOM.render(<Barcode value={barcode} />, barcodeElement);

    const svgElement = barcodeElement.querySelector("svg");
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = function () {
        const checkImageLoaded = () => {
          if (img.width > 0 && img.height > 0) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const pngDataUrl = canvas.toDataURL("image/png");

            const printWindow = window.open("", "", "width=600,height=400");
            if (printWindow) {
              printWindow.document.open();
              printWindow.document.write(`
              <html>
              <head>
                <title>Print Barcode</title>
                <style>
                  body { text-align: center; margin: 0; padding: 20px; }
                  .barcode-container { margin: 20px; }
                </style>
              </head>
              <body>
                <h3>Barcode</h3>
                <div class="barcode-container">
                  <img src="${pngDataUrl}" alt="Barcode" />
                </div>
                <script>
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                </script>
              </body>
              </html>
            `);
              printWindow.document.close();
            } else {
              alert(
                "Failed to open print window. Please check your browser settings."
              );
            }
          } else {
            requestAnimationFrame(checkImageLoaded);
          }
        };

        requestAnimationFrame(checkImageLoaded);
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }

    ReactDOM.unmountComponentAtNode(barcodeElement);
    document.body.removeChild(barcodeElement);
  }

  render() {
    const {
      inventory,
      showAddModal,
      showEditModal,
      selectedItem,
      addQty,
      editItem,
      filter,
      showGenderSelect,
      showItemNameInput,
      showSizeSelect,
      showBarcodeInput,
    } = this.state;

    return (
      <div>
        <form>
          <label>
            Filter By:
            <select
              name="filter"
              className="filter"
              value={filter}
              onChange={this.handleFilterChange}
            >
              <option value="all">All</option>
              <option value="gender">Gender</option>
              <option value="item name">Item Name</option>
              <option value="size">Size</option>
              <option value="barcode">Barcode</option>
            </select>
          </label>

          {showGenderSelect && (
            <select className="gender">
              <option>Choose</option>
              <option>Neutral</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          )}

          {showItemNameInput && (
            <input type="text" name="item" placeholder="Item Name" />
          )}

          {showSizeSelect && (
            <select className="size">
              <option>Choose</option>
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
          )}

          {showBarcodeInput && <input className="barcode" />}
        </form>

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
                <td>
                  <button onClick={() => this.handlePrintBarcode(item.barcode)}>
                    <Barcode value={item.barcode} />
                    Print
                  </button>
                </td>
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
                  <option>Select</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Mens">Mens</option>
                  <option value="Womens">Womans</option>
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
                  <option value="T">Tan</option>
                  <option value="W">White</option>
                </select>
              </label>
              <label>
                Size:
                <select
                  name="size"
                  value={editItem.size || ""}
                  onChange={this.handleEditChange}
                >
                  <option>Pick</option>
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
              </label>
              <label>
                Logo:
                <select
                  name="logo"
                  value={editItem.logo || ""}
                  onChange={this.handleEditChange}
                >
                  <option>Pick</option>
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
