import React, { Component } from "react";
import BulkAddModal from "./bulk-add-modal";

export default class AddBulk extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  render() {
    return (
      <div>
        <button onClick={this.handleOpenModal}>Add Bulk</button>
        {this.state.showModal && (
          <BulkAddModal
            modalIsOpen={this.state.showModal}
            closeModal={this.handleCloseModal}
          />
        )}
      </div>
    );
  }
}
