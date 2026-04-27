import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { ItemType } from "../../../../core/constants";
import { EMPTY_STRING } from "../../../../core/helpers";
import { PtItem } from "../../../../core/models/domain";
import { PtNewItem } from "../../../../shared/models/dto/pt-new-item";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";

export type AddItemModalProps = {
  modalShowing: boolean;
  onNewItemSave: (newItem: PtNewItem) => Promise<PtItem | undefined>;
  setIsAddModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
};

const initModalNewItem = (): PtNewItem => {
  return {
    title: EMPTY_STRING,
    description: EMPTY_STRING,
    typeStr: "PBI",
  };
};

export function AddItemModal(props: AddItemModalProps) {
  const [newItem, setNewItem] = useState(initModalNewItem());

  const modalShowing = props.modalShowing;
  const setShowModal = props.setIsAddModalShowing;
  const itemTypesProvider = ItemType.List.map((t) => t.PtItemType);

  console.log(itemTypesProvider);

  function onFieldChange(e: any, formFieldName: string) {
    if (!newItem) {
      return;
    }
    setNewItem({ ...newItem, [formFieldName]: e.target.value });
  }

  async function onAddSave() {
    const createdItem = await props.onNewItemSave(newItem);
    setShowModal(false);
    setNewItem(initModalNewItem());
  }

  return (
    <Modal isOpen={modalShowing}>
      <div className="modal-header">
        <h4 className="modal-title" id="modal-basic-title">
          Add New Item
        </h4>
        <button
          type="button"
          className="close"
          onClick={() => setShowModal(false)}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <ModalBody>
        <form>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Title</label>
            <div className="col-sm-10">
              <Input
                defaultValue={newItem.title}
                onChange={(e) => onFieldChange(e, "title")}
                name="title"
                placeholder="Enter title..."
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Description</label>
            <div className="col-sm-10">
              <TextArea
                className="form-control"
                defaultValue={newItem.description}
                onChange={(e) => onFieldChange(e, "description")}
                name="description"
                placeholder="Enter description..."
              ></TextArea>
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Item Type</label>
            <div className="col-sm-10">
              <DropDownList
                defaultValue={newItem.typeStr}
                data={itemTypesProvider}
                name="typeStr"
                onChange={(e) => onFieldChange(e, "typeStr")}
              />
            </div>
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button color="primary" onClick={onAddSave}>
          Save
        </Button>{" "}
      </ModalFooter>
    </Modal>
  );
}
