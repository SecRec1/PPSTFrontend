import React, { Component } from "react";
import BulkSubModal from "./bulk-checkout";

export default class SubBulk extends Component {
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
        <button onClick={this.handleOpenModal}>CheckOut</button>
        {this.state.showModal && (
          <BulkSubModal
            modalIsOpen={this.state.showModal}
            closeModal={this.handleCloseModal}
          />
        )}
      </div>
    );
  }
}
