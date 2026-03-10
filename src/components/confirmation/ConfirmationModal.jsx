import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const ConfirmationModal = ({ isOpen, toggle, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirm Action</ModalHeader>
      <ModalBody>
        Are you sure you want to perform this action?
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Cancel</Button>{' '}
        <Button color="primary" onClick={onConfirm}>Confirm</Button>
      </ModalFooter>
    </Modal>
  );
};
