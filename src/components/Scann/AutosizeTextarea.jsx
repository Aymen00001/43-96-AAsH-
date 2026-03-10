<Modal isOpen={showModal} toggle={closeModal}>
<ModalHeader toggle={closeModal}>Add New Product</ModalHeader>
<ModalBody>
    <label>You need to take a photo of the barcode " </label>
    <Input type="file" accept="image/*" onChange={handleImageChange} />
</ModalBody>
<ModalFooter>
    <Button color="primary" onClick={addProduct}>Add</Button>{' '}
    <Button color="secondary" onClick={closeModal}>Cancel</Button>
</ModalFooter>
</Modal>