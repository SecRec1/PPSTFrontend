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
      filterValue: "",
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
    this.handleFilterValueChange = this.handleFilterValueChange.bind(this);
  }

  getInventory() {
    axios.get("https://swagtracker-back-1f5ac96bc9ed.herokuapp.com/Items").then((response) => {
      this.setState({ inventory: response.data });
    });
  }

  componentDidMount() {
    this.getInventory();
  }

  handleFilterChange(event) {
    event.preventDefault();
    const filter = event.target.value;
    this.setState({
      filter,
      showGenderSelect: filter === "gender",
      showItemNameInput: filter === "item name",
      showSizeSelect: filter === "size",
      showBarcodeInput: filter === "barcode",
      filterValue: "", // Clear the filter value when changing filter type
    });
  }

  handleFilterValueChange(event) {
    event.preventDefault();
    this.setState({
      filterValue: event.target.value,
    });
  }

  filterInventory() {
    const { inventory, filter, filterValue } = this.state;

    if (filter === "all") {
      return inventory;
    }

    return inventory.filter((item) => {
      switch (filter) {
        case "gender":
          return item.gender.toLowerCase().includes(filterValue.toLowerCase());
        case "item name":
          return item.name.toLowerCase().includes(filterValue.toLowerCase());
        case "size":
          return item.size.toLowerCase().includes(filterValue.toLowerCase());
        case "barcode":
          return item.barcode.toLowerCase().includes(filterValue.toLowerCase());
        default:
          return true;
      }
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
      .put(`https://swagtracker-back-1f5ac96bc9ed.herokuapp.com/Item/${selectedItem.barcode}`, {
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
      .put(`https://swagtracker-back-1f5ac96bc9ed.herokuapp.com/Item/${editItem.barcode}`, editItem)
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
      .delete(`https://swagtracker-back-1f5ac96bc9ed.herokuapp.com/Item/${barcode}`)
      .then(() => {
        this.getInventory();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // handlePrintBarcode(barcode) {
  //   const barcodeElement = document.createElement("div");
  //   document.body.appendChild(barcodeElement);

  //   ReactDOM.render(<Barcode value={barcode} />, barcodeElement);

  //   const svgElement = barcodeElement.querySelector("svg");
  //   if (svgElement) {
  //     const svgData = new XMLSerializer().serializeToString(svgElement);
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");
  //     const img = new Image();

  //     img.onload = function () {
  //       const checkImageLoaded = () => {
  //         if (img.width > 0 && img.height > 0) {
  //           canvas.width = img.width;
  //           canvas.height = img.height;
  //           ctx.drawImage(img, 0, 0);

  //           const pngDataUrl = canvas.toDataURL("image/png");

  //           const printWindow = window.open("", "", "width=800,height=600");
  //           if (printWindow) {
  //             printWindow.document.open();
  //             printWindow.document.write(`
  //             <html>
  //             <head>
  //               <title>Print Barcode</title>
  //               <style>
  //           body {
  //             margin: 0;
  //             padding: 0;
  //             display: flex;
  //             justify-content: center;
  //             align-items: center;
  //             height: 100vh; /* Full height of the page for vertical centering */
  //           }
  //           .barcode-container {
  //             width: 2in;  /* Adjust based on the actual label size */
  //             height: 1in; /* Adjust based on the actual label size */
  //             display: flex;
  //             justify-content: center;
  //             align-items: center;
  //           }
  //           img {
  //             width: 175%; /* Scale slightly beyond 100% for a bigger image */
  //             height: auto; /* Maintain aspect ratio */
  //             max-width: none; /* Remove max limits to allow bigger size */
  //             max-height: none;
  //             object-fit: contain; /* Ensure image scales while keeping aspect ratio */
  //           }
  //           @media print {
  //             @page {
  //               size: auto;
  //               margin: 0; /* No margins for the printed label */
  //             }
  //             body {
  //               margin: 0;
  //             }
  //           }
  //         </style>
  //             </head>
  //             <body>
  //               <h3>Barcode</h3>
  //               <div class="barcode-container">
  //                 <img src="${pngDataUrl}" alt="Barcode" />
  //               </div>
  //               <script>
  //                 window.print();
  //                 window.onafterprint = function() {
  //                   window.close();
  //                 };
  //               </script>
  //             </body>
  //             </html>
  //           `);
  //             printWindow.document.close();
  //           } else {
  //             alert(
  //               "Failed to open print window. Please check your browser settings."
  //             );
  //           }
  //         } else {
  //           requestAnimationFrame(checkImageLoaded);
  //         }
  //       };

  //       requestAnimationFrame(checkImageLoaded);
  //     };

  //     img.src = "data:image/svg+xml;base64," + btoa(svgData);
  //   }

  //   ReactDOM.unmountComponentAtNode(barcodeElement);
  //   document.body.removeChild(barcodeElement);
  // }
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
  
      img.onload = () => {
        // Ensure the canvas matches the size of the image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
  
        const pngDataUrl = canvas.toDataURL("image/png");
  
        const printWindow = window.open("", "", "width=800,height=600");
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(`
            <html>
            <head>
              <title>Print Barcode</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                }
                .barcode-container {
                  width: 2in;  
                  height: 0.5in;    /* 1/2 inch */
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  overflow: hidden;  /* Ensure no overflow */
                }
                img {
                  width: 180%;      /* Scale the image to the width of the label */
                  height: auto;     /* Maintain aspect ratio */
                  max-width: none;  /* Prevent image from overflowing horizontally */
                  max-height: 110%; /* Prevent image from overflowing vertically */
                  object-fit: contain; /* Ensure the image scales properly */
                }
                @media print {
                  @page {
                    size: 2in 0.5in; /* Set exact label size */
                    margin: 0;           /* No margins */
                  }
                  body {
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  }
                }
              </style>
            </head>
            <body>
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
      };
  
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  
    ReactDOM.unmountComponentAtNode(barcodeElement);
    document.body.removeChild(barcodeElement);
  }
  
  

  render() {
    const {
      showAddModal,
      showEditModal,
      selectedItem,
      addQty,
      editItem,
      filter,
      filterValue,
      showGenderSelect,
      showItemNameInput,
      showSizeSelect,
      showBarcodeInput,
    } = this.state;

    // Filter the inventory based on the selected filter and filter value
    const filteredInventory = this.filterInventory();

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
            <select
              className="gender"
              value={filter === "gender" ? filterValue : ""}
              onChange={this.handleFilterValueChange}
            >
              <option value="">Choose</option>
              <option value="Neutral">Neutral</option>
              <option value="Mens">Mens</option>
              <option value="Womens">Womens</option>
            </select>
          )}

          {showItemNameInput && (
            <input
              type="text"
              name="item"
              placeholder="Item Name"
              value={filter === "item name" ? filterValue : ""}
              onChange={this.handleFilterValueChange}
            />
          )}

          {showSizeSelect && (
            <select
              className="size"
              value={filter === "size" ? filterValue : ""}
              onChange={this.handleFilterValueChange}
            >
              <option value="">Choose</option>
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

          {showBarcodeInput && (
            <input
              className="barcode"
              type="text"
              placeholder="Barcode"
              value={filter === "barcode" ? filterValue : ""}
              onChange={this.handleFilterValueChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
            />
          )}
        </form>

        <h2>Inventory</h2>
        <table>
          <thead>
            <tr>
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
            {filteredInventory.map((item) => (
              <tr key={item.barcode}>
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
                  {/* <button onClick={() => this.handleEditClick(item)}>
                    Edit
                  </button> */}
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
        {/* {showEditModal && editItem && (
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
                  readOnly
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
          </div> */}
        {/* )} */}
      </div>
    );
  }
}
